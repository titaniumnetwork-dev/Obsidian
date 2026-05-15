import { getCatalog } from "$lib/catalog.js";
import { error } from "@sveltejs/kit";

export async function load({ fetch, params }) {
  const catalogData = await getCatalog(fetch);

  const currentData = catalogData.find((item) => item.id === params.item);

  if (!currentData) {
    error(404, {
      message: "Not found",
    });
  }

  return { currentData, path: params.path };
}
