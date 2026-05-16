<script>
  import "$lib/style/layout.css";
  import { onMount } from "svelte";

  let { data } = $props();

  let enableThreads = false;

  function getCore(ext) {
    if (["fds", "nes", "unif", "unf"].includes(ext)) return "nes";

    if (["smc", "fig", "sfc", "gd3", "gd7", "dx2", "bsx", "swc"].includes(ext))
      return "snes";

    if (["z64", "n64"].includes(ext)) return "n64";

    if (["pce"].includes(ext)) return "pce";

    if (["ngp", "ngc"].includes(ext)) return "ngp";

    if (["ws", "wsc"].includes(ext)) return "ws";

    if (["col", "cv"].includes(ext)) return "coleco";

    if (["d64"].includes(ext)) return "vice_x64sc";

    if (["nds", "gba", "gb", "z64", "n64"].includes(ext)) return ext;
  }

  function loadSave() {
    EJS_emulator.storage.states
      .get(EJS_emulator.getBaseFileName() + ".state")
      .then((t) => {
        EJS_emulator.gameManager.loadState(t);
      });
  }

  async function run(url) {
    if (window.SharedArrayBuffer) {
      enableThreads = true;
    } else {
      console.warn(
        "Threads are disabled as SharedArrayBuffer is not available. Threads requires two headers to be set when sending you html page. See https://stackoverflow.com/a/68630724",
      );
    }

    const parts = url.split(".");
    const core = getCore(parts.pop());

    const script = document.createElement("script");

    window.EJS_player = "#game";
    window.EJS_gameName = parts.shift();
    window.EJS_gameUrl = "/" + url;
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
    run(data.rom);
  });
</script>

<svelte:head>
  <style>
    .ejs_loading_text,
    .ejs_context_menu,
    .ejs_menu_bar {
      display: none !important;
    }
  </style>
</svelte:head>

<div class="h-full w-full" id="game"></div>
