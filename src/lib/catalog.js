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
    const bucket = platform?.env?.FILES;
    if (!bucket) {
      return [];
    }

    const catalogObject = await bucket.get("catalog.json");
    if (!catalogObject) {
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
        if (platform?.context?.waitUntil) {
          platform.context.waitUntil(cacheWrite);
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
