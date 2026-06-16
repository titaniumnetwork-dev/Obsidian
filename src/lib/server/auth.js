import { getRequestEvent } from "$app/server";
import { env } from "$env/dynamic/private";
import { defaultStorage } from "$lib/defaultStorage";
import { getDb } from "$lib/server/db";
import * as schema from "$lib/server/db/schema";
import { Avatar, Style } from "@dicebear/core";
import definition from "@dicebear/styles/initials.json" with { type: "json" };
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth/minimal";
import { admin, captcha, haveIBeenPwned, username } from "better-auth/plugins";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { Profanease } from "profanease";
import en from "profanease/langs/en";

const style = new Style(definition);
const filter = new Profanease({ languages: [en] });

export const createAuth = (users, avatars, saves, userSaves) =>
  betterAuth({
    baseURL: env.ORIGIN,
    secret: env.BETTER_AUTH_SECRET,
    emailAndPassword: { enabled: true },
    plugins: [
      admin(),
      username({
        usernameValidator: (usernameText) => {
          const isValidFormat = /^[a-zA-Z0-9_.]+$/.test(usernameText);
          if (!isValidFormat) return false;

          if (filter.check(usernameText)) {
            return false;
          }

          return true;
        },
      }),
      captcha({
        provider: "cloudflare-turnstile",
        secretKey: env.TURNSTILE_SECRET_KEY,
      }),
      haveIBeenPwned({
        customPasswordCompromisedMessage:
          "Please choose a more secure password.",
      }),
      sveltekitCookies(getRequestEvent),
    ],
    disabledPaths: ["/is-username-available"],
    database: drizzleAdapter(getDb(users), { provider: "sqlite", schema }),
    user: {
      deleteUser: {
        enabled: true,
      },
      changeEmail: {
        enabled: true,
        updateEmailWithoutVerification: true,
      },
      additionalFields: {
        storage: {
          type: "string",
          required: false,
        },
      },
    },
    databaseHooks: {
      user: {
        delete: {
          before: async (user) => {
            const [lsFiles, idbFiles] = await Promise.all([
              saves.list({ prefix: `localstorage/${user.id}/` }),
              saves.list({ prefix: `indexeddb/${user.id}/` }),
            ]);

            const keysToDelete = [
              ...lsFiles.objects.map((obj) => obj.key),
              ...idbFiles.objects.map((obj) => obj.key),
            ];

            if (keysToDelete.length > 0) {
              await saves.delete(keysToDelete);
            }

            await userSaves.batch([
              userSaves
                .prepare("DELETE FROM localstorage WHERE user_id = ?")
                .bind(user.id),
              userSaves
                .prepare("DELETE FROM indexeddb WHERE user_id = ?")
                .bind(user.id),
            ]);

            if (user.image) {
              await avatars.delete(user.image);
            }
          },
        },
        create: {
          before: async (user) => {
            const avatarID = crypto.randomUUID();

            if (!user.image) {
              const avatar = new Avatar(style, {
                seed: user.username,
              });

              const svgString = avatar.toString();

              await avatars.put(`${avatarID}.svg`, svgString, {
                httpMetadata: { contentType: "image/svg+xml" },
              });
            }

            let storage = defaultStorage;

            if (user.storage) {
              try {
                const clientData = JSON.parse(user.storage);

                const mergedStorage = {
                  ...defaultStorage,
                  ...clientData,
                  settings: {
                    ...defaultStorage.settings,
                    ...(clientData.settings || {}),
                  },
                };

                storage = JSON.stringify(mergedStorage);
              } catch (e) {
                console.error("Failed to parse storage during sign up", e);
              }
            }

            return {
              data: {
                ...user,
                image: user.image || `${avatarID}.svg`,
                storage,
              },
            };
          },
        },
      },
    },
  });

/**
 * DO NOT USE!
 *
 * This instance is used by the `better-auth` CLI for schema generation ONLY.
 * To access `auth` at runtime, use `event.locals.auth`.
 */
export const auth = createAuth(null);
