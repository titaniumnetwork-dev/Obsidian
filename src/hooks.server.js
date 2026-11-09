import { getMetaDataForRoute } from "#lib/metadata.js";
import { sequence } from "@sveltejs/kit/hooks";
import { env, waitUntil } from "cloudflare:workers";

async function securityHeaders({ event, resolve }) {
  event.platform ??= {
    env,
    caches: globalThis.caches,
    ctx: { waitUntil },
  };
  event.platform.ctx ??= event.platform.context ?? event.context ?? { waitUntil };

  const response = await resolve(event);
  if (response.headers.has("Cross-Origin-Resource-Policy")) {
    return response;
  }

  let target = response;
  try {
    target.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  } catch {
    target = new Response(response.body, response);
    target.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  }

  target.headers.set("Cross-Origin-Embedder-Policy", "credentialless");
  target.headers.set("Cross-Origin-Resource-Policy", "cross-origin");
  return target;
}

async function handleSocialBots({ event, resolve }) {
  const url = event.url;
  if (url.pathname.startsWith("/cdn/") || url.pathname.startsWith("/api/")) {
    return resolve(event);
  }

  const userAgent = event.request.headers.get("user-agent") || "";

  const isSocialBot =
    /Discordbot|Twitterbot|facebookexternalhit|LinkedInBot/i.test(userAgent);
  const isGoogleBot =
    /Googlebot|Google-InspectionTool|Storebot-Google|GoogleOther/i.test(
      userAgent,
    );
  const pathSegments = url.pathname.split("/").filter(Boolean);

  if (isSocialBot || isGoogleBot) {
    const metaData = await getMetaDataForRoute(
      pathSegments,
      url,
      event.platform,
    );

    if (metaData) {
      if (isSocialBot) {
        const html = `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="utf-8" />
                <title>${metaData.title}</title>
                <meta property="og:title" content="${metaData.title}" />
                <meta property="og:description" content="${metaData.description}" />
                <meta property="og:image" content="${metaData.image}" />
                <meta property="og:url" content="${url.href}" />
                <meta property="og:type" content="website" />
                ${metaData.siteName ? `<meta property="og:site_name" content="${metaData.siteName}" />` : ""}
                <meta name="twitter:title" content="${metaData.title}" />
                <meta name="twitter:description" content="${metaData.description}" />
                <meta name="twitter:image" content="${metaData.image}" />
                ${metaData.large ? `<meta name="twitter:card" content="summary_large_image">` : ""}
                <meta name="theme-color" content="#e5e5e5">
            </head>
            <body></body>
            </html>`;

        return new Response(html, {
          headers: { "content-type": "text/html;charset=UTF-8" },
        });
      }

      if (isGoogleBot) {
        const googleHeadTags = `
          <title>${metaData.title}</title>
          <meta name="description" content="${metaData.description}" />
          <link rel="icon" type="image/png" href="${url.origin}/assets/logo.png" />
          <link rel="apple-touch-icon" href="${url.origin}/assets/logo.png" />
          <meta property="og:title" content="${metaData.title}" />
          <meta property="og:description" content="${metaData.description}" />
          <meta property="og:image" content="${metaData.image}" />
          <meta property="og:url" content="${url.href}" />
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="${metaData.siteName || "Obsidian"}" />
        `;

        return resolve(event, {
          transformPageChunk: ({ html }) =>
            html
              .replace(/<title>.*?<\/title>/is, "")
              .replace(
                /<link[^>]*rel=["'](?:shortcut |apple-touch-)?icon["'][^>]*>/gi,
                "",
              )
              .replace("<head>", `<head>${googleHeadTags}`),
        });
      }
    }
  }

  return resolve(event);
}

export const handle = sequence(securityHeaders, handleSocialBots);
