import { fail } from "@sveltejs/kit";
import { bcrypt, bcryptVerify } from "hash-wasm";

export const actions = {
  updateUsername: async ({ request, cookies, platform }) => {
    const sessionId = cookies.get("session_id");
    if (!sessionId)
      return fail(401, { field: "username", error: "Not logged in." });

    const formData = await request.formData();
    const username = formData.get("username");

    if (!username)
      return fail(400, {
        field: "username",
        error: "Username cannot be empty.",
      });

    try {
      const existing = await platform?.env.USERS.prepare(
        "SELECT id FROM users WHERE name = ?",
      )
        .bind(username)
        .first();

      if (existing && existing.id !== sessionId) {
        return fail(400, {
          field: "username",
          error: "Username is already taken.",
        });
      }

      await platform?.env.USERS.prepare(
        "UPDATE users SET name = ? WHERE id = ?",
      )
        .bind(username, sessionId)
        .run();
      return { field: "username", success: true };
    } catch (e) {
      return fail(500, {
        field: "username",
        error: "Failed to update username.",
      });
    }
  },

  updateEmail: async ({ request, cookies, platform }) => {
    const sessionId = cookies.get("session_id");
    if (!sessionId)
      return fail(401, { field: "email", error: "Not logged in." });

    const formData = await request.formData();
    const email = formData.get("email");

    if (!email)
      return fail(400, { field: "email", error: "Email cannot be empty." });

    try {
      const existing = await platform?.env.USERS.prepare(
        "SELECT id FROM users WHERE email = ?",
      )
        .bind(email)
        .first();

      if (existing && existing.id !== sessionId) {
        return fail(400, {
          field: "email",
          error: "Email is already registered to another account.",
        });
      }

      await platform?.env.USERS.prepare(
        "UPDATE users SET email = ? WHERE id = ?",
      )
        .bind(email, sessionId)
        .run();
      return { field: "email", success: true };
    } catch (e) {
      return fail(500, { field: "email", error: "Failed to update email." });
    }
  },

  updatePassword: async ({ request, cookies, platform }) => {
    const sessionId = cookies.get("session_id");
    if (!sessionId)
      return fail(401, { field: "password", error: "Not logged in." });

    const formData = await request.formData();
    const oldPassword = formData.get("oldPassword");
    const newPassword = formData.get("newPassword");

    if (!oldPassword || !newPassword) {
      return fail(400, { field: "password", error: "Missing fields" });
    }

    const user = await platform?.env.USERS.prepare(
      "SELECT password_hash FROM users WHERE id = ?",
    )
      .bind(sessionId)
      .first();

    if (!user || !user.password_hash) {
      return fail(400, { field: "password", error: "User not found." });
    }

    try {
      const isCorrect = await bcryptVerify({
        password: oldPassword,
        hash: user.password_hash,
      });

      if (!isCorrect) {
        return fail(400, {
          field: "password",
          error: "Incorrect current password.",
        });
      }
    } catch (e) {
      console.error("Verification error:", e);
      return fail(500, {
        field: "password",
        error: "Error verifying password.",
      });
    }

    try {
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const hash = await bcrypt({
        password: newPassword,
        salt,
        costFactor: 10,
        outputType: "encoded",
      });

      await platform?.env.USERS.prepare(
        "UPDATE users SET password_hash = ? WHERE id = ?",
      )
        .bind(hash, sessionId)
        .run();

      return { field: "password", success: true };
    } catch (e) {
      console.error("Hashing error:", e);
      return fail(500, {
        field: "password",
        error: "Failed to update password.",
      });
    }
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
