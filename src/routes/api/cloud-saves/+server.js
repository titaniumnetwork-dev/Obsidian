import { json } from "@sveltejs/kit";

const MAX_STORAGE_BYTES = 5 * 1024 * 1024;

export async function GET({ platform, locals }) {
  const userId = locals.user?.id;
  if (!userId) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const { results } = await platform.env.USER_SAVES.prepare(
    `
        SELECT save_key, size_bytes, updated_at
        FROM localstorage
        WHERE user_id = ?
        ORDER BY updated_at DESC
    `,
  )
    .bind(userId)
    .all();

  const usageQuery = await platform.env.USER_SAVES.prepare(
    `
        SELECT COALESCE(SUM(size_bytes), 0) as total_used_bytes
        FROM localstorage
        WHERE user_id = ?
    `,
  )
    .bind(userId)
    .first();

  return json({
    saves: results,
    used: usageQuery.total_used_bytes,
    limit: MAX_STORAGE_BYTES,
  });
}

export async function POST({ request, platform, locals }) {
  const userId = locals.user?.id;
  if (!userId) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key, value } = await request.json();
  const byteSize = new TextEncoder().encode(value).length;

  const usageQuery = await platform.env.USER_SAVES.prepare(
    `
        SELECT COALESCE(SUM(size_bytes), 0) as total_used_bytes
        FROM localstorage
        WHERE user_id = ? AND save_key != ?
    `,
  )
    .bind(userId, key)
    .first();

  const newTotalSize = usageQuery.total_used_bytes + byteSize;

  if (newTotalSize > MAX_STORAGE_BYTES) {
    return json(
      {
        error: "Storage quota exceeded",
        used: usageQuery.total_used_bytes,
        limit: MAX_STORAGE_BYTES,
      },
      { status: 413 },
    );
  }

  const r2Key = `saves/${userId}/${key}.json`;
  await platform.env.LOCALSTORAGE.put(r2Key, value);

  await platform.env.USER_SAVES.prepare(
    `
        INSERT INTO localstorage (id, user_id, save_key, size_bytes, updated_at)
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
