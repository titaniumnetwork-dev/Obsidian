<script>
  import { storage } from "$lib/storage.svelte";
  import { Download, Pause, Play, X } from "@lucide/svelte";
  let { data, buttons, link, oncontextmenu, newBadge } = $props();
</script>

<div
  data-cards-style={storage.settings.cards}
  class="group w-full data-[cards-style=default]:aspect-2/3 data-[cards-style=square]:aspect-square bg-cover bg-center flex flex-col relative"
>
  {#if newBadge === true}
    <div
      class="absolute top-4 right-4 h-5 px-2 py-0.5 text-xs rounded-full bg-neutral-800 flex items-center pointer-events-none"
    >
      New
    </div>
  {/if}
  <a class="h-full w-full rounded-radius border border-border" href={link + data.id}>
    <img
      {oncontextmenu}
      draggable="false"
      loading="lazy"
      alt={data.title + " cover"}
      class="w-full h-full object-cover group-data-[cards-style=default]:object-center group-data-[cards-style=square]:object-top cursor-pointer rounded-radius"
      src={"/cdn/assets/assets/" + data.id + "/cover.webp"}
    />
  </a>
  <div class="flex">
    <a
      href={link + data.id}
      class="text-nowrap overflow-hidden text-ellipsis text-sm cursor-pointer pt-2 pr-2 flex-1"
    >
      {data.title}
    </a>
    <div
      class="opacity-0 group-hover:opacity-100 transition-opacity text-text-placeholder flex items-center pt-2"
    >
      {#if buttons === "default"}
        {#if storage.active[data.id]}
          <div class="flex gap-2">
            <button
              aria-label="Pause"
              onclick={(e) => storage.resumeActive(data.id)}
              class="cursor-pointer"
            >
              <Pause size="16" />
            </button>
            <button
              aria-label="Quit"
              onclick={(e) => storage.quitActive(data.id)}
              class="cursor-pointer"
            >
              <X size="18" />
            </button>
          </div>
        {:else}
          <button
            aria-label="Play"
            onclick={(e) => storage.setActive(data.id)}
            class="cursor-pointer"
          >
            <Play size="16" />
          </button>
        {/if}
      {/if}
      {#if buttons === "store"}
        {#if storage.installed.includes(data.id)}
          {#if storage.active[data.id]}
            <div class="flex gap-2">
              <button
                aria-label="Pause"
                onclick={(e) => storage.resumeActive(data.id)}
                class="cursor-pointer"
              >
                <Pause size="16" />
              </button>
              <button
                aria-label="Quit"
                onclick={(e) => storage.quitActive(data.id)}
                class="cursor-pointer"
              >
                <X size="18" />
              </button>
            </div>
          {:else}
            <button
              aria-label="Play"
              onclick={(e) => storage.setActive(data.id)}
              class="cursor-pointer"
            >
              <Play size="16" />
            </button>
          {/if}
        {:else}
          <button
            aria-label="Install"
            onclick={() => storage.install(data.id)}
            class="cursor-pointer"
          >
            <Download size="16" />
          </button>
        {/if}
      {/if}
    </div>
  </div>
</div>
