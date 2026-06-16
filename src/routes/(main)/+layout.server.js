import { getCatalog } from "$lib/catalog.js";

export const load = async ({ fetch, locals }) => {
  const catalogData = await getCatalog(fetch);

  if (!locals.user || locals.user.banned) {
    return {
      catalogData,
      user: null,
    };
  }

  return {
    catalogData,
    user: locals.user,
  };
};
