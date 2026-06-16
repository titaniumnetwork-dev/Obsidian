import { getCatalog } from "$lib/catalog.js";
import { error } from "@sveltejs/kit";

export async function load({ fetch, params, locals }) {
  const catalogData = await getCatalog(fetch);

  const currentData = catalogData.find((item) => item.id === params.item);

  if (!currentData) {
    error(404, {
      message: "Not found",
    });
  }

  if (!locals.user || locals.user.banned) {
    return {
      catalogData,
      path: params.path,
      user: null,
    };
  }

  return {
    currentData,
    path: params.path,
    user: locals.user || null,
  };
}
