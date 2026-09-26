import { json } from "@sveltejs/kit";

export async function GET({ request, platform }) {
  const cache = caches.default;

  let response = await cache.match(request);
  if (response) {
    return response;
  }

  const bucket = platform?.env?.FILES;
  if (!bucket) {
    console.error("Cloudflare R2 bucket binding not found.");
    return json([]);
  }

  const r2Object = await bucket.get("catalog.json");
  if (!r2Object) {
    console.error("Catalog file not found in R2.");
    return json([]);
  }

  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set(
    "Cache-Control",
    "public, max-age=300, s-maxage=300, stale-while-revalidate=86400",
  );

  if (r2Object.httpEtag) {
    headers.set("ETag", r2Object.httpEtag);
  }

  response = new Response(r2Object.body, { headers });

  if (platform?.context?.waitUntil) {
    platform.context.waitUntil(cache.put(request, response.clone()));
  }

  return response;
}
