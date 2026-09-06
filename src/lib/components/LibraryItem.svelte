<script>
  import { goto } from "$app/navigation";
  import { collections } from "$lib/collections";
  import { formatLastPlayed, formatPlaytime } from "$lib/formatUtils";
  import { storage } from "$lib/storage.svelte.js";
  import {
    ChartPie,
    Check,
    Clock,
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
  import Obfuscate from "./Obfuscate.svelte";
  import AlertDialog from "./ui/AlertDialog.svelte";
  import AlertDialogClose from "./ui/AlertDialogClose.svelte";
  import AlertDialogContent from "./ui/AlertDialogContent.svelte";
  import AlertDialogTrigger from "./ui/AlertDialogTrigger.svelte";
  import Button from "./ui/Button.svelte";
  import ContextMenu from "./ui/ContextMenu.svelte";
  import ContextMenuContent from "./ui/ContextMenuContent.svelte";
  import ContextMenuItem from "./ui/ContextMenuItem.svelte";
  import ContextMenuTrigger from "./ui/ContextMenuTrigger.svelte";

  let { data } = $props();

  let optionsMenu = $state();

  const keybinds = $derived(storage.keybinds[data.currentData.id] || {});

  const collectionData = $derived(
    data.currentData.collection &&
      storage.catalog.filter((i) =>
        collections[data.currentData.collection].items.includes(i.id),
      ),
  );
</script>

<div class="p-4 flex flex-col gap-4 item">
  <div
    style={"--hero: url('/cdn/assets/assets/" +
      data.currentData.id +
      "/hero.webp')"}
    class="relative [background:linear-gradient(to_bottom,var(--color-overlay)_0%,var(--theme-background)_100%)_padding-box,var(--hero)center/cover_padding-box,var(--color-background)] w-full h-112 flex flex-col items-start justify-between p-4 gap-4 rounded-t-lg border-x border-t border-transparent"
  >
    <div
      class="pointer-events-none absolute -inset-x-px -top-px bottom-0 rounded-t-lg border-x border-t border-background mask-[linear-gradient(to_bottom,transparent_50%,black_100%)]"
    ></div>
    <div
      class="pointer-events-none absolute -inset-x-px -top-px bottom-0 rounded-t-lg border-x border-t border-border mask-[linear-gradient(to_bottom,black_50%,transparent_100%)]"
    ></div>
    <div class="flex flex-wrap gap-2 ml-auto">
      {#each data.currentData.tags as tag}
        <button
          onclick={() => {
            if (storage.installed.includes(data.currentData.id)) {
              goto("/library?tags=" + JSON.stringify([tag]));
            } else {
              goto("/store/tag/" + tag);
            }
          }}
          class="h-6 px-2 py-0.5 text-xs rounded-full bg-secondary flex items-center cursor-pointer"
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
              <Button
                onclick={() => storage.resumeActive(data.currentData.id)}
                class="w-42 justify-center rounded-full"
              >
                <Pause size="16" />
                <span>Resume</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Quit"
                onclick={() => storage.quitActive(data.currentData.id)}
                class="rounded-full"
              >
                <X size="16" />
              </Button>
            {:else}
              <Button
                onclick={() => storage.setActive(data.currentData.id)}
                class="w-42 justify-center rounded-full"
              >
                <Play size="16" />
                <span>Play</span>
              </Button>
            {/if}
            <Button
              variant="outline"
              size="icon"
              aria-label="Share"
              onclick={async () =>
                await navigator.share({
                  title: data.currentData.title,
                  url: "/store/" + data.currentData.id,
                })}
              class="rounded-full"
            >
              <Share size="16" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              popovertarget="options"
              aria-label="Options"
              class="[anchor-name:--options-button] rounded-full"
            >
              <Ellipsis size="16" />
            </Button>
            <div
              popover="auto"
              id="options"
              bind:this={optionsMenu}
              class="[&:popover-open]:flex flex-col bg-card rounded-lg text-foreground [position-anchor:--options-button]
              [position-area:top_span-right] border border-input p-1 mb-2.5 min-w-36"
            >
              {#if storage.favorites.includes(data.currentData.id)}
                <button
                  onclick={() =>
                    storage.removeFavorite(data.currentData.id) &
                    optionsMenu.hidePopover()}
                  class="px-2 py-1.5 gap-2 rounded-md cursor-pointer transition-colors bg-card hover:bg-secondary flex items-center text-sm"
                >
                  <Star size="16" class="fill-foreground" />
                  <span>Remove Favorite</span>
                </button>
              {:else}
                <button
                  onclick={() =>
                    storage.addFavorite(data.currentData.id) &
                    optionsMenu.hidePopover()}
                  class="px-2 py-1.5 gap-2 rounded-md cursor-pointer transition-colors bg-card hover:bg-secondary flex items-center text-sm"
                >
                  <Star size="16" />
                  <span>Add Favorite</span>
                </button>
              {/if}
              <AlertDialog>
                <AlertDialogTrigger>
                  <button
                    class="px-2 py-1.5 gap-2 rounded-md cursor-pointer transition-colors bg-card hover:bg-secondary flex items-center text-sm outline-none"
                  >
                    <Trash size="16" />
                    <span>Uninstall</span>
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent class="items-center text-center">
                  <div class="flex flex-col items-center gap-1.5">
                    <p>Uninstall <Obfuscate text="Game"></Obfuscate>?</p>
                    <p class="text-sm text-muted">
                      This will permanently uninstall this <Obfuscate
                        text="game"
                      ></Obfuscate>. All data and stats will be deleted.
                    </p>
                  </div>
                  <div class="w-full flex gap-2">
                    <AlertDialogClose>
                      <Button
                        variant="outline"
                        size="sm"
                        class="outline-none flex-1 justify-center bg-secondary"
                        >Cancel</Button
                      >
                    </AlertDialogClose>
                    <Button
                      size="sm"
                      class="flex-1 justify-center"
                      onclick={() =>
                        storage.uninstall(data.currentData.id) &
                        optionsMenu.hidePopover() &
                        goto("/library", { replaceState: true })}
                      >Uninstall</Button
                    >
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          {:else}
            <Button
              onclick={() =>
                storage.install(data.currentData.id) &
                goto("/library/" + data.currentData.id, { replaceState: true })}
              class="w-42 justify-center rounded-full"
            >
              <Download size="16" />
              <span>Install</span>
            </Button>
          {/if}
        </div>
        <div class="flex gap-2 ml-auto overflow-scroll">
          <Button variant="outline" class="whitespace-nowrap cursor-default">
            <Clock size="16" />
            <span
              >{storage.playTime[data.currentData.id]?.lastPlayed
                ? formatLastPlayed(
                    storage.playTime[data.currentData.id]?.lastPlayed,
                  )
                : "Never Played"}</span
            >
          </Button>
          <Button variant="outline" class="whitespace-nowrap cursor-default">
            <ChartPie size="16" />
            <span
              >{storage.playTime[data.currentData.id]?.playTime
                ? formatPlaytime(
                    storage.playTime[data.currentData.id]?.playTime,
                  )
                : "No Playtime"}</span
            >
          </Button>
          <Button variant="outline" class="whitespace-nowrap cursor-default">
            <User size="16" />
            <span>{data.currentData.developer}</span>
          </Button>
          {#if data.currentData.version}
            <Button variant="outline" class="whitespace-nowrap cursor-default">
              <Tag size="16" />
              <span>{data.currentData.version}</span>
            </Button>
          {/if}
          {#if data.currentData.controls || data.currentData.gamepadControls}
            <Button variant="outline" class="whitespace-nowrap cursor-default">
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
            </Button>
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
      <p>
        {collections[data.currentData.collection].title} Collection
      </p>
      <div class="flex flex-wrap gap-4">
        {#each collectionData as item (item.id)}
          {@const itemInstalled = storage.installed.includes(item.id)}
          <ContextMenu>
            <ContextMenuTrigger>
              <a
                href={itemInstalled
                  ? "/library/" + item.id
                  : "/store/" + item.id}
                class="cursor-pointer h-14 rounded-lg text-sm flex items-center justify-between p-2 gap-2 whitespace-nowrap bg-card border border-input"
              >
                <div class="flex gap-2 items-center overflow-hidden">
                  <img
                    draggable="false"
                    alt={item.title + " logo"}
                    class="h-10 w-10 rounded-md"
                    src={"/cdn/assets/assets/" + item.id + "/icon.webp"}
                  />
                  <span>{item.title}</span>
                </div>
              </a>
            </ContextMenuTrigger>
            <ContextMenuContent>
              {#if storage.installed.includes(item.id)}
                <ContextMenuItem onclick={() => goto("/library/" + item.id)}>
                  <Check size="16" />
                  <span>View in Library</span>
                </ContextMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger>
                    <ContextMenuItem>
                      <Trash size="16" />
                      <span>Uninstall</span>
                    </ContextMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent class="items-center text-center">
                    <div class="flex flex-col items-center gap-1.5">
                      <p>Uninstall <Obfuscate text="Game"></Obfuscate>?</p>
                      <p class="text-sm text-muted">
                        This will permanently uninstall this <Obfuscate
                          text="game"
                        ></Obfuscate>. All data and stats will be deleted.
                      </p>
                    </div>
                    <div class="w-full flex gap-2">
                      <AlertDialogClose>
                        <Button
                          variant="outline"
                          size="sm"
                          class="outline-none flex-1 justify-center bg-secondary"
                          >Cancel</Button
                        >
                      </AlertDialogClose>
                      <Button
                        size="sm"
                        class="flex-1 justify-center"
                        onclick={() => {
                          if (storage.active[item.id]) {
                            storage.quitActive(item.id);
                          }

                          storage.uninstall(item.id);
                        }}>Uninstall</Button
                      >
                    </div>
                  </AlertDialogContent>
                </AlertDialog>
              {:else}
                <ContextMenuItem onclick={() => storage.install(item.id)}>
                  <Download size="16" />
                  <span>Install</span>
                </ContextMenuItem>
              {/if}
            </ContextMenuContent>
          </ContextMenu>
        {/each}
      </div>
    </div>
  {/if}
</div>
