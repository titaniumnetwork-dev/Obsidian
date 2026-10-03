<script>
  import { invalidateAll } from "$app/navigation";
  import CBOR from "#lib/cbor-x";
  import Obfuscate from "#lib/components/Obfuscate.svelte";
  import Button from "#lib/components/ui/Button.svelte";
  import Card from "#lib/components/ui/Card.svelte";
  import LittleExport from "#lib/little-export.js";
  import { storage } from "#lib/storage.svelte";
  import { Download, Upload } from "@lucide/svelte";

  async function uploadBackup(file) {
    await LittleExport.importData({
      source: file,
      download: true,
      encoder: new CBOR.Encoder(),
    });

    storage.loadStorage(storage.catalog);
    await invalidateAll();
  }

  async function downloadBackup() {
    await LittleExport.exportData({
      fileName: "Obsidian Backup",
      decoder: new CBOR.Decoder(),
    });
  }

  async function uploadData(file) {
    await LittleExport.importData({
      source: file,
      localStorage: true,
      cookies: false,
      idb: false,
      opfs: false,
      cache: false,
      sessionStorage: false,
      download: true,
      include: {
        localStorage: [
          "settings",
          "installed",
          "playTime",
          "favorites",
          "theme",
          "rounding",
          "hiddenThemes",
        ],
      },
      encoder: new CBOR.Encoder(),
    });

    storage.loadStorage(storage.catalog);
    await invalidateAll();
  }

  async function downloadData() {
    await LittleExport.exportData({
      fileName: "Obsidian Data",
      localStorage: true,
      cookies: false,
      idb: false,
      opfs: false,
      cache: false,
      sessionStorage: false,
      download: true,
      include: {
        localStorage: [
          "settings",
          "installed",
          "playTime",
          "favorites",
          "theme",
          "rounding",
          "hiddenThemes",
        ],
      },
      decoder: new CBOR.Decoder(),
    });
  }

  async function uploadGData(file) {
    await LittleExport.importData({
      source: file,
      download: true,
      exclude: {
        localStorage: [
          "settings",
          "installed",
          "playTime",
          "favorites",
          "theme",
          "rounding",
          "hiddenThemes",
        ],
      },
      encoder: new CBOR.Encoder(),
    });
  }

  async function downloadGData() {
    await LittleExport.exportData({
      fileName: "Obsidian Game Data",
      exclude: {
        localStorage: [
          "settings",
          "installed",
          "playTime",
          "favorites",
          "theme",
          "rounding",
          "hiddenThemes",
        ],
      },
      decoder: new CBOR.Decoder(),
    });
  }
</script>

<div class="grid grid-cols-2 gap-4">
  <Card size="sm">
    <div>
      <p>Backup</p>
      <p class="text-sm text-muted">
        Keep a local Obsidian backup. Your libary, settings, and save data
      </p>
    </div>
    <div class="flex gap-2">
      <div>
        <Button
          variant="outline"
          class="w-full justify-center"
          onclick={(e) => e.target.nextElementSibling.click()}
        >
          <Upload class="pointer-events-none" size="16" />
          <span class="pointer-events-none">Upload Backup</span>
        </Button>
        <input
          class="hidden"
          type="file"
          accept=".tar.gz"
          onchange={async (e) => {
            const file = e.target.files[0];
            if (file) {
              uploadBackup(file);
            }
          }}
        />
      </div>
      <Button onclick={() => downloadBackup()} variant="outline">
        <Download size="16" />
        <span>Download Backup</span>
      </Button>
    </div>
  </Card>
  <Card size="sm">
    <div>
      <p>Data</p>
      <p class="text-sm text-muted">Your entire libary and settings</p>
    </div>
    <div class="flex gap-2">
      <div>
        <Button
          variant="outline"
          class="w-full justify-center"
          onclick={(e) => e.target.nextElementSibling.click()}
        >
          <Upload class="pointer-events-none" size="16" />
          <span class="pointer-events-none">Upload Data</span>
        </Button>
        <input
          class="hidden"
          type="file"
          accept=".tar.gz"
          onchange={async (e) => {
            const file = e.target.files[0];
            if (file) {
              uploadData(file);
            }
          }}
        />
      </div>
      <Button onclick={() => downloadData()} variant="outline">
        <Download size="16" />
        <span>Download Data</span>
      </Button>
    </div>
  </Card>
  <Card size="sm">
    <div>
      <p><Obfuscate text="Game"></Obfuscate> Data</p>
      <p class="text-sm text-muted">
        All save data from <Obfuscate text="games"></Obfuscate>
      </p>
    </div>
    <div class="flex gap-2">
      <div>
        <Button
          variant="outline"
          class="w-full justify-center"
          onclick={(e) => e.target.nextElementSibling.click()}
        >
          <Upload class="pointer-events-none" size="16" />
          <span class="pointer-events-none"
            >Upload <Obfuscate text="Game"></Obfuscate> Data</span
          >
        </Button>
        <input
          class="hidden"
          type="file"
          accept=".tar.gz"
          onchange={async (e) => {
            const file = e.target.files[0];
            if (file) {
              uploadGData(file);
            }
          }}
        />
      </div>
      <Button onclick={() => downloadGData()} variant="outline">
        <Download size="16" />
        <span>Download <Obfuscate text="Game"></Obfuscate> Data</span>
      </Button>
    </div>
  </Card>
</div>
