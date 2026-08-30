import { getCatalog } from "$lib/catalog.js";

export const load = async ({ fetch }) => {
  const catalogData = await getCatalog(fetch);

  return {
    catalogData,
  };
};
