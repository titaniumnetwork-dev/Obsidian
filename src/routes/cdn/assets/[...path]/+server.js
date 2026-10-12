import { error } from "@sveltejs/kit";

function setCommonHeaders(headers, object) {
  const contentType =
    object.httpMetadata?.contentType || "application/octet-stream";
  headers.set("Content-Type", contentType);
  headers.set("ETag", object.httpEtag);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("Accept-Ranges", "bytes");
}

export async function HEAD({ platform, params }) {
  const bucket = platform?.env?.FILES;
  if (!bucket) error(500, "R2 binding not found");

  const cleanPath = params.path.replace(/^\/+/, "");
  const object = await bucket.head(cleanPath);

  if (!object) error(404, "Asset not found");

  const headers = new Headers();
  setCommonHeaders(headers, object);
  headers.set("Content-Length", object.size.toString());

  return new Response(null, { headers });
}

export async function GET({ request, platform, params }) {
  const bucket = platform?.env?.FILES;
  if (!bucket) error(500, "R2 binding not found");

  const cleanPath = params.path.replace(/^\/+/, "");
  const rangeHeader = request.headers.get("Range");
  const etagHeader = request.headers.get("If-None-Match");

  const cache =
    platform?.caches?.default ||
    (typeof caches !== "undefined" ? caches.default : null);

  if (cache && !rangeHeader) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) return cachedResponse;
  }

  let range;
  let start = 0;
  let end = 0;
  let fullSize = 0;

  if (rangeHeader || etagHeader) {
    const meta = await bucket.head(cleanPath);
    if (!meta) error(404, "Asset not found");

    fullSize = meta.size;

    if (etagHeader.includes(meta.httpEtag)) {
      const headers = new Headers();
      setCommonHeaders(headers, meta);
      return new Response(null, { status: 304, headers });
    }

    if (rangeHeader && fullSize > 0) {
      const match = rangeHeader.trim().match(/^bytes=(\d*)-(\d*)$/);
      let isValidSyntax = false;

      if (match) {
        const s = match[1] ? parseInt(match[1], 10) : null;
        const e = match[2] ? parseInt(match[2], 10) : null;

        if (s === null && e !== null) {
          start = Math.max(0, fullSize - e);
          end = fullSize - 1;
          isValidSyntax = true;
        } else if (s !== null) {
          start = s;
          end = e !== null ? Math.min(e, fullSize - 1) : fullSize - 1;
          isValidSyntax = true;
        }

        if (isValidSyntax) {
          if (start >= fullSize || end < start) {
            const headers = new Headers();
            headers.set("Content-Range", `bytes */${fullSize}`);
            headers.set("Accept-Ranges", "bytes");
            return new Response(null, { status: 416, headers });
          }
          range = { offset: start, length: end - start + 1 };
        }
      }
    }
  }

  const object = await bucket.get(cleanPath, range ? { range } : undefined);
  if (!object) error(404, "Asset not found");

  const headers = new Headers();
  setCommonHeaders(headers, object);
  let status = 200;

  if (range) {
    status = 206;
    headers.set("Content-Range", `bytes ${start}-${end}/${fullSize}`);
    headers.set("Content-Length", range.length.toString());
  } else {
    headers.set("Content-Length", object.size.toString());
  }

  const response = new Response(object.body, { status, headers });

  if (status === 200 && platform?.ctx?.waitUntil && cache) {
    platform.ctx.waitUntil(cache.put(request, response.clone()));
  }

  return response;
}
