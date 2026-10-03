import { env } from "cloudflare:workers";

export async function getCatalog(platform, pageUrl) {
  const cache =
    platform?.caches?.default ||
    (typeof caches !== "undefined" ? caches.default : null);
  const cacheRequest = pageUrl
    ? new Request(new URL("/api/catalog", pageUrl))
    : null;

  if (cache && cacheRequest) {
    try {
      const cachedResponse = await cache.match(cacheRequest);
      if (cachedResponse) {
        const cachedCatalog = await cachedResponse.json();
        if (Array.isArray(cachedCatalog)) {
          return cachedCatalog;
        }
      }
    } catch {}
  }

  try {
    const bucket = platform?.env?.FILES ?? env?.FILES;
    if (!bucket) {
      console.warn(
        "Cloudflare R2 binding not found. Configure the FILES bucket in wrangler.json or pass it when running wrangler pages dev.",
      );
      return [];
    }

    const catalogObject = await bucket.get("catalog.json");
    if (!catalogObject) {
      console.warn(
        'Catalog file "catalog.json" was not found in the FILES bucket.',
      );
      return [];
    }

    const catalogData = await catalogObject.json();
    if (!Array.isArray(catalogData)) {
      return [];
    }

    if (cache && cacheRequest) {
      const headers = new Headers({
        "Content-Type": "application/json",
        "Cache-Control":
          "public, max-age=300, s-maxage=300, stale-while-revalidate=86400",
      });
      const response = new Response(JSON.stringify(catalogData), { headers });

      try {
        const cacheWrite = cache.put(cacheRequest, response);
        if (platform?.ctx?.waitUntil) {
          platform.ctx.waitUntil(cacheWrite);
        } else {
          await cacheWrite;
        }
      } catch {}
    }

    return catalogData;
  } catch {
    return [];
  }
}
