import { env } from "cloudflare:workers";

async function securityHeaders({ event, resolve }) {
  event.platform ??= {
    env,
    caches: globalThis.caches,
    ctx: event.platform?.ctx,
  };

  const response = await resolve(event);
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Embedder-Policy", "credentialless");
  response.headers.set("Cross-Origin-Resource-Policy", "cross-origin");
  return response;
}

export const handle = securityHeaders;
