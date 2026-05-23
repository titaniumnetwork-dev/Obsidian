import { error } from "@sveltejs/kit";

export async function GET({ platform, params }) {
  const avatars = platform?.env?.AVATARS;

  if (!avatars) {
    error(500, "R2 binding 'AVATARS' not found");
  }

  const safePath = params.path.replace(/[^a-zA-Z0-9.-]/g, "");

  if (!safePath) {
    error(400, "Invalid file path");
  }

  const object = await avatars.get(safePath);

  if (!object) {
    error(404, "Avatar not found");
  }

  const headers = new Headers();
  const contentType =
    object.httpMetadata?.contentType || "application/octet-stream";

  headers.set("Content-Type", contentType);
  headers.set("Cache-Control", "public, max-age=604800");

  return new Response(object.body, { headers });
}
