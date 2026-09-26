import { error } from "@sveltejs/kit";

export async function GET({ request, platform, params }) {
  const cache =
    platform?.caches?.default ||
    (typeof caches !== "undefined" ? caches.default : null);
  let response = await cache.match(request);

  if (response) {
    return response;
  }

  const bucket = platform?.env?.FILES;
  if (!bucket) {
    error(500, "R2 binding not found");
  }

  const cleanPath = params.path.replace(/^\/+/, "");
  const object = await bucket.get(cleanPath);

  if (!object) {
    error(404, "Asset not found");
  }

  const headers = new Headers();
  const contentType =
    object.httpMetadata?.contentType || "application/octet-stream";

  headers.set("Content-Type", contentType);
  headers.set("ETag", object.httpEtag);

  headers.set("Cache-Control", "public, max-age=31536000, immutable");

  response = new Response(object.body, { headers });

  if (platform?.context?.waitUntil) {
    platform.context.waitUntil(cache.put(request, response.clone()));
  }

  return response;
}
