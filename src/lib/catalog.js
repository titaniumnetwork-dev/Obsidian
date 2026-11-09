import { env, waitUntil } from "cloudflare:workers";

export const offlineCatalog = [
  {
    title: "Temp 1",
    developer: "Developer",
    description: "Description",
    id: "1",
    type: "HTML",
    tags: ["Action"],
    controllerSupport: false,
    internalVersion: "1",
    path: "/index.html",
    dateAdded: 1,
  },
  {
    title: "Temp 2",
    developer: "Developer",
    description: "Description",
    id: "2",
    type: "HTML",
    tags: ["Action"],
    controllerSupport: false,
    internalVersion: "1",
    path: "/index.html",
    dateAdded: 2,
  },
  {
    title: "Temp 3",
    developer: "Developer",
    description: "Description",
    id: "3",
    type: "HTML",
    tags: ["Action"],
    controllerSupport: false,
    internalVersion: "1",
    path: "/index.html",
    dateAdded: 3,
  },
];

const offline = import.meta.env.MODE === "offline";

let memoryCatalog = null;
let memoryCatalogExpiry = 0;

export async function getCatalog(platform, pageUrl) {
  if (offline) {
    return offlineCatalog;
  }

  const now = Date.now();
  if (memoryCatalog && now < memoryCatalogExpiry) {
    return memoryCatalog;
  }

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
          memoryCatalog = cachedCatalog;
          memoryCatalogExpiry = now + 60_000;
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

    const rawText = await catalogObject.text();
    const catalogData = JSON.parse(rawText);
    if (!Array.isArray(catalogData)) {
      return [];
    }

    memoryCatalog = catalogData;
    memoryCatalogExpiry = now + 60_000;

    if (cache && cacheRequest) {
      const headers = new Headers({
        "Content-Type": "application/json",
        "Cache-Control":
          "public, max-age=300, s-maxage=300, stale-while-revalidate=86400",
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Embedder-Policy": "credentialless",
        "Cross-Origin-Resource-Policy": "cross-origin",
      });
      const response = new Response(rawText, { headers });

      try {
        waitUntil(cache.put(cacheRequest, response));
      } catch {}
    }

    return catalogData;
  } catch {
    return [];
  }
}
