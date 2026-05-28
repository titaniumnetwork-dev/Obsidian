import { json } from "@sveltejs/kit";

const MAX_STORAGE_BYTES = 5 * 1024 * 1024;

async function getHashKey(input) {
  const buffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input),
  );
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function GET({ platform, locals }) {
  const userId = locals.user?.id;
  if (!userId) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const [lsSaves, idbSaves, lsUsage, idbUsage] =
    await platform.env.USER_SAVES.batch([
      platform.env.USER_SAVES.prepare(
        `SELECT 'localstorage' as type, save_key, size_bytes, updated_at FROM localstorage WHERE user_id = ?`,
      ).bind(userId),
      platform.env.USER_SAVES.prepare(
        `SELECT 'indexeddb' as type, save_key, size_bytes, updated_at FROM indexeddb WHERE user_id = ?`,
      ).bind(userId),
      platform.env.USER_SAVES.prepare(
        `SELECT COALESCE(SUM(size_bytes), 0) as total FROM localstorage WHERE user_id = ?`,
      ).bind(userId),
      platform.env.USER_SAVES.prepare(
        `SELECT COALESCE(SUM(size_bytes), 0) as total FROM indexeddb WHERE user_id = ?`,
      ).bind(userId),
    ]);

  const allSaves = [...lsSaves.results, ...idbSaves.results].sort(
    (a, b) => new Date(b.updated_at) - new Date(a.updated_at),
  );

  const totalUsedBytes =
    (lsUsage.results[0].total || 0) + (idbUsage.results[0].total || 0);

  return json({
    saves: allSaves,
    used: totalUsedBytes,
    limit: MAX_STORAGE_BYTES,
  });
}

export async function POST({ request, platform, locals }) {
  const userId = locals.user?.id;
  if (!userId) return json({ error: "Unauthorized" }, { status: 401 });

  const { key, value, type = "localstorage" } = await request.json();
  const byteSize = new TextEncoder().encode(value).length;

  const targetTable = type === "indexeddb" ? "indexeddb" : "localstorage";
  const otherTable = type === "indexeddb" ? "localstorage" : "indexeddb";

  const [targetUsage, otherUsage] = await platform.env.USER_SAVES.batch([
    platform.env.USER_SAVES.prepare(
      `SELECT COALESCE(SUM(size_bytes), 0) as total FROM ${targetTable} WHERE user_id = ? AND save_key != ?`,
    ).bind(userId, key),
    platform.env.USER_SAVES.prepare(
      `SELECT COALESCE(SUM(size_bytes), 0) as total FROM ${otherTable} WHERE user_id = ?`,
    ).bind(userId),
  ]);

  const newTotalSize =
    (targetUsage.results[0].total || 0) +
    (otherUsage.results[0].total || 0) +
    byteSize;

  if (newTotalSize > MAX_STORAGE_BYTES) {
    return json(
      {
        error: "Storage quota exceeded",
        used: newTotalSize - byteSize,
        limit: MAX_STORAGE_BYTES,
      },
      { status: 413 },
    );
  }

  const hashedFilename = await getHashKey(key);
  const r2Key = `${targetTable}/${userId}/${hashedFilename}.json`;

  await platform.env.SAVES.put(r2Key, value);

  await platform.env.USER_SAVES.prepare(
    `
        INSERT INTO ${targetTable} (id, user_id, save_key, size_bytes, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id, save_key) DO UPDATE SET
            size_bytes = excluded.size_bytes,
            updated_at = CURRENT_TIMESTAMP
    `,
  )
    .bind(crypto.randomUUID(), userId, key, byteSize)
    .run();

  return json({ success: true, newTotalSize, limit: MAX_STORAGE_BYTES });
}
