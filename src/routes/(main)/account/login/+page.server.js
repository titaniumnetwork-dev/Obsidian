import { fail, redirect } from "@sveltejs/kit";
import { bcryptVerify } from "hash-wasm";

export const load = async ({ cookies }) => {
  const sessionId = cookies.get("session_id");
  if (sessionId) throw redirect(303, "/account");
  return {};
};

export const actions = {
  default: async ({ request, platform, cookies }) => {
    const data = await request.formData();
    const email = data.get("email");
    const password = data.get("password");

    const user = await platform?.env.USERS.prepare(
      "SELECT * FROM users WHERE email = ?",
    )
      .bind(email)
      .first();

    if (!user) return fail(400, { error: "User not found" });

    const isValid = await bcryptVerify({
      password: password,
      hash: user.password_hash,
    });

    if (!isValid) return fail(400, { error: "Invalid password", email });

    cookies.set("session_id", user.id, { path: "/", httpOnly: true });
    throw redirect(303, "/account");
  },
};
