<script>
  import { storage } from "#lib/storage.svelte";
  import { goto } from "$app/navigation";
  import {
    Check,
    Download,
    Pause,
    Play,
    Plus,
    Star,
    Trash,
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

  let { data, buttons, link, newBadge } = $props();
</script>

<div
  data-cards-style={storage.settings.cards}
  class="group/card w-full data-[cards-style=default]:aspect-2/3 data-[cards-style=square]:aspect-square bg-cover bg-center flex flex-col relative"
>
  {#if newBadge === true}
    <div
      class="absolute top-4 right-4 h-5 px-2 py-0.5 text-xs rounded-full bg-secondary flex items-center pointer-events-none"
    >
      New
    </div>
  {/if}
  <ContextMenu>
    <ContextMenuTrigger>
      <a
        class="h-full w-full rounded-lg border border-border"
        href={link + data.id}
      >
        <img
          draggable="false"
          loading="lazy"
          alt={data.title + " cover"}
          class="w-full h-full object-cover group-data-[cards-style=default]/card:object-center group-data-[cards-style=square]/card:object-top cursor-pointer rounded-lg"
          src={"/cdn/assets/assets/" + data.id + "/cover.webp"}
        />
      </a>
    </ContextMenuTrigger>
    <ContextMenuContent>
      {#if buttons === "store"}
        {#if storage.installed.includes(data.id)}
          <ContextMenuItem onclick={() => goto("/library/" + data.id)}>
            <Check size="16" />
            <span>View in Library</span>
          </ContextMenuItem>
          <AlertDialog>
            <AlertDialogTrigger>
              <ContextMenuItem>
                <Trash size="16" />
                <span>Remove from Library</span>
              </ContextMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent class="items-center text-center">
              <div class="flex flex-col items-center gap-1.5">
                <p>Remove from Library?</p>
                <p class="text-sm text-muted">
                  This will permanently remove this <Obfuscate text="game"
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
                    if (storage.active[data.id]) {
                      storage.quitActive(data.id);
                    }

                    storage.uninstall(data.id);
                  }}>Remove</Button
                >
              </div>
            </AlertDialogContent>
          </AlertDialog>
        {:else}
          <ContextMenuItem onclick={() => storage.install(data.id)}>
            <Plus size="16" />
            <span>Add to Library</span>
          </ContextMenuItem>
        {/if}
      {:else}
        {#if storage.active[data.id]}
          <ContextMenuItem onclick={() => storage.resumeActive(data.id)}>
            <Pause size="16" />
            <span>Resume</span>
          </ContextMenuItem>
          <ContextMenuItem onclick={() => storage.quitActive(data.id)}>
            <X size="16" />
            <span>Quit</span>
          </ContextMenuItem>
        {:else}
          <ContextMenuItem onclick={() => storage.setActive(data.id)}>
            <Play size="16" />
            <span>Play</span>
          </ContextMenuItem>
        {/if}
        {#if storage.favorites.includes(data.id)}
          <ContextMenuItem onclick={() => storage.removeFavorite(data.id)}>
            <Star size="16" class="fill-foreground" />
            <span>Remove Favorite</span>
          </ContextMenuItem>
        {:else}
          <ContextMenuItem onclick={() => storage.addFavorite(data.id)}>
            <Star size="16" />
            <span>Add Favorite</span>
          </ContextMenuItem>
        {/if}
        <AlertDialog>
          <AlertDialogTrigger>
            <ContextMenuItem>
              <Trash size="16" />
              <span>Remove from Library</span>
            </ContextMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent class="items-center text-center">
            <div class="flex flex-col items-center gap-1.5">
              <p>Remove from Library?</p>
              <p class="text-sm text-muted">
                This will permanently remove this <Obfuscate text="game"
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
                  if (storage.active[data.id]) {
                    storage.quitActive(data.id);
                  }

                  storage.uninstall(data.id);
                }}>Remove</Button
              >
            </div>
          </AlertDialogContent>
        </AlertDialog>
      {/if}
    </ContextMenuContent>
  </ContextMenu>
  <div class="flex">
    <a
      href={link + data.id}
      class="text-nowrap overflow-hidden text-ellipsis text-sm cursor-pointer pt-2 pr-2 flex-1"
    >
      {data.title}
    </a>
    <div
      class="opacity-0 group-hover/card:opacity-100 transition-opacity text-muted flex items-center pt-2"
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
            aria-label="Add to Library"
            onclick={() => storage.install(data.id)}
            class="cursor-pointer"
          >
            <Plus size="16" />
          </button>
        {/if}
      {/if}
    </div>
  </div>
</div>
