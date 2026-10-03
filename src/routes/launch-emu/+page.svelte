<script>
  import "#lib/style/layout.css";
  import { onMount } from "svelte";

  let { data } = $props();

  let enableThreads = false;

  function loadSave() {
    EJS_emulator.storage.states
      .get(EJS_emulator.getBaseFileName() + ".state")
      .then((t) => {
        EJS_emulator.gameManager.loadState(t);
      });
  }

  async function run(core, file) {
    if (window.SharedArrayBuffer) {
      enableThreads = true;
    } else {
      console.warn(
        "Threads are disabled as SharedArrayBuffer is not available. Threads requires two headers to be set when sending you html page. See https://stackoverflow.com/a/68630724",
      );
    }

    const parts = file.name.split(".");

    const script = document.createElement("script");

    window.EJS_player = "#game";
    window.EJS_gameName = parts.shift();
    window.EJS_gameUrl = file;
    window.EJS_core = core;
    window.EJS_startOnLoaded = true;
    window.EJS_threads = enableThreads;
    window.EJS_volume = 1;
    window.EJS_defaultOptions = {
      "save-state-location": "browser",
    };
    window.EJS_onGameStart = function () {
      loadSave();
    };

    script.src = "/emulatorjs/loader.js";
    document.body.appendChild(script);
  }

  onMount(() => {
    window.addEventListener("message", function (e) {
      if (e.data && e.data.type === "run") {
        const core = e.data.core;
        const file = e.data.file;
        run(core, file);
      }
    });
  });
</script>

<div class="h-full w-full" id="game"></div>
