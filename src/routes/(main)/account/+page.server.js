import { fail, redirect } from "@sveltejs/kit";

export const load = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(303, "/account/login");
  }

  return {
    user: locals.user,
  };
};

export const actions = {
  delete: async ({ cookies, platform }) => {
    const sessionId = cookies.get("session_id");

    await platform?.env.USERS.prepare("DELETE FROM users WHERE id = ?")
      .bind(sessionId)
      .run();

    cookies.delete("session_id", { path: "/" });
    throw redirect(303, "/");
  },
  uploadAvatar: async ({ request, platform, locals }) => {
    const formData = await request.formData();
    const file = formData.get("avatar");

    if (!file || file.size === 0) {
      return fail(400, { error: "No file provided" });
    }

    if (file.type !== "image/webp") {
      return fail(400, { error: "Invalid format. Server only accepts WebP." });
    }

    const MAX_SIZE = 50 * 1024;
    if (file.size > MAX_SIZE) {
      return fail(400, { error: "File too large. Max size is 50KB." });
    }

    const filename = `${locals.user.id}-${Date.now()}.webp`;

    if (locals.user.avatar_url) {
      await platform.env.AVATARS.delete(locals.user.avatar_url);
    }

    await platform.env.AVATARS.put(filename, file, {
      httpMetadata: { contentType: "image/webp" },
    });

    await platform.env.USERS.prepare(
      "UPDATE users SET avatar_url = ? WHERE id = ?",
    )
      .bind(filename, locals.user.id)
      .run();
  },
};
