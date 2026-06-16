import { error } from "@sveltejs/kit";

export const load = async ({ locals }) => {
  if (!locals.user || locals.user.role !== "admin") {
    return error(404, {
      message: "Not found",
    });
  }

  return {};
};
