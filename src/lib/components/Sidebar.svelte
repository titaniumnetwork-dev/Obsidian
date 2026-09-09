<script>
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import Logo from "$lib/assets/logo.svelte";
  import { formatLastPlayed } from "$lib/formatUtils";
  import { storage } from "$lib/storage.svelte.js";
  import {
    Calculator,
    Check,
    ChevronRight,
    Copy,
    Download,
    Gamepad2,
    HatGlasses,
    Home,
    LayoutGrid,
    Palette,
    PanelLeft,
    Pause,
    Play,
    Search,
    Settings,
    Sidebar,
    SlidersHorizontal,
    Star,
    Store,
    Trash,
    X,
  } from "@lucide/svelte";
  import { evaluate } from "mathjs";
  import Obfuscate from "./Obfuscate.svelte";
  import AlertDialog from "./ui/AlertDialog.svelte";
  import AlertDialogClose from "./ui/AlertDialogClose.svelte";
  import AlertDialogContent from "./ui/AlertDialogContent.svelte";
  import AlertDialogTrigger from "./ui/AlertDialogTrigger.svelte";
  import Button from "./ui/Button.svelte";
  import Command from "./ui/Command.svelte";
  import CommandContent from "./ui/CommandContent.svelte";
  import CommandEmpty from "./ui/CommandEmpty.svelte";
  import CommandGroup from "./ui/CommandGroup.svelte";
  import CommandInput from "./ui/CommandInput.svelte";
  import CommandItem from "./ui/CommandItem.svelte";
  import CommandList from "./ui/CommandList.svelte";
  import CommandTrigger from "./ui/CommandTrigger.svelte";
  import ContextMenu from "./ui/ContextMenu.svelte";
  import ContextMenuContent from "./ui/ContextMenuContent.svelte";
  import ContextMenuItem from "./ui/ContextMenuItem.svelte";
  import ContextMenuTrigger from "./ui/ContextMenuTrigger.svelte";

  let searchQuery = $state("");

  let mathResult = $derived.by(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return null;

    if (!isNaN(Number(query))) return null;

    const safeQuery = query
      .replace(/\bto\s+in\b/g, "to inch")
      .replace(/(\d\s*)in\b/g, "$1inch");

    try {
      const result = evaluate(safeQuery);

      if (typeof result === "number" && !isNaN(result) && isFinite(result)) {
        const cleanResult = parseFloat(result.toFixed(6));
        if (cleanResult.toString() === query.replace(/\s/g, "")) return null;
        return cleanResult.toString();
      }

      if (result && (result.isUnit || result.type === "Unit")) {
        const unitString = result.toString();

        const normalizedQuery = query.replace(/\s/g, "");
        const normalizedResult = unitString
          .replace(/\s/g, "")
          .replace("inch", "in");

        if (normalizedQuery === normalizedResult) {
          return null;
        }

        return unitString;
      }

      return null;
    } catch (err) {
      return null;
    }
  });

  let recentlyPlayed = $derived(
    [...storage.library]
      .filter((item) => !storage.active[item.id])
      .filter((item) => storage.playTime[item.id]?.lastPlayed > 0)
      .sort((a, b) => {
        const lastPlayedA = Number(storage.playTime[a.id]?.lastPlayed) || 0;
        const lastPlayedB = Number(storage.playTime[b.id]?.lastPlayed) || 0;

        if (lastPlayedA !== lastPlayedB) {
          return lastPlayedB - lastPlayedA;
        }
      })
      .slice(0, 3),
  );

  let currentlyPlayingDataSearch = $derived(
    Object.keys(storage.active)
      .sort(
        (a, b) =>
          (storage.active[b]?.startTime || 0) -
          (storage.active[a]?.startTime || 0),
      )
      .map((id) => storage.library.find((item) => item.id === id))
      .slice(0, 3),
  );

  let favoritesDataSearch = $derived(
    storage.favorites
      .map((id) => storage.library.find((item) => item.id === id))
      .filter(Boolean)
      .filter((item) => !storage.active[item.id])
      .slice(0, 3),
  );

  let trimmedQuery = $derived(searchQuery.trim().toLowerCase());

  let searchingLibrary = $derived.by(() => {
    if (!trimmedQuery) return [];

    return [...storage.library]
      .filter((item) => item.title.toLowerCase().includes(trimmedQuery))
      .sort((a, b) => (a.title || "").localeCompare(b.title || ""))
      .slice(0, 3);
  });

  let searchingStore = $derived.by(() => {
    if (!trimmedQuery) return [];

    return [...storage.catalog]
      .filter((item) => !storage.installed.includes(item.id))
      .filter((item) => item.title.toLowerCase().includes(trimmedQuery))
      .sort((a, b) => (a.title || "").localeCompare(b.title || ""))
      .slice(0, 3);
  });

  let filteredLibrary = $derived.by(() => {
    //Reference active to ensure it's tracked as a dependency. Don't remove
    Object.keys(storage.active);

    return storage.library
      .filter((item) => {
        return !storage.favorites.includes(item.id);
      })
      .filter((item) => !storage.active[item.id])
      .sort((a, b) => {
        const compareAlphabetically = () =>
          (a.title || "").localeCompare(b.title || "");
        const compareAlphabeticallyReverse = () =>
          (b.title || "").localeCompare(a.title || "");

        if (storage.settings.sidebarSort === "alphabetical") {
          return compareAlphabetically();
        } else if (storage.settings.sidebarSort === "alphabetical_reverse") {
          return compareAlphabeticallyReverse();
        } else if (storage.settings.sidebarSort === "recent") {
          const lastPlayedA = Number(storage.playTime[a.id]?.lastPlayed) || 0;
          const lastPlayedB = Number(storage.playTime[b.id]?.lastPlayed) || 0;

          if (lastPlayedA !== lastPlayedB) {
            return lastPlayedB - lastPlayedA;
          }

          return compareAlphabetically();
        } else if (storage.settings.sidebarSort === "most_played") {
          const playTimeA = Number(storage.playTime[a.id]?.playTime) || 0;
          const playTimeB = Number(storage.playTime[b.id]?.playTime) || 0;

          if (playTimeA !== playTimeB) {
            return playTimeB - playTimeA;
          }

          return compareAlphabetically();
        }

        return 0;
      });
  });

  let currentlyPlayingData = $derived(
    Object.keys(storage.active)
      .sort(
        (a, b) =>
          (storage.active[b]?.startTime || 0) -
          (storage.active[a]?.startTime || 0),
      )
      .map((id) => storage.library.find((item) => item.id === id)),
  );

  let favoritesData = $derived(
    storage.favorites
      .map((id) => storage.library.find((item) => item.id === id))
      .filter(Boolean)
      .filter((item) => !storage.active[item.id])
      .sort((a, b) => {
        const compareAlphabetically = () =>
          (a.title || "").localeCompare(b.title || "");
        const compareAlphabeticallyReverse = () =>
          (b.title || "").localeCompare(a.title || "");

        if (storage.settings.sidebarSort === "alphabetical") {
          return compareAlphabetically();
        } else if (storage.settings.sidebarSort === "alphabetical_reverse") {
          return compareAlphabeticallyReverse();
        } else if (storage.settings.sidebarSort === "recent") {
          const lastPlayedA = Number(storage.playTime[a.id]?.lastPlayed) || 0;
          const lastPlayedB = Number(storage.playTime[b.id]?.lastPlayed) || 0;

          if (lastPlayedA !== lastPlayedB) {
            return lastPlayedB - lastPlayedA;
          }

          return compareAlphabetically();
        } else if (storage.settings.sidebarSort === "most_played") {
          const playTimeA = Number(storage.playTime[a.id]?.playTime) || 0;
          const playTimeB = Number(storage.playTime[b.id]?.playTime) || 0;

          if (playTimeA !== playTimeB) {
            return playTimeB - playTimeA;
          }

          return compareAlphabetically();
        }

        return 0;
      }),
  );

  function toggleSidebar() {
    if (storage.settings.sidebarCollapsed === true) {
      storage.updateSetting("sidebarCollapsed", false);
    } else {
      storage.updateSetting("sidebarCollapsed", true);
    }
  }

  let copied = $state(false);
  let timeoutId = null;

  function handleCopy() {
    navigator.clipboard.writeText(mathResult);
    copied = true;

    if (timeoutId) clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      copied = false;
    }, 2000);
  }

  const tabs = [
    { name: "Home", href: "/", icon: Home },
    { name: "Library", href: "/library", icon: LayoutGrid },
    { name: "Store", href: "/store", icon: Store },
    { name: "Emulation", href: "/emulation", icon: Gamepad2 },
  ];

  const settingsTabs = [
    {
      name: "General",
      href: "/settings/general",
      icon: SlidersHorizontal,
    },
    {
      name: "Backup",
      href: "/settings/backup",
      icon: Download,
    },
    {
      name: "Appearance",
      href: "/settings/appearance",
      icon: Palette,
    },
    {
      name: "Sidebar",
      href: "/settings/sidebar",
      icon: PanelLeft,
    },
    {
      name: "Cloaking",
      href: "/settings/cloaking",
      icon: HatGlasses,
    },
  ];
