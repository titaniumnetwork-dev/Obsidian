import { getCatalog } from "$lib/catalog.js";

export async function load({ platform, url }) {
  const catalogData = await getCatalog(platform, url);

  return { catalogData };
}
