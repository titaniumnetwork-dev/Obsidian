<script>
  let { data } = $props();

  import Head from "$lib/components/Head.svelte";
  import { emulators, flashEmulators } from "$lib/emulators";
  import { Upload } from "@lucide/svelte";

  let emuData = emulators
    .concat(flashEmulators)
    .filter((emu) => emu.id === data.emulator)[0];
</script>

<Head title={emuData.title} />

<div class="flex flex-col items-center justify-center px-4 my-16">
  <div
    class="w-full max-w-xl p-8 bg-secondary border border-surface rounded-2xl flex flex-col gap-8"
  >
    <div class="flex flex-col gap-4">
      <div class="flex gap-4 items-center">
        <emuData.icon class="w-10 h-10 text-text" />
        <div>
          <h2 class="text-2xl font-bold">{emuData.title}</h2>
          <p class="text-text-placeholder">
            {#if flashEmulators.includes(emuData)}
              Emulation powered by <a
                class="hover:underline"
                href="https://ruffle.rs/">Ruffle</a
              >
            {:else}
              Emulation powered by <a
                class="hover:underline"
                href="https://emulatorjs.org/">EmulatorJS</a
              >
            {/if}
          </p>
        </div>
      </div>
      <label
        class="w-full h-48 rounded-2xl bg-surface border border-border flex flex-col justify-center items-center cursor-pointer gap-4"
      >
        <div
          class="w-14 h-14 bg-primary border border-border-primary rounded-full flex items-center justify-center"
        >
          <Upload class="text-text-inverse" />
        </div>
        <div class="flex flex-col items-center gap-2">
          <h2 class="text-xl">
            {#if flashEmulators.includes(emuData)}
              Select SWF
            {:else}
              Select {emuData.title} ROM
            {/if}
          </h2>
          <p class="text-sm text-text-placeholder">
            Click or drag and drop a file here
          </p>
        </div>
        <input
          type="file"
          accept={emuData.accept}
          class="hidden"
        />
      </label>
    </div>
  </div>
</div>
