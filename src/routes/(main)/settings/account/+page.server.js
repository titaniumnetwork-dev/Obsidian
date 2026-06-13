import { fail } from "@sveltejs/kit";

export const actions = {
  uploadAvatar: async ({ request, platform, locals }) => {
    const formData = await request.formData();
    const file = formData.get("avatar");

    if (!file || file.size === 0) {
      return fail(400, { field: "avatar", error: "No file provided" });
    }

    if (file.type !== "image/webp") {
      return fail(400, {
        field: "avatar",
        error: "Invalid format. Server only accepts WebP.",
      });
    }

    const MAX_SIZE = 50 * 1024;
    if (file.size > MAX_SIZE) {
      return fail(400, {
        field: "avatar",
        error: "File too large. Max size is 50KB.",
      });
    }

    const avatarID = crypto.randomUUID();

    try {
      await platform.env.AVATARS.put(`${avatarID}.webp`, file, {
        httpMetadata: { contentType: "image/webp" },
      });

      if (locals.user.image) {
        await platform.env.AVATARS.delete(locals.user.image);
      }

      await locals.auth.api.updateUser({
        body: {
          image: `${avatarID}.webp`,
        },
        headers: request.headers,
      });
    } catch (error) {
      return fail(400, {
        field: "avatar",
        message: error.message || "Updating profile picture failed",
      });
    }
  },
};
