import { routes } from "$lib/emulators";
import { error } from "@sveltejs/kit";

export async function load({ fetch, params }) {
  const validRoute = routes.find((route) => route === params.emulator);

  if (!validRoute) {
    error(404, {
      message: "Not found",
    });
  }

  return {
    emulator: params.emulator,
  };
}
