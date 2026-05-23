import { redirect } from "@sveltejs/kit";

export const actions = {
  default: async ({ cookies }) => {
    cookies.delete("session_id", { path: "/" });

    throw redirect(303, "/");
  },
};
