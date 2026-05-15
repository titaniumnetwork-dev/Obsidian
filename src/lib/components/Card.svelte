<script>
  import { storage } from "$lib/storage.svelte";
  import { Check, Download, Pause, Play, X } from "@lucide/svelte";
  let { data, buttons = "default", link = "/library/" } = $props();
</script>

<a
  aria-label={data.title}
  href={link + data.id}
  style={"--cover: url('/cdn/assets/" + data.id + "/cover.webp')"}
  data-cards-style={storage.settings.cards}
  class="outline-none group cursor-pointer w-full data-[cards-style=default]:aspect-2/3 data-[cards-style=square]:aspect-square bg-cover bg-center flex flex-col gap-4"
>
  <img
    draggable="false"
    loading="lazy"
    alt={data.title}
    class="w-full h-full rounded-2xl border border-border object-cover group-data-[cards-style=default]:object-center group-data-[cards-style=square]:object-top"
    src={"/cdn/assets/" + data.id + "/cover.webp"}
  />
  <div class="flex justify-between gap-2">
    <p class="text-nowrap overflow-hidden text-ellipsis">{data.title}</p>
    <div
      class="opacity-0 group-hover:opacity-100 transition-opacity text-text-placeholder flex items-center"
    >
      {#if buttons === "default"}
        {#if storage.active[data.id]}
          <div class="flex gap-2">
            <button
              onclick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                storage.resumeActive(data.id);
              }}
              class="cursor-pointer"
            >
              <Pause size="16" />
            </button>
            <button
              onclick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                storage.quitActive(data.id);
              }}
              class="cursor-pointer"
            >
              <X size="16" />
            </button>
          </div>
        {:else}
          <button
            onclick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              storage.setActive(data.id);
            }}
            class="cursor-pointer"
          >
            <Play size="16" />
          </button>
        {/if}
      {/if}
      {#if buttons === "store"}
        {#if storage.installed.includes(data.id)}
          <div>
            <Check size="16" />
          </div>
        {:else}
          <button
            onclick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              storage.install(data.id);
            }}
            class="cursor-pointer"
          >
            <Download size="16" />
          </button>
        {/if}
      {/if}
    </div>
  </div>
</a>
