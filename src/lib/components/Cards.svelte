<script>
  import { goto } from "$app/navigation";
  import ContextMenu from "$lib/components/ContextMenu.svelte";
  import { storage } from "$lib/storage.svelte";
  import { Check, Download, Pause, Play, Star, Trash, X } from "@lucide/svelte";
  import Card from "./Card.svelte";

  let {
    data,
    link = "/library/",
    buttons = "default",
    title,
    newBadge = false,
  } = $props();

  let contextMenu = $state();
  let contextMenuItem = $state();
</script>

<ContextMenu bind:this={contextMenu}>
  {#if buttons === "default"}
    {#if contextMenuItem && storage.active[contextMenuItem.id]}
      <button
        onclick={() =>
          storage.resumeActive(contextMenuItem.id) & contextMenu?.close()}
        class="w-full rounded-lg bg-primary p-2 text-sm cursor-pointer flex items-center gap-2 text-text-inverse border border-border-primary"
      >
        <Pause size="20" />
        <span>Resume</span>
      </button>
      <button
        onclick={() =>
          storage.quitActive(contextMenuItem.id) & contextMenu?.close()}
        class="w-full rounded-lg bg-primary p-2 text-sm cursor-pointer flex items-center gap-2 text-text-inverse border border-border-primary"
      >
        <X size="20" />
        <span>Quit</span>
      </button>
    {:else}
      <button
        onclick={() =>
          storage.setActive(contextMenuItem.id) & contextMenu?.close()}
        class="w-full rounded-lg bg-primary p-2 text-sm cursor-pointer flex items-center gap-2 text-text-inverse border border-border-primary"
      >
        <Play size="20" />
        <span>Play</span>
      </button>
    {/if}
    {#if contextMenuItem && storage.favorites.includes(contextMenuItem.id)}
      <button
        onclick={() =>
          storage.removeFavorite(contextMenuItem.id) & contextMenu?.close()}
        class="w-full rounded-lg transition-colors bg-surface hover:bg-border p-2 text-sm cursor-pointer flex items-center gap-2"
      >
        <Star size="20" class="fill-text" />
        <span>Remove Favorite</span>
      </button>
    {:else}
      <button
        onclick={() =>
          storage.addFavorite(contextMenuItem.id) & contextMenu?.close()}
        class="w-full rounded-lg transition-colors bg-surface hover:bg-border p-2 text-sm cursor-pointer flex items-center gap-2"
      >
        <Star size="20" />
        <span>Add Favorite</span>
      </button>
    {/if}
    <button
      onclick={() =>
        storage.uninstall(contextMenuItem.id) & contextMenu?.close()}
      class="w-full rounded-lg transition-colors bg-surface hover:bg-border p-2 text-sm cursor-pointer flex items-center gap-2"
    >
      <Trash size="20" />
      <span>Uninstall</span>
    </button>
  {/if}
  {#if buttons === "store"}
    {#if contextMenuItem && storage.installed.includes(contextMenuItem.id)}
      <button
        onclick={() =>
          goto("/library/" + contextMenuItem.id) & contextMenu?.close()}
        class="w-full rounded-lg bg-primary p-2 text-sm cursor-pointer flex items-center gap-2 text-text-inverse border border-border-primary"
      >
        <Check size="20" />
        <span>View in Library</span>
      </button>
      <button
        onclick={() =>
          storage.uninstall(contextMenuItem.id) & contextMenu?.close()}
        class="w-full rounded-lg transition-colors bg-surface hover:bg-border p-2 text-sm cursor-pointer flex items-center gap-2"
      >
        <Trash size="20" />
        <span>Uninstall</span>
      </button>
    {:else}
      <button
        onclick={() =>
          storage.install(contextMenuItem.id) & contextMenu?.close()}
        class="w-full rounded-lg bg-primary p-2 text-sm cursor-pointer flex items-center gap-2 text-text-inverse border border-border-primary"
      >
        <Download size="20" />
        <span>Install</span>
      </button>
    {/if}
  {/if}
</ContextMenu>

<div class="flex flex-col px-4 gap-4">
  {#if data.length > 0}
    {#if title}
      <p class="flex items-center">{title}</p>
    {/if}
    <div class="grid grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-4">
      {#each data as item (item.id)}
        <Card
          oncontextmenu={(e) =>
            (contextMenuItem = { ...item }) & contextMenu?.open(e)}
          data={item}
          {link}
          {buttons}
          {newBadge}
        />
      {/each}
    </div>
  {/if}
</div>
