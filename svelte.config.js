import adapter from "@sveltejs/adapter-cloudflare";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  compilerOptions: {
    //Force runes mode for the project, except for libraries. Can be removed in svelte 6.
    runes: ({ filename }) =>
      filename.split(/[/\\]/).includes("node_modules") ? undefined : true,
  },
  kit: {
    adapter: adapter({
      routes: {
        include: ["/*"],
        //Make sure to update this
        exclude: [
          "<build>",
          "<prerendered>",
          "/assets/*",
          "/emulatorjs/*",
          "/ruffle/*",
          "/favicon.ico",
          "/manifest.json",
        ],
      },
    }),
  },
};

export default config;
