import { json } from "@sveltejs/kit";

export async function GET({ cookies, platform }) {
  const sessionId = cookies.get("session_id");

  if (!sessionId) return json({ data: null });

  const user = await platform?.env.USERS.prepare(
    "SELECT storage FROM users WHERE id = ?",
  )
    .bind(sessionId)
    .first();

  if (!user || !user.storage) {
    return json({ data: null });
  }

  return json({ data: JSON.parse(user.storage) });
}

export async function POST({ request, cookies, platform }) {
  const sessionId = cookies.get("session_id");

  if (!sessionId) return json({ success: false, guest: true });

  const body = await request.json();
  const storageString = JSON.stringify(body);

  await platform?.env.USERS.prepare("UPDATE users SET storage = ? WHERE id = ?")
    .bind(storageString, sessionId)
    .run();

  return json({ success: true });
}
