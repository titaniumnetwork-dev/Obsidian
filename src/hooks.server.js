import { sequence } from "@sveltejs/kit/hooks";

async function authHandle({ event, resolve }) {
  const sessionId = event.cookies.get("session_id");

  if (sessionId && event.platform?.env?.USERS) {
    const user = await event.platform.env.USERS.prepare(
      "SELECT id, email, name, avatar_url, join_date FROM users WHERE id = ?",
    )
      .bind(sessionId)
      .first();

    if (user) {
      event.locals.user = user;
    } else {
      event.cookies.delete("session_id", { path: "/" });
    }
  }

  return await resolve(event);
}

async function securityHeaders({ event, resolve }) {
  const response = await resolve(event);
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Embedder-Policy", "credentialless");
  response.headers.set("Cross-Origin-Resource-Policy", "cross-origin");
  return response;
}

export const handle = sequence(authHandle, securityHeaders);
