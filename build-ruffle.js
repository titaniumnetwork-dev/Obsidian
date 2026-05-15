import { cpSync, mkdirSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname } from "node:path";

const require = createRequire(import.meta.url);
const ruffleDir = dirname(require.resolve("@ruffle-rs/ruffle/package.json"));

rmSync("static/ruffle", { recursive: true, force: true });
mkdirSync("static", { recursive: true });
cpSync(ruffleDir, "static/ruffle", { recursive: true });

console.log("Copied Ruffle files to static/ruffle/");
