import { json } from "@sveltejs/kit";

export async function GET({ setHeaders, platform }) {
  setHeaders({
    "Cache-Control": "public, max-age=3600, s-maxage=3600",
    "Content-Type": "application/json",
  });

  const bucket = platform?.env?.GAMES;

  if (!bucket) {
    console.error("Cloudflare R2 bucket binding not found.");
    return json([]);
  }

  const r2Object = await bucket.get("catalog.json");

  if (!r2Object) {
    console.error("Catalog file not found in R2.");
    return json([]);
  }

  return new Response(r2Object.body);
}
