import { getCatalog } from "$lib/catalog.js";

export async function load({ fetch, locals }) {
  const catalogData = await getCatalog(fetch);

  return {
    catalogData,
    user: locals.user || null,
  };
}
