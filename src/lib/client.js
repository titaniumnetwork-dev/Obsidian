import { env } from "$env/dynamic/public";
import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/svelte";

export const authClient = createAuthClient({
  baseURL: env.ORIGIN,
  plugins: [adminClient()],
});
