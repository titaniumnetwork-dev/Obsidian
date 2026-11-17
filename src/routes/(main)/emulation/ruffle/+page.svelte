<script>
  import Head from "#lib/components/Head.svelte";
  import { emulators } from "#lib/emulators.js";
  import { storage } from "#lib/storage.svelte.js";
  import { Maximize, RotateCw, Upload, X } from "@lucide/svelte";

  let frame = $state();
  let uploadButton = $state();
  let playerHidden = $state(true);
  let isDragging = $state(false);

  let emuData = emulators.filter((emu) => emu.id === "ruffle")[0];

  const aspectRatio = $derived(
    storage.settings.aspect ? storage.settings.aspect : "h-full w-full",
  );

  function uploadSWF(e) {
    playerHidden = false;
    frame.contentWindow.postMessage({
      type: "run",
      file: e.target.files[0],
    });
  }

  function exit() {
    frame.contentWindow.location.reload();
    uploadButton.value = "";
    playerHidden = true;
  }

  function handleDragOver(e) {
    e.preventDefault();
    isDragging = true;
  }

  function handleDragLeave(e) {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      isDragging = false;
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    isDragging = false;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      playerHidden = false;
      frame.contentWindow.postMessage({
        type: "run",
        file: e.dataTransfer.files[0],
      });
    }
  }
</script>

<Head title={emuData.title} />

<div class="flex flex-col items-center justify-center px-4 mt-auto">
  <div
    class="w-full max-w-xl p-6 bg-card border border-border rounded-xl flex flex-col gap-6"
  >
    <div class="flex flex-col gap-4">
      <div class="flex gap-4 items-center">
        <emuData.icon class="size-8" />
        <div>
          <p>{emuData.title}</p>
          <p class="text-sm text-muted">
            Emulation powered by <a
              class="hover:underline"
              href="https://ruffle.rs/">Ruffle</a
            >
          </p>
        </div>
      </div>
      <label
        data-dragging={isDragging}
        ondragover={handleDragOver}
        ondragleave={handleDragLeave}
        ondrop={handleDrop}
        class="w-full p-12 rounded-lg bg-secondary flex flex-col justify-center items-center cursor-pointer gap-4 border border-dashed
 border-transparent data-[dragging=true]:border-input"
      >
        <div
          class="w-10 h-10 rounded-md flex items-center justify-center border border-border"
        >
          <Upload size="20" />
        </div>
        <div class="flex flex-col items-center gap-2">
          <h2>Upload SWF</h2>
          <p class="text-sm text-muted">
            {#if isDragging}
              Drop file here
            {:else}
              Click to upload or drag and drop a file here
            {/if}
          </p>
        </div>
        <input
          bind:this={uploadButton}
          onchange={uploadSWF}
          type="file"
          accept={emuData.accept}
          class="hidden"
        />
      </label>
    </div>
  </div>
</div>
<div class={playerHidden ? " hidden" : ""}>
  <div
    data-overlay-style={storage.settings.overlay}
    class="group fixed z-20 flex items-center transition-all data-[overlay-style=default]:top-0 data-[overlay-style=default]:right-0 data-[overlay-style=default]:left-0 data-[overlay-style=default]:h-17 data-[overlay-style=default]:px-4 data-[overlay-style=default]:bg-background data-[overlay-style=default]:border-b data-[overlay-style=default]:border-border data-[overlay-style=default]:justify-end data-[overlay-style=compact]:top-3 data-[overlay-style=compact]:right-3 data-[overlay-style=compact]:p-1.5 data-[overlay-style=compact]:bg-card/90 data-[overlay-style=compact]:backdrop-blur-md data-[overlay-style=compact]:border data-[overlay-style=compact]:border-border data-[overlay-style=compact]:rounded-xl data-[overlay-style=compact]:shadow-lg data-[overlay-style=compact]:justify-end"
  >
    <div class="flex items-center gap-1.5 sm:gap-2">
      <button
        onclick={() => frame.requestFullscreen()}
        title="Fullscreen"
        aria-label="Fullscreen"
        class="h-9 group-data-[overlay-style=compact]:w-9 group-data-[overlay-style=default]:px-2.5 bg-card rounded-lg flex gap-1.5 items-center justify-center cursor-pointer border border-input text-sm hover:bg-secondary transition-colors"
      >
        <Maximize size="16" />
        <span class="group-data-[overlay-style=compact]:hidden">Fullscreen</span
        >
      </button>
      <button
        onclick={() => frame.contentWindow.location.reload()}
        title="Reload"
        aria-label="Reload"
        class="h-9 group-data-[overlay-style=compact]:w-9 group-data-[overlay-style=default]:px-2.5 bg-card rounded-lg flex gap-1.5 items-center justify-center cursor-pointer border border-input text-sm hover:bg-secondary transition-colors"
      >
        <RotateCw size="16" />
        <span class="group-data-[overlay-style=compact]:hidden">Reload</span>
      </button>
      <button
        onclick={() => exit()}
        title="Exit"
        aria-label="Exit"
        class="h-9 group-data-[overlay-style=compact]:w-9 group-data-[overlay-style=default]:px-2.5 bg-card rounded-lg flex gap-1.5 items-center justify-center cursor-pointer border border-input text-sm hover:bg-secondary transition-colors"
      >
        <X size="16" />
        <span class="group-data-[overlay-style=compact]:hidden">Exit</span>
      </button>
    </div>
  </div>
  <div
    data-overlay-style={storage.settings.overlay}
    class="fixed data-[overlay-style=default]:top-17 data-[overlay-style=default]:h-[calc(100vh-4.25rem)] data-[overlay-style=compact]:top-0 data-[overlay-style=compact]:h-full bottom-0 right-0 left-0 w-full flex items-center justify-center"
  >
    <iframe
      bind:this={frame}
      title="Emulation Player"
      class={"bg-background select-none max-h-full max-w-full " + aspectRatio}
      src="/launch-emu/ruffle"
      allow="display-capture; autoplay; gamepad"
      sandbox="allow-forms allow-scripts allow-same-origin allow-modals allow-pointer-lock allow-downloads"
      style="isolation: isolate; transform-style: flat;"
    ></iframe>
  </div>
</div>
