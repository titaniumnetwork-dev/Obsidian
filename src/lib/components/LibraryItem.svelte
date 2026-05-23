<script>
  import { goto } from "$app/navigation";
  import { formatLastPlayed, formatPlaytime } from "$lib/formatUtils";
  import { storage } from "$lib/storage.svelte.js";
  import {
    ChartPie,
    Clock,
    Cloud,
    Download,
    Ellipsis,
    Gamepad2,
    Keyboard,
    Pause,
    Play,
    Share,
    Star,
    Tag,
    Trash,
    User,
    X,
  } from "@lucide/svelte";

  let { data } = $props();

  let optionsMenu = $state();

  const keybinds = $derived(storage.keybinds[data.currentData.id] || {});
</script>

<div class="p-4 pt-0 flex flex-col gap-4 item">
  <div
    style={"--hero: url('/cdn/assets/assets/" + data.currentData.id + "/hero.webp')"}
    class="relative [background:linear-gradient(to_bottom,var(--color-overlay)_0%,var(--theme-background)_100%)_padding-box,var(--hero)center/cover_padding-box,var(--color-surface)] w-full h-112 flex flex-col items-start justify-between p-8 pb-4 gap-4 rounded-t-2xl border-x border-t border-transparent"
  >
    <div
      class="pointer-events-none absolute -inset-x-px -top-px bottom-0 rounded-t-2xl border-x border-t border-background mask-[linear-gradient(to_bottom,transparent_50%,black_100%)]"
    ></div>
    <div
      class="pointer-events-none absolute -inset-x-px -top-px bottom-0 rounded-t-2xl border-x border-t border-border mask-[linear-gradient(to_bottom,black_50%,transparent_100%)]"
    ></div>
    <div class="flex flex-wrap gap-4 ml-auto">
      {#each data.currentData.tags as tag}
        <button
          onclick={() => {
            storage.updateSetting("tagFilter", [tag]);
            goto("/library");
          }}
          class="px-4 py-1 text-sm rounded-full bg-surface border border-border flex items-center cursor-pointer"
          >{tag}</button
        >
      {/each}
    </div>
    <div class="w-full">
      <h1 class="text-6xl font-bold mb-4 sm:w-2/3">{data.currentData.title}</h1>
      <div class="flex gap-4">
        <div class="flex gap-2">
          {#if storage.installed.includes(data.currentData.id)}
            {#if storage.active[data.currentData.id]}
              <button
                onclick={() => storage.resumeActive(data.currentData.id)}
                class="bg-primary px-14 py-2 cursor-pointer rounded-full flex gap-2 items-center text-text-inverse border border-border-primary"
              >
                <Pause size="20" />
                <span>Resume</span>
              </button>
              <button
                aria-label="Quit"
                onclick={() => storage.quitActive(data.currentData.id)}
                class="bg-primary w-10 h-10 cursor-pointer rounded-full flex justify-center items-center text-text-inverse border border-border-primary"
              >
                <X size="20" />
              </button>
            {:else}
              <button
                onclick={() => storage.setActive(data.currentData.id)}
                class="bg-primary px-14 py-2 cursor-pointer rounded-full flex gap-2 items-center text-text-inverse border border-border-primary"
              >
                <Play size="20" />
                <span>Play</span>
              </button>
            {/if}
            <button
              aria-label="Share"
              onclick={async () =>
                await navigator.share({
                  title: data.currentData.title,
                  url: "/store/" + data.currentData.id,
                })}
              class="bg-surface h-10 w-10 cursor-pointer rounded-full flex items-center justify-center border border-border"
            >
              <Share size="20" />
            </button>
            <button
              popovertarget="options"
              aria-label="Options"
              class="[anchor-name:--options-button] bg-surface h-10 w-10 cursor-pointer rounded-full flex items-center justify-center border border-border"
            >
              <Ellipsis size="20" />
            </button>
            <div
              popover="auto"
              id="options"
              bind:this={optionsMenu}
              class="[&:popover-open]:flex flex-col bg-secondary rounded-xl text-text [position-anchor:--options-button]
              top-[calc(anchor(bottom)-7.5rem)] left-[calc(anchor(right)-2.5rem)] border border-surface"
            >
              {#if storage.favorites.includes(data.currentData.id)}
                <button
                  onclick={() =>
                    storage.removeFavorite(data.currentData.id) &
                    optionsMenu.hidePopover()}
                  class="px-4 py-2 cursor-pointer transition-colors bg-becondary hover:bg-surface flex items-center gap-2 text-sm"
                >
                  <Star size="20" class="fill-text" />
                  <span>Remove Favorite</span>
                </button>
              {:else}
                <button
                  onclick={() =>
                    storage.addFavorite(data.currentData.id) &
                    optionsMenu.hidePopover()}
                  class="px-4 py-2 cursor-pointer transition-colors bg-becondary hover:bg-surface flex items-center gap-2 text-sm"
                >
                  <Star size="20" />
                  <span>Add Favorite</span>
                </button>
              {/if}
              <button
                onclick={() =>
                  storage.uninstall(data.currentData.id) &
                  optionsMenu.hidePopover() &
                  goto("/library", { replaceState: true })}
                class="px-4 py-2 cursor-pointer transition-colors bg-secondary hover:bg-surface flex items-center gap-2 text-sm"
              >
                <Trash size="20" />
                <span>Uninstall</span>
              </button>
            </div>
          {:else}
            <button
              onclick={() =>
                storage.install(data.currentData.id) &
                goto("/library/" + data.currentData.id, { replaceState: true })}
              class="bg-primary px-14 py-2 cursor-pointer rounded-full flex gap-2 items-center text-text-inverse border border-border-primary"
            >
              <Download size="20" />
              <span>Install</span>
            </button>
          {/if}
        </div>
        <div class="flex gap-4 ml-auto overflow-scroll">
          <div
            class="flex items-center bg-surface rounded-xl px-4 py-2 gap-2 text-sm border border-border whitespace-nowrap"
          >
            <Clock size="20" />
            <span
              >{storage.playTime[data.currentData.id]?.lastPlayed
                ? formatLastPlayed(
                    storage.playTime[data.currentData.id]?.lastPlayed,
                  )
                : "Never Played"}</span
            >
          </div>
          <div
            class="flex items-center bg-surface rounded-xl px-4 py-2 gap-2 text-sm border border-border whitespace-nowrap"
          >
            <ChartPie size="20" />
            <span
              >{storage.playTime[data.currentData.id]?.playTime
                ? formatPlaytime(
                    storage.playTime[data.currentData.id]?.playTime,
                  )
                : "No Play Time"}</span
            >
          </div>
          <div
            class="flex items-center bg-surface rounded-xl px-4 py-2 gap-2 text-sm border border-border whitespace-nowrap"
          >
            <User size="20" />
            <span>{data.currentData.developer}</span>
          </div>
          {#if data.currentData.version}
            <div
              class="flex items-center bg-surface rounded-xl px-4 py-2 gap-2 text-sm border border-border whitespace-nowrap"
            >
              <Tag size="20" />
              <span>{data.currentData.version}</span>
            </div>
          {/if}
          {#if data.currentData.cloudSave}
            <div
              class="flex items-center bg-surface rounded-xl px-4 py-2 gap-2 text-sm border border-border whitespace-nowrap"
            >
              <Cloud size="20" />
              <span>Cloud Save</span>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
  <div class="sm:w-2/3 ml-8">
    <p>{data.currentData.description}</p>
  </div>
</div>