</script>

<div
  data-collapsed={storage.settings.sidebarCollapsed}
  class="sidebar group bg-card data-[collapsed=true]:w-12 data-[collapsed=false]:w-64 transition-[width] flex flex-col gap-2 overflow-y-scroll shrink-0 m-2 mr-0 rounded-lg border border-border box-content h-[calc(100%-18px)"
>
  <div class="bg-card sticky top-0 py-2 z-10">
    <div
      class="flex group-data-[collapsed=false]:items-center mx-2 gap-1 justify-between group-data-[collapsed=true]:flex-col overflow-hidden"
    >
      <div class="flex gap-2 items-center">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Home Logo"
          href={storage.settings.libraryMode ? "/library" : "/"}
        >
          <Logo class="size-5" />
        </Button>
        <p class="text-sm group-data-[collapsed=true]:hidden">Obsidian</p>
      </div>
      <div
        class="flex gap-1 group-data-[collapsed=false]:items-center group-data-[collapsed=true]:flex-col"
      >
        <Command>
          <CommandTrigger>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Search"
              class="text-muted outline-none"
            >
              <Search size="16" />
            </Button>
          </CommandTrigger>
          <CommandContent>
            <CommandInput
              bind:value={searchQuery}
              placeholder="Search library or store"
            />
            <CommandList>
              {#if searchQuery.length && !mathResult && !searchingLibrary.length && !searchingStore.length}
                <CommandEmpty>No results found</CommandEmpty>
              {/if}
              {#if mathResult}
                <CommandGroup heading="Math">
                  <CommandItem class="justify-between" onselect={handleCopy}>
                    <div class="flex items-center gap-2">
                      <Calculator class="text-muted shrink-0" size="16" />
                      <div>
                        <span class="text-muted"
                          >{searchQuery.trim() + " = "}</span
                        >
                        <span>{mathResult}</span>
                      </div>
                    </div>
                    {#if copied}
                      <Check class="text-muted" size="16" />
                    {:else}
                      <Copy class="text-muted" size="16" />
                    {/if}
                  </CommandItem>
                </CommandGroup>
              {/if}
              {#if !searchQuery}
                {#if currentlyPlayingDataSearch.length}
                  <CommandGroup heading="Currently Playing">
                    {#each currentlyPlayingDataSearch as game (game.id)}
                      <CommandItem
                        class="justify-between"
                        onselect={(e, ctx) =>
                          ctx.close() &
                          setTimeout(() => {
                            storage.resumeActive(game.id);
                          }, 200)}
                      >
                        <div class="flex items-center gap-2">
                          <img
                            draggable="false"
                            loading="lazy"
                            class="shrink-0 size-4 rounded"
                            alt={game.name}
                            src={"/cdn/assets/assets/" + game.id + "/icon.webp"}
                          />
                          <span>{game.title}</span>
                        </div>
                        <Pause class="text-muted" size="14" />
                      </CommandItem>
                    {/each}
                  </CommandGroup>
                {/if}
                {#if recentlyPlayed.length}
                  <CommandGroup heading="Recent">
                    {#each recentlyPlayed as game (game.id)}
                      <CommandItem
                        class="justify-between"
                        onselect={(e, ctx) =>
                          goto("/library/" + game.id) & ctx.close()}
                      >
                        <div class="flex items-center gap-2">
                          <img
                            draggable="false"
                            loading="lazy"
                            class="shrink-0 size-4 rounded"
                            alt={game.name}
                            src={"/cdn/assets/assets/" + game.id + "/icon.webp"}
                          />
                          <span>{game.title}</span>
                        </div>
                        <span class="text-xs text-muted">
                          {storage.playTime[game.id]?.lastPlayed
                            ? formatLastPlayed(
                                storage.playTime[game.id]?.lastPlayed,
                              )
                            : "Never Played"}
                        </span>
                      </CommandItem>
                    {/each}
                  </CommandGroup>
                {/if}
                {#if favoritesDataSearch.length}
                  <CommandGroup heading="Favorites">
                    {#each favoritesDataSearch as game (game.id)}
                      <CommandItem
                        onselect={(e, ctx) =>
                          goto("/library/" + game.id) & ctx.close()}
                      >
                        <img
                          draggable="false"
                          loading="lazy"
                          class="shrink-0 size-4 rounded"
                          alt={game.name}
                          src={"/cdn/assets/assets/" + game.id + "/icon.webp"}
                        />
                        <span>{game.title}</span>
                      </CommandItem>
                    {/each}
                  </CommandGroup>
                {/if}
                {#if !currentlyPlayingDataSearch.length && !recentlyPlayed.length && !favoritesDataSearch.length}
                  <CommandEmpty>No recent activity</CommandEmpty>
                {/if}
              {/if}
              {#if searchQuery && searchingLibrary.length > 0}
                <CommandGroup heading="Library">
                  {#each searchingLibrary as game (game.id)}
                    <CommandItem
                      onselect={(e, ctx) =>
                        goto("/library/" + game.id) & ctx.close()}
                    >
                      <img
                        draggable="false"
                        loading="lazy"
                        class="shrink-0 size-4 rounded"
                        alt={game.name}
                        src={"/cdn/assets/assets/" + game.id + "/icon.webp"}
                      />
                      <span>{game.title}</span>
                    </CommandItem>
                  {/each}
                </CommandGroup>
              {/if}
              {#if searchQuery && searchingStore.length > 0}
                <CommandGroup heading="Store">
                  {#each searchingStore as game (game.id)}
                    <CommandItem
                      onselect={(e, ctx) =>
                        goto("/store/" + game.id) & ctx.close()}
                    >
                      <img
                        draggable="false"
                        loading="lazy"
                        class="shrink-0 size-4 rounded"
                        alt={game.name}
                        src={"/cdn/assets/assets/" + game.id + "/icon.webp"}
                      />
                      <span>{game.title}</span>
                    </CommandItem>
                  {/each}
                </CommandGroup>
              {/if}
            </CommandList>
          </CommandContent>
        </Command>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Toggle Sidebar"
          onclick={toggleSidebar}
          class="size-8 cursor-pointer flex items-center justify-center rounded-md transition-colors hover:bg-secondary text-muted"
        >
          <Sidebar size="16" />
        </Button>
      </div>
    </div>
  </div>
  <div
    class="flex flex-col gap-2 overflow-auto flex-1 group-data-[collapsed=true]:scrollbar-none"
  >
    <div>
      <hr class="mb-4 mx-2 text-border group-data-[collapsed=false]:hidden" />
      <div class="p-2 pt-0 flex flex-col gap-1">
        {#each tabs as tab}
          {@const isActive =
            $page.url.pathname === tab.href ||
            (tab.href !== "/library" &&
              $page.url.pathname.startsWith(tab.href + "/") &&
              $page.url.pathname !== tab.href + "/")}
          {#if tab.href === "/" ? !storage.settings.libraryMode : true}
            <a
              data-active={isActive}
              href={tab.href}
              class="flex items-center cursor-pointer text-sm rounded-md h-8 group-data-[collapsed=false]:w-full group-data-[collapsed=true]:w-8 group-data-[collapsed=false]:px-2 gap-2 transition-colors hover:bg-secondary data-[active=true]:bg-secondary group-data-[collapsed=true]:justify-center overflow-hidden"
            >
              <tab.icon class="shrink-0" size="16" />
              <span class="group-data-[collapsed=true]:hidden">{tab.name}</span>
            </a>
          {/if}
        {/each}
        <div data-open={false} class="group/collapsible flex flex-col">
          <button
            data-active={$page.url.pathname.startsWith("/settings/")}
            onclick={() =>
              (this.parentElement.dataset.open =
                this.parentElement.dataset.open === "true" ? "false" : "true")}
            class="flex items-center justify-between cursor-pointer text-sm rounded-md h-8 group-data-[collapsed=false]:w-full group-data-[collapsed=true]:w-8 group-data-[collapsed=false]:px-2 gap-2 transition-colors hover:bg-secondary group-data-[open=false]/collapsible:data-[active=true]:bg-secondary group-data-[collapsed=true]:justify-center overflow-hidden"
          >
            <div class="flex items-center gap-2">
              <Settings size="16" />
              <span class="group-data-[collapsed=true]:hidden">Settings</span>
            </div>
            <ChevronRight
              class="transition-transform group-data-[open=true]/collapsible:rotate-90 group-data-[collapsed=true]:hidden"
              size="16"
            />
          </button>
          <div
            class="group-data-[collapsed=false]:px-2.5 group-data-[collapsed=false]:py-0.5 group-data-[collapsed=false]:border-l group-data-[collapsed=false]:border-border group-data-[collapsed=false]:mx-3.5 flex flex-col gap-1 group-data-[open=false]/collapsible:hidden group-data-[collapsed=true]:mt-1"
          >
            {#each settingsTabs as settingsTab}
              {@const isActive = $page.url.pathname === settingsTab.href}
              <a
                data-active={isActive}
                href={settingsTab.href}
                class="text-sm px-2 rounded-md h-8 flex items-center transition-colors hover:bg-secondary data-[active=true]:bg-secondary"
              >
                <settingsTab.icon
                  size="16"
                  class="shrink-0 group-data-[collapsed=false]:hidden"
                />
                <span class="group-data-[collapsed=true]:hidden"
                  >{settingsTab.name}</span
                >
              </a>
            {/each}
          </div>
        </div>
      </div>
    </div>
    {#if currentlyPlayingData.length > 0}
      <div>
        <p
          class="h-8 px-4 text-xs text-muted flex items-center shrink-0 group-data-[collapsed=true]:hidden"
        >
          Currently Playing
        </p>
        <hr class="mb-4 mx-2 text-border group-data-[collapsed=false]:hidden" />
        <div class="p-2 pt-0 flex flex-col gap-1">
          {#each currentlyPlayingData as item (item.id)}
            <ContextMenu>
              <ContextMenuTrigger>
                <a
                  href={"/library/" + item.id}
                  data-current={$page.url.pathname === "/library/" + item.id}
                  class="cursor-pointer group-data-[collapsed=false]:h-12 group-data-[collapsed=true]:h-8 group-data-[collapsed=false]:w-full group-data-[collapsed=true]:w-8 rounded-md text-sm flex items-center justify-between group-data-[collapsed=false]:p-2 gap-2 data-[current=false]:data-[context-menu=true]:bg-secondary data-[current=false]:hover:bg-secondary transition-colors data-[current=true]:bg-secondary whitespace-nowrap group-data-[collapsed=true]:justify-center"
                >
                  <div class="flex gap-2 items-center overflow-hidden">
                    <img
                      draggable="false"
                      loading="lazy"
                      alt={item.title + " logo"}
                      class="shrink-0 group-data-[collapsed=false]:size-8 group-data-[collapsed=true]:size-4 rounded-sm"
                      src={"/cdn/assets/assets/" + item.id + "/icon.webp"}
                    />
                    <span
                      class="group-data-[collapsed=true]:hidden overflow-hidden text-ellipsis"
                      >{item.title}</span
                    >
                  </div>
                </a>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem onclick={() => storage.resumeActive(item.id)}>
                  <Pause size="16" />
                  <span>Resume</span>
                </ContextMenuItem>
                <ContextMenuItem onclick={() => storage.quitActive(item.id)}>
                  <X size="16" />
                  <span>Quit</span>
                </ContextMenuItem>
                {#if storage.favorites.includes(item.id)}
                  <ContextMenuItem
                    onclick={() => storage.removeFavorite(item.id)}
                  >
                    <Star size="16" class="fill-foreground" />
                    <span>Remove Favorite</span>
                  </ContextMenuItem>
                {:else}
                  <ContextMenuItem onclick={() => storage.addFavorite(item.id)}>
                    <Star size="16" />
                    <span>Add Favorite</span>
                  </ContextMenuItem>
                {/if}
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
                          storage.quitActive(item.id);
                          storage.uninstall(item.id);

                          if ($page.url.pathname === "/library/" + item.id) {
                            goto("/library", { replaceState: true });
                          }
                        }}>Uninstall</Button
                      >
                    </div>
                  </AlertDialogContent>
                </AlertDialog>
              </ContextMenuContent>
            </ContextMenu>
          {/each}
        </div>
      </div>
    {/if}
    {#if favoritesData.length > 0}
      <div>
        <p
          class="h-8 px-4 text-xs text-muted flex items-center shrink-0 group-data-[collapsed=true]:hidden"
        >
          Favorites
        </p>
        <hr class="mb-4 mx-2 text-border group-data-[collapsed=false]:hidden" />
        <div class="p-2 pt-0 flex flex-col gap-1">
          {#each favoritesData as item (item.id)}
            <ContextMenu>
              <ContextMenuTrigger>
                <a
                  href={"/library/" + item.id}
                  data-current={$page.url.pathname === "/library/" + item.id}
                  class="cursor-pointer group-data-[collapsed=false]:h-12 group-data-[collapsed=true]:h-8 group-data-[collapsed=false]:w-full group-data-[collapsed=true]:w-8 rounded-md text-sm flex items-center justify-between group-data-[collapsed=false]:p-2 gap-2 data-[current=false]:data-[context-menu=true]:bg-secondary data-[current=false]:hover:bg-secondary transition-colors data-[current=true]:bg-secondary whitespace-nowrap group-data-[collapsed=true]:justify-center"
                >
                  <div class="flex gap-2 items-center overflow-hidden">
                    <img
                      draggable="false"
                      loading="lazy"
                      alt={item.title + " logo"}
                      class="shrink-0 group-data-[collapsed=false]:size-8 group-data-[collapsed=true]:size-4 rounded-sm"
                      src={"/cdn/assets/assets/" + item.id + "/icon.webp"}
                    />
                    <span
                      class="group-data-[collapsed=true]:hidden overflow-hidden text-ellipsis"
                      >{item.title}</span
                    >
                  </div>
                </a>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem onclick={() => storage.setActive(item.id)}>
                  <Play size="16" />
                  <span>Play</span>
                </ContextMenuItem>
                <ContextMenuItem
                  onclick={() => storage.removeFavorite(item.id)}
                >
                  <Star size="16" class="fill-foreground" />
                  <span>Remove Favorite</span>
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
                          storage.uninstall(item.id);

                          if ($page.url.pathname === "/library/" + item.id) {
                            goto("/library", { replaceState: true });
                          }
                        }}>Uninstall</Button
                      >
                    </div>
                  </AlertDialogContent>
                </AlertDialog>
              </ContextMenuContent>
            </ContextMenu>
          {/each}
        </div>
      </div>
    {/if}
    {#if filteredLibrary.length > 0}
      <div>
        <p
          class="h-8 px-4 text-xs text-muted flex items-center shrink-0 group-data-[collapsed=true]:hidden overflow-hidden whitespace-nowrap"
        >
          Library
        </p>
        <hr class="mb-4 mx-2 text-border group-data-[collapsed=false]:hidden" />
        <div class="p-2 pt-0 flex flex-col gap-1">
          {#each filteredLibrary as item (item.id)}
            <ContextMenu>
              <ContextMenuTrigger>
                <a
                  href={"/library/" + item.id}
                  data-current={$page.url.pathname === "/library/" + item.id}
                  class="cursor-pointer group-data-[collapsed=false]:h-12 group-data-[collapsed=true]:h-8 group-data-[collapsed=false]:w-full group-data-[collapsed=true]:w-8 rounded-md text-sm flex items-center justify-between group-data-[collapsed=false]:p-2 gap-2 data-[current=false]:data-[context-menu=true]:bg-secondary data-[current=false]:hover:bg-secondary transition-colors data-[current=true]:bg-secondary whitespace-nowrap group-data-[collapsed=true]:justify-center"
                >
                  <div class="flex gap-2 items-center overflow-hidden">
                    <img
                      draggable="false"
                      loading="lazy"
                      alt={item.title + " logo"}
                      class="group-data-[collapsed=false]:size-8 group-data-[collapsed=true]:size-4 rounded-sm"
                      src={"/cdn/assets/assets/" + item.id + "/icon.webp"}
                    />
                    <span
                      class="group-data-[collapsed=true]:hidden overflow-hidden text-ellipsis"
                      >{item.title}</span
                    >
                  </div>
                </a>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem onclick={() => storage.setActive(item.id)}>
                  <Play size="16" />
                  <span>Play</span>
                </ContextMenuItem>
                <ContextMenuItem onclick={() => storage.addFavorite(item.id)}>
                  <Star size="16" />
                  <span>Add Favorite</span>
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
                          storage.uninstall(item.id);

                          if ($page.url.pathname === "/library/" + item.id) {
                            goto("/library", { replaceState: true });
                          }
                        }}>Uninstall</Button
                      >
                    </div>
                  </AlertDialogContent>
                </AlertDialog>
              </ContextMenuContent>
            </ContextMenu>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>
