import { getCatalog } from "#lib/catalog.js";

export async function getMetaDataForRoute(pathSegments, url, platform) {
  const [section, slug] = pathSegments;
  const origin = url.origin;

  const catalogData = await getCatalog(platform, url);

  if ((section === "library" || section === "store") && slug) {
    const currentData = catalogData.find((g) => g.id === slug);

    if (currentData) {
      return {
        title: `${currentData.title}`,
        siteName: "Obsidian",
        description: `${currentData.description}`,
        image: `${origin}/cdn/assets/assets/${slug}/cover.webp`,
        large: true,
      };
    }
  }

  return {
    title: "Obsidian",
    description: "Obsidian is your ultimate web-based game library. Dive into a massive collection of classic and modern online games, preserved Flash masterpieces, and emulated retro classics directly in your browser.",
    image: `${origin}/assets/logo-512.png`,
  };
}
