import { D1Adapter } from "@auth/d1-adapter";
import { SvelteKitAuth } from "@auth/sveltekit";

export const { handle, signIn, signOut } = SvelteKitAuth({
  adapter: D1Adapter(process.env.USERS),
  providers: [],
  secret: process.env.AUTH_SECRET,
});
