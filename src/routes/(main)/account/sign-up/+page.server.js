import { defaultStorage } from "$lib/defaultStorage";
import { fail, redirect } from "@sveltejs/kit";
import { bcrypt } from "hash-wasm";

function generateIdenticon(seedString) {
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash << 5) - hash + seedString.charCodeAt(i);
    hash |= 0;
  }

  const hue = Math.abs(hash) % 360;
  const color = `hsl(${hue}, 70%, 50%)`;

  const grid = [];
  for (let i = 0; i < 15; i++) {
    grid.push(Math.abs(hash >> i) % 2 === 0);
  }

  let rects = "";
  const size = 16;

  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const indexCol = col > 2 ? 4 - col : col;
      const index = row * 3 + indexCol;

      if (grid[index]) {
        rects += `<rect x="${col * size}" y="${row * size}" width="${size}" height="${size}" fill="${color}" />`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
    <rect width="80" height="80" fill="#f0f0f0"/>
    <g>${rects}</g>
  </svg>`;
}

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
    const name = data.get("username");
    const clientStorage = data.get("local_storage");
    const clientData = JSON.parse(clientStorage);
    let storageToSave = JSON.stringify(defaultStorage);
    if (clientStorage) {
      storageToSave = JSON.stringify({ ...defaultStorage, ...clientData });
    }

    if (!email || !password || !name || !clientStorage)
      return fail(400, { error: "Missing fields" });

    try {
      const existing = await platform?.env.USERS.prepare(
        "SELECT email, name FROM users WHERE email = ? OR name = ?",
      )
        .bind(email, name)
        .first();

      if (existing) {
        if (existing.name === name)
          return fail(400, { error: "Username is already taken" });
        if (existing.email === email)
          return fail(400, { error: "Email is already registered" });
      }

      const userId = crypto.randomUUID();
      const salt = crypto.getRandomValues(new Uint8Array(16));

      const hash = await bcrypt({
        password: password,
        salt,
        costFactor: 10,
        outputType: "encoded",
      });

      const svgString = generateIdenticon(userId);
      const avatarFilename = `${userId}-default.svg`;

      await Promise.all([
        platform.env.AVATARS.put(avatarFilename, svgString, {
          httpMetadata: { contentType: "image/svg+xml" },
        }),
        platform.env.USERS.prepare(
          "INSERT INTO users (id, email, password_hash, name, storage, avatar_url) VALUES (?, ?, ?, ?, ?, ?)",
        )
          .bind(userId, email, hash, name, storageToSave, avatarFilename)
          .run(),
      ]);

      cookies.set("session_id", userId, {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      });
    } catch (e) {
      console.error("Signup error:", e);
      return fail(500, { error: "Account creation failed" });
    }

    throw redirect(303, "/account");
  },
};
