import { redirect } from "@sveltejs/kit";

export const load = ({ locals }) => {
  if (locals.user) {
    return redirect(302, "/account");
  }

  return {};
};
