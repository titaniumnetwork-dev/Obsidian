import { getMetaDataForRoute } from "#lib/metadata.js";
import { sequence } from "@sveltejs/kit/hooks";
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

async function handleSocialBots({ event, resolve }) {
  const userAgent = event.request.headers.get("user-agent") || "";
  const url = event.url;

  const isSocialBot =
    /Discordbot|Twitterbot|facebookexternalhit|LinkedInBot/i.test(userAgent);
  const pathSegments = url.pathname.split("/").filter(Boolean);

  if (isSocialBot) {
    const metaData = await getMetaDataForRoute(
      pathSegments,
      url,
      event.platform,
    );

    if (metaData) {
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
  }

  return resolve(event);
}

export const handle = sequence(securityHeaders, handleSocialBots);
