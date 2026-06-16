import { building } from "$app/environment";
import { createAuth } from "$lib/server/auth";
import { sequence } from "@sveltejs/kit/hooks";
import { svelteKitHandler } from "better-auth/svelte-kit";

const handleBetterAuth = async ({ event, resolve }) => {
  if (!event.platform?.env?.USERS)
    throw new Error('D1 binding "USERS" not found');

  event.locals.auth = createAuth(
    event.platform.env.USERS,
    event.platform.env.AVATARS,
    event.platform.env.SAVES,
    event.platform.env.USER_SAVES,
  );

  const { auth } = event.locals;
  const session = await auth.api.getSession({ headers: event.request.headers });

  if (session) {
    event.locals.session = session.session;
    event.locals.user = session.user;
  }

  return svelteKitHandler({ event, resolve, auth, building });
};

async function securityHeaders({ event, resolve }) {
  const response = await resolve(event);
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Embedder-Policy", "credentialless");
  response.headers.set("Cross-Origin-Resource-Policy", "cross-origin");
  return response;
}

export const handle = sequence(handleBetterAuth, securityHeaders);

