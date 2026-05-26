import { json } from "@sveltejs/kit";

export async function GET({ params, platform, locals }) {
  const userId = locals.user?.id;
  if (!userId) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key } = params;
  const r2Key = `saves/${userId}/${key}.json`;

  const object = await platform.env.LOCALSTORAGE.get(r2Key);

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
