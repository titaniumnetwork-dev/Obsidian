import _7z from "7zip-min";
import { createWriteStream, existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

const TARGET_DIR = path.resolve(process.cwd(), "static/emulatorjs");
const TEMP_DIR = path.resolve(process.cwd(), "emulatorjs_temp");
const TEMP_7Z = path.join(TEMP_DIR, "emulatorjs.7z");

try {
  await fs.rm(TEMP_DIR, { recursive: true, force: true });
  await fs.mkdir(TEMP_DIR, { recursive: true });

  const apiResponse = await fetch(
    "https://api.github.com/repos/EmulatorJS/EmulatorJS/releases/latest",
  );
  if (!apiResponse.ok) throw new Error(`API Error: ${apiResponse.statusText}`);

  const release = await apiResponse.json();

  const asset = release.assets.find((a) => a.name.endsWith(".7z"));
  if (!asset) throw new Error("No .7z release found!");

  const zipResponse = await fetch(asset.browser_download_url);
  if (!zipResponse.ok)
    throw new Error(`Download failed: ${zipResponse.statusText}`);

  await pipeline(
    Readable.fromWeb(zipResponse.body),
    createWriteStream(TEMP_7Z),
  );

  await _7z.unpack(TEMP_7Z, TEMP_DIR);

  let dataPath = path.join(TEMP_DIR, "data");

  if (!existsSync(dataPath)) {
    throw new Error("Could not find /data/ folder in the extracted archive.");
  }

  await fs.mkdir(TARGET_DIR, { recursive: true });

  const filesToMove = await fs.readdir(dataPath);
  for (const file of filesToMove) {
    const oldPath = path.join(dataPath, file);
    const newPath = path.join(TARGET_DIR, file);

    await fs.cp(oldPath, newPath, { recursive: true });
  }

  await fs.rm(TEMP_DIR, { recursive: true, force: true });

  console.log(`Copied Emulatorjs files to static/emulatorjs/`);
} catch (error) {
  console.error("Error copying Emulatorjs files", error.message);
}
