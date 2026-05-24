import { defaultStorage } from "$lib/defaultStorage";
import { fail, redirect } from "@sveltejs/kit";
import bcrypt from "bcryptjs";

function generateIdenticon(seedString) {
  let hash = 2166136261 >>> 0;
  for (let i = 0; i < seedString.length; i++) {
    hash ^= seedString.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  hash >>>= 0;

  let seed = hash;
  const random = () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const palettes = [
    ["#ff9a9e", "#fecfef"],
    ["#a18cd1", "#fbc2eb"],
    ["#84fab0", "#8fd3f4"],
    ["#fa709a", "#fee140"],
    ["#30cfd0", "#330867"],
    ["#fccb90", "#d57eeb"],
    ["#4facfe", "#00f2fe"],
    ["#43e97b", "#38f9d7"],
    ["#fa71cd", "#c471f5"],
  ];

  const paletteIndex = Math.floor(random() * palettes.length);
  const [color1, color2] = palettes[paletteIndex];

  const gradientId = `bg-grad-${hash}`;

  const gradAngle = random() * 360;
  const gradX1 = Math.round(50 + 50 * Math.cos((gradAngle * Math.PI) / 180));
  const gradY1 = Math.round(50 + 50 * Math.sin((gradAngle * Math.PI) / 180));
  const gradX2 = Math.round(
    50 + 50 * Math.cos(((gradAngle + 180) * Math.PI) / 180),
  );
  const gradY2 = Math.round(
    50 + 50 * Math.sin(((gradAngle + 180) * Math.PI) / 180),
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="80" height="80">
    <defs>
      <linearGradient id="${gradientId}" x1="${gradX1}%" y1="${gradY1}%" x2="${gradX2}%" y2="${gradY2}%">
        <stop offset="0%" stop-color="${color1}" />
        <stop offset="100%" stop-color="${color2}" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="12" fill="url(#${gradientId})" />
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
    const confirmPassword = data.get("confirmPassword");
    const name = data.get("username");
    const clientStorage = data.get("local_storage");
    const clientData = JSON.parse(clientStorage);
    let storageToSave = JSON.stringify(defaultStorage);
    if (clientStorage) {
      storageToSave = JSON.stringify({ ...defaultStorage, ...clientData });
    }

    if (!email || !password || !confirmPassword || !name || !clientStorage)
      return fail(400, { error: "Missing fields" });

    if (password !== confirmPassword) {
      return fail(400, { error: "Passwords do not match" });
    }
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
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      const svgString = generateIdenticon(userId);
      const avatarFilename = `${userId}-default.svg`;

      await Promise.all([
        platform.env.AVATARS.put(avatarFilename, svgString, {
          httpMetadata: { contentType: "image/svg+xml" },
        }),
        platform.env.USERS.prepare(
          "INSERT INTO users (id, email, password_hash, name, storage, avatar_url, join_date) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
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
