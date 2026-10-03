import { getCatalog } from "#lib/catalog.js";
import { error } from "@sveltejs/kit";

export async function load({ platform, params, url }) {
  const catalogData = await getCatalog(platform, url);

  const currentData = catalogData.find((g) => g.id === params.item);

  if (!currentData) {
    error(404, {
      message: "Not found",
    });
  }

  return { currentData };
}
