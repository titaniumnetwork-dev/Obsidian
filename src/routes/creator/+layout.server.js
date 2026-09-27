import { getCatalog } from "$lib/catalog.js";

export const load = async ({ platform, url }) => {
  const catalogData = await getCatalog(platform, url);

  return {
    catalogData,
  };
};
