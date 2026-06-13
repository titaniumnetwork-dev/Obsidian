import { json } from "@sveltejs/kit";

export async function GET({ locals, platform }) {
  const userId = locals.user?.id;

  if (!userId) return json({ data: null });

  const userData = await platform?.env.USERS.prepare(
    "SELECT storage FROM user WHERE id = ?",
  )
    .bind(userId)
    .first();

  if (!userData || !userData.storage) {
    return json({ data: null });
  }

  return json({ data: JSON.parse(userData.storage) });
}

export async function POST({ request, locals, platform }) {
  const userId = locals.user?.id;

  if (!userId) return json({ success: false, guest: true });

  const body = await request.json();
  const storageString = JSON.stringify(body);

  await platform?.env.USERS.prepare("UPDATE user SET storage = ? WHERE id = ?")
    .bind(storageString, userId)
    .run();

  return json({ success: true });
}
