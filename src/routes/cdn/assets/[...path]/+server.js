import { error } from "@sveltejs/kit";

export async function GET({ platform, params }) {
  const bucket = platform?.env?.GAMES;

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
  headers.set("Cache-Control", "public, max-age=604800");

  return new Response(object.body, { headers });
}
