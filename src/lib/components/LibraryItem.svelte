<script>
  import { goto } from "$app/navigation";
  import { collections } from "$lib/collections";
  import ContextMenu from "$lib/components/ContextMenu.svelte";
  import { formatLastPlayed, formatPlaytime } from "$lib/formatUtils";
  import { storage } from "$lib/storage.svelte.js";
  import {
    ChartPie,
    Check,
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
  let contextMenu = $state();
  let contextMenuItem = $state();

  const keybinds = $derived(storage.keybinds[data.currentData.id] || {});

  const collectionData = $derived(
    data.currentData.collection &&
      storage.catalog.filter((i) =>
        collections[data.currentData.collection].items.includes(i.id),
      ),
  );
</script>

<ContextMenu bind:this={contextMenu}>
  {#if contextMenuItem && storage.installed.includes(contextMenuItem.id)}
    <button
      onclick={() =>
        goto("/library/" + contextMenuItem.id) & contextMenu?.close()}
      class="w-full rounded-lg bg-primary p-2 text-sm cursor-pointer flex items-center gap-2 text-text-inverse border border-border-primary"
    >
      <Check size="16" />
      <span>View in Library</span>
    </button>
    <button
      onclick={() =>
        storage.uninstall(contextMenuItem.id) & contextMenu?.close()}
      class="w-full rounded-lg transition-colors bg-surface hover:bg-border p-2 text-sm cursor-pointer flex items-center gap-2"
    >
      <Trash size="16" />
      <span>Uninstall</span>
    </button>
  {:else}
    <button
      onclick={() => storage.install(contextMenuItem.id) & contextMenu?.close()}
      class="w-full rounded-lg bg-primary p-2 text-sm cursor-pointer flex items-center gap-2 text-text-inverse border border-border-primary"
    >
      <Download size="16" />
      <span>Install</span>
    </button>
  {/if}
</ContextMenu>

<div class="p-4 flex flex-col gap-4 item">
  <div
    style={"--hero: url('/cdn/assets/assets/" +
      data.currentData.id +
      "/hero.webp')"}
    class="relative [background:linear-gradient(to_bottom,var(--color-overlay)_0%,var(--theme-background)_100%)_padding-box,var(--hero)center/cover_padding-box,var(--color-surface)] w-full h-112 flex flex-col items-start justify-between p-4 gap-4 rounded-t-radius border-x border-t border-transparent"
  >
    <div
      class="pointer-events-none absolute -inset-x-px -top-px bottom-0 rounded-t-2xl border-x border-t border-background mask-[linear-gradient(to_bottom,transparent_50%,black_100%)]"
    ></div>
    <div
      class="pointer-events-none absolute -inset-x-px -top-px bottom-0 rounded-t-2xl border-x border-t border-border mask-[linear-gradient(to_bottom,black_50%,transparent_100%)]"
    ></div>
    <div class="flex flex-wrap gap-2 ml-auto">
      {#each data.currentData.tags as tag}
        <button
          onclick={() => {
            storage.updateSetting("tagFilter", [tag]);
            goto("/library");
          }}
          class="h-6 px-2 py-0.5 text-xs rounded-full bg-neutral-800 flex items-center cursor-pointer"
        >
          {tag}
        </button>
      {/each}
    </div>
    <div class="w-full">
      <h1 class="text-6xl font-bold mb-4 sm:w-2/3">{data.currentData.title}</h1>
      <div class="flex gap-2">
        <div class="flex gap-2">
          {#if storage.installed.includes(data.currentData.id)}
            {#if storage.active[data.currentData.id]}
              <button
                onclick={() => storage.resumeActive(data.currentData.id)}
                class="bg-primary h-9 px-14 py-2.5 cursor-pointer rounded-full flex gap-2 items-center text-text-inverse border border-border-primary text-sm"
              >
                <Pause size="16" />
                <span>Resume</span>
              </button>
              <button
                aria-label="Quit"
                onclick={() => storage.quitActive(data.currentData.id)}
                class="bg-surface size-9 cursor-pointer rounded-full flex items-center justify-center border border-border"
              >
                <X size="16" />
              </button>
            {:else}
              <button
                onclick={() => storage.setActive(data.currentData.id)}
                class="bg-primary h-9 px-14 py-2.5 cursor-pointer rounded-full flex gap-2 items-center text-text-inverse border border-border-primary text-sm"
              >
                <Play size="16" />
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
              class="bg-surface size-9 cursor-pointer rounded-full flex items-center justify-center border border-border"
            >
              <Share size="16" />
            </button>
            <button
              popovertarget="options"
              aria-label="Options"
              class="[anchor-name:--options-button] bg-surface size-9 cursor-pointer rounded-full flex items-center justify-center border border-border"
            >
              <Ellipsis size="16" />
            </button>
            <div
              popover="auto"
              id="options"
              bind:this={optionsMenu}
              class="[&:popover-open]:flex flex-col bg-neutral-900 rounded-lg text-text [position-anchor:--options-button]
              [position-area:top_span-right] border border-input p-1 mb-2.5 min-w-36"
            >
              {#if storage.favorites.includes(data.currentData.id)}
                <button
                  onclick={() =>
                    storage.removeFavorite(data.currentData.id) &
                    optionsMenu.hidePopover()}
                  class="px-2 py-1.5 gap-1.5 rounded-md cursor-pointer transition-colors bg-neutral-900 hover:bg-neutral-800 flex items-center text-sm"
                >
                  <Star size="16" class="fill-text" />
                  <span>Remove Favorite</span>
                </button>
              {:else}
                <button
                  onclick={() =>
                    storage.addFavorite(data.currentData.id) &
                    optionsMenu.hidePopover()}
                  class="px-2 py-1.5 gap-1.5 rounded-md cursor-pointer transition-colors bg-neutral-900 hover:bg-neutral-800 flex items-center text-sm"
                >
                  <Star size="16" />
                  <span>Add Favorite</span>
                </button>
              {/if}
              <button
                onclick={() =>
                  storage.uninstall(data.currentData.id) &
                  optionsMenu.hidePopover() &
                  goto("/library", { replaceState: true })}
                class="px-2 py-1.5 gap-1.5 rounded-md cursor-pointer transition-colors bg-neutral-900 hover:bg-neutral-800 flex items-center text-sm"
              >
                <Trash size="16" />
                <span>Uninstall</span>
              </button>
            </div>
          {:else}
            <button
              onclick={() =>
                storage.install(data.currentData.id) &
                goto("/library/" + data.currentData.id, { replaceState: true })}
              class="bg-primary h-9 px-14 py-2.5 cursor-pointer rounded-full flex gap-2 items-center text-text-inverse border border-border-primary text-sm"
            >
              <Download size="16" />
              <span>Install</span>
            </button>
          {/if}
        </div>
        <div class="flex gap-2 ml-auto overflow-scroll">
          <div
            class="flex items-center bg-surface rounded-xl h-9 px-2.5 gap-1.5 text-sm border border-border whitespace-nowrap"
          >
            <Clock size="16" />
            <span
              >{storage.playTime[data.currentData.id]?.lastPlayed
                ? formatLastPlayed(
                    storage.playTime[data.currentData.id]?.lastPlayed,
                  )
                : "Never Played"}</span
            >
          </div>
          <div
            class="flex items-center bg-surface rounded-xl h-9 px-2.5 gap-1.5 text-sm border border-border whitespace-nowrap"
          >
            <ChartPie size="16" />
            <span
              >{storage.playTime[data.currentData.id]?.playTime
                ? formatPlaytime(
                    storage.playTime[data.currentData.id]?.playTime,
                  )
                : "No Playtime"}</span
            >
          </div>
          <div
            class="flex items-center bg-surface rounded-xl h-9 px-2.5 gap-1.5 text-sm border border-border whitespace-nowrap"
          >
            <User size="16" />
            <span>{data.currentData.developer}</span>
          </div>
          {#if data.currentData.version}
            <div
              class="flex items-center bg-surface rounded-xl h-9 px-2.5 gap-1.5 text-sm border border-border whitespace-nowrap"
            >
              <Tag size="16" />
              <span>{data.currentData.version}</span>
            </div>
          {/if}
          {#if data.currentData.controls || data.currentData.gamepadControls}
            <div
              class="flex items-center bg-surface rounded-xl h-9 px-2.5 gap-1.5 text-sm border border-border whitespace-nowrap"
            >
              {#if data.currentData.controls}
                <Keyboard size="16" />
              {/if}
              {#if data.currentData.gamepadControls}
                <Gamepad2 size="16" />
              {/if}
              {#if data.currentData.controls}
                <span>Keyboard</span>
              {/if}
              {#if data.currentData.controls && data.currentData.gamepadControls}
                <span> + </span>
              {/if}
              {#if data.currentData.gamepadControls}
                <span>Controller</span>
              {/if}
            </div>
          {/if}
          {#if data.currentData.cloudSave}
            <div
              class="flex items-center bg-surface rounded-xl h-9 px-2.5 gap-1.5 text-sm border border-border whitespace-nowrap"
            >
              <Cloud size="16" />
              <span>Cloud Save</span>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
  <div class="w-2/3 ml-4">
    <p>{data.currentData.description}</p>
  </div>
  {#if data.currentData.collection}
    <div class="flex flex-col gap-2 ml-4">
      <p class="text-xl">
        {collections[data.currentData.collection].title} Collection
      </p>
      <div class="flex flex-wrap gap-4">
        {#each collectionData as item (item.id)}
          {@const itemInstalled = storage.installed.includes(item.id)}
          {#if item.id === data.currentData.id}
            <div
              class="h-14 rounded-2xl text-sm flex items-center justify-between p-2 gap-2 whitespace-nowrap border border-border opacity-50"
            >
              <div class="flex gap-2 items-center overflow-hidden">
                <img
                  draggable="false"
                  alt={item.title + " logo"}
                  class="h-10 w-10 rounded-xl"
                  src={"/cdn/assets/assets/" + item.id + "/icon.webp"}
                />
                <span>{item.title}</span>
              </div>
            </div>
          {:else}
            <a
              oncontextmenu={(e) =>
                (contextMenuItem = { ...item }) & contextMenu?.open(e)}
              href={itemInstalled ? "/library/" + item.id : "/store/" + item.id}
              class={"cursor-pointer h-14 rounded-2xl text-sm flex items-center justify-between p-2 gap-2 whitespace-nowrap border border-border" +
                (itemInstalled ? " bg-surface" : "")}
            >
              <div class="flex gap-2 items-center overflow-hidden">
                <img
                  draggable="false"
                  alt={item.title + " logo"}
                  class="h-10 w-10 rounded-xl"
                  src={"/cdn/assets/assets/" + item.id + "/icon.webp"}
                />
                <span>{item.title}</span>
              </div>
            </a>
          {/if}
        {/each}
      </div>
    </div>
  {/if}
</div>
