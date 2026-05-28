import { json } from "@sveltejs/kit";

async function getHashKey(input) {
  const buffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input),
  );
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function GET({ params, url, platform, locals }) {
  const userId = locals.user?.id;
  if (!userId) return json({ error: "Unauthorized" }, { status: 401 });

  const { key } = params;
  const type =
    url.searchParams.get("type") === "indexeddb" ? "indexeddb" : "localstorage";

  const hashedFilename = await getHashKey(key);
  const r2Key = `${type}/${userId}/${hashedFilename}.json`;

  const object = await platform.env.SAVES.get(r2Key);

  if (!object) {
    return json({ error: "Save file not found in cloud" }, { status: 404 });
  }

  const saveData = await object.text();

  return new Response(saveData, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
