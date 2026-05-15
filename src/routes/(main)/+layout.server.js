import { getCatalog } from "$lib/catalog.js";

export async function load({ fetch }) {
  const catalogData = await getCatalog(fetch);

  return { catalogData };
}
