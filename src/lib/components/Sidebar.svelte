<script>
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import Logo from "$lib/assets/logo.svelte";
  import { storage } from "$lib/storage.svelte.js";
  import {
    ChevronRight,
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
    User,
    X,
  } from "@lucide/svelte";
  import AlertDialog from "./ui/AlertDialog.svelte";
  import AlertDialogClose from "./ui/AlertDialogClose.svelte";
  import AlertDialogContent from "./ui/AlertDialogContent.svelte";
  import AlertDialogTrigger from "./ui/AlertDialogTrigger.svelte";
  import Button from "./ui/Button.svelte";
  import ContextMenu from "./ui/ContextMenu.svelte";
  import ContextMenuContent from "./ui/ContextMenuContent.svelte";
  import ContextMenuItem from "./ui/ContextMenuItem.svelte";
  import ContextMenuTrigger from "./ui/ContextMenuTrigger.svelte";

  let { user, impersonating } = $props();

  let filteredLibrary = $derived.by(() => {
    //Reference active to ensure it's tracked as a dependency. Don't remove
    Object.keys(storage.active);

    return storage.library
      .filter((item) => {
        return !storage.favorites.includes(item.id);
      })
      .filter((item) => !storage.active[item.id])
      .sort((a, b) => {
        //Todo sort option
        return (a.title || "").localeCompare(b.title || "");
      });
  });

  let currentlyPlayingData = $derived(
    Object.keys(storage.active)
      .map((id) => storage.library.find((item) => item.id === id))
      .reverse(),
  );

  let favoritesData = $derived(
    storage.favorites
      .map((id) => storage.library.find((item) => item.id === id))
      .filter(Boolean)
      .filter((item) => !storage.active[item.id]),
  );

  function toggleSidebar() {
    if (storage.settings.sidebarStyle === "default") {
      storage.updateSetting("sidebarStyle", "compact");
    } else {
      storage.updateSetting("sidebarStyle", "default");
    }
  }

  const tabs = [
    { name: "Home", href: "/", icon: Home },
    { name: "Library", href: "/library", icon: LayoutGrid },
    { name: "Store", href: "/store", icon: Store },
    { name: "Emulation", href: "/emulation", icon: Gamepad2 },
  ];

  const settingsTabs = [
    {
      name: "Account",
      href: "/settings/account",
      loggedIn: true,
      icon: User,
    },
    {
      name: "General",
      href: "/settings/general",
      icon: SlidersHorizontal,
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
  data-style={storage.settings.sidebarStyle}
  class={"sidebar group bg-neutral-900 data-[style=compact]:w-12 data-[style=default]:w-64 transition-[width] flex flex-col gap-2 overflow-y-scroll shrink-0 m-2 mr-0 rounded-radius border border-border box-content" +
    (impersonating ? " h-[calc(100%-4rem)] mt-8" : " h-[calc(100%-18px)]")}
>
  <div class="bg-neutral-900 sticky top-0 py-2 z-10">
    <div
      class="flex group-data-[style=default]:items-center mx-2 gap-1 justify-between group-data-[style=compact]:flex-col overflow-hidden"
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
        <p class="text-sm group-data-[style=compact]:hidden">Obsidian</p>
      </div>
      <div
        class="flex gap-1 group-data-[style=default]:items-center group-data-[style=compact]:flex-col"
      >
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Search"
          class="text-text-placeholder"
        >
          <Search size="16" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Toggle Sidebar"
          onclick={toggleSidebar}
          class="size-8 cursor-pointer flex items-center justify-center rounded-lg transition-colors hover:bg-neutral-800 text-text-placeholder"
        >
          <Sidebar size="16" />
        </Button>
      </div>
    </div>
  </div>
  <div
    class="flex flex-col gap-2 overflow-auto flex-1 group-data-[style=compact]:no-scrollbar"
  >
    <div>
      <hr class="mb-4 mx-2 text-border group-data-[style=default]:hidden" />
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
              class="flex items-center cursor-pointer text-sm rounded-lg h-8 group-data-[style=default]:w-full group-data-[style=compact]:w-8 group-data-[style=default]:px-2 gap-2 transition-colors hover:bg-neutral-800 data-[active=true]:bg-neutral-800 group-data-[style=compact]:justify-center overflow-hidden"
            >
              <tab.icon class="shrink-0" size="16" />
              <span class="group-data-[style=compact]:hidden">{tab.name}</span>
            </a>
          {/if}
        {/each}
        <div data-open={false} class="group/collapsible flex flex-col">
          <button
            data-active={$page.url.pathname.startsWith("/settings/")}
            onclick={() =>
              (this.parentElement.dataset.open =
                this.parentElement.dataset.open === "true" ? "false" : "true")}
            class="flex items-center justify-between cursor-pointer text-sm rounded-lg h-8 group-data-[style=default]:w-full group-data-[style=compact]:w-8 group-data-[style=default]:px-2 gap-2 transition-colors hover:bg-neutral-800 group-data-[open=false]/collapsible:data-[active=true]:bg-neutral-800 group-data-[style=compact]:justify-center overflow-hidden"
          >
            <div class="flex items-center gap-2">
              <Settings size="16" />
              <span class="group-data-[style=compact]:hidden">Settings</span>
            </div>
            <ChevronRight
              class="text-text-placeholder transition-transform group-data-[open=true]/collapsible:rotate-90 group-data-[style=compact]:hidden"
              size="16"
            />
          </button>
          <div
            class="group-data-[style=default]:px-2.5 group-data-[style=default]:py-0.5 group-data-[style=default]:border-l group-data-[style=default]:border-border group-data-[style=default]:mx-3.5 flex flex-col gap-1 group-data-[open=false]/collapsible:hidden group-data-[style=compact]:mt-1"
          >
            {#each settingsTabs as settingsTab}
              {@const isActive = $page.url.pathname === settingsTab.href}
              {#if settingsTab.loggedIn === true ? !!user : true}
                <a
                  data-active={isActive}
                  href={settingsTab.href}
                  class="text-sm px-2 rounded-lg h-8 flex items-center transition-colors hover:bg-neutral-800 data-[active=true]:bg-neutral-800"
                >
                  <settingsTab.icon
                    size="16"
                    class="shrink-0 group-data-[style=default]:hidden"
                  />
                  <span class="group-data-[style=compact]:hidden"
                    >{settingsTab.name}</span
                  >
                </a>
              {/if}
            {/each}
          </div>
        </div>
      </div>
    </div>
    {#if currentlyPlayingData.length > 0}
      <div>
        <p
          class="h-8 px-4 text-xs text-text-placeholder flex items-center shrink-0 group-data-[style=compact]:hidden"
        >
          Currently Playing
        </p>
        <hr class="mb-4 mx-2 text-border group-data-[style=default]:hidden" />
        <div class="p-2 pt-0 flex flex-col gap-1">
          {#each currentlyPlayingData as item (item.id)}
            <ContextMenu>
              <ContextMenuTrigger>
                <a
                  href={"/library/" + item.id}
                  data-current={$page.url.pathname === "/library/" + item.id}
                  class="cursor-pointer group-data-[style=default]:h-12 group-data-[style=compact]:h-8 group-data-[style=default]:w-full group-data-[style=compact]:w-8 rounded-lg text-sm flex items-center justify-between group-data-[style=default]:p-2 gap-2 data-[current=false]:data-[context-menu=true]:bg-neutral-800 data-[current=false]:hover:bg-neutral-800 transition-colors data-[current=true]:bg-neutral-800 whitespace-nowrap group-data-[style=compact]:justify-center"
                >
                  <div class="flex gap-2 items-center overflow-hidden">
                    <img
                      draggable="false"
                      loading="lazy"
                      alt={item.title + " logo"}
                      class="shrink-0 group-data-[style=default]:size-8 group-data-[style=compact]:size-4 group-data-[style=default]:rounded-lg group-data-[style=compact]:rounded-md"
                      src={"/cdn/assets/assets/" + item.id + "/icon.webp"}
                    />
                    <span
                      class="group-data-[style=compact]:hidden overflow-hidden text-ellipsis"
                      >{item.title}</span
                    >
                  </div>
                </a>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem
                  onclick={() => storage.resumeActive(item.id)}
                >
                  <Pause size="16" />
                  <span>Resume</span>
                </ContextMenuItem>
                <ContextMenuItem
                  onclick={() => storage.quitActive(item.id)}
                >
                  <X size="16" />
                  <span>Quit</span>
                </ContextMenuItem>
                {#if storage.favorites.includes(item.id)}
                  <ContextMenuItem
                    onclick={() => storage.removeFavorite(item.id)}
                  >
                    <Star size="16" class="fill-text" />
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
                      <p>Uninstall Game?</p>
                      <p class="text-sm text-text-placeholder">
                        This will permanently uninstall this game. All data and
                        stats will be deleted.
                      </p>
                    </div>
                    <div class="w-full flex gap-2">
                      <AlertDialogClose>
                        <Button
                          variant="outline"
                          size="sm"
                          class="outline-none flex-1 justify-center bg-neutral-800"
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
          class="h-8 px-4 text-xs text-text-placeholder flex items-center shrink-0 group-data-[style=compact]:hidden"
        >
          Favorites
        </p>
        <hr class="mb-4 mx-2 text-border group-data-[style=default]:hidden" />
        <div class="p-2 pt-0 flex flex-col gap-1">
          {#each favoritesData as item (item.id)}
            <ContextMenu>
              <ContextMenuTrigger>
                <a
                  href={"/library/" + item.id}
                  data-current={$page.url.pathname === "/library/" + item.id}
                  class="cursor-pointer group-data-[style=default]:h-12 group-data-[style=compact]:h-8 group-data-[style=default]:w-full group-data-[style=compact]:w-8 rounded-lg text-sm flex items-center justify-between group-data-[style=default]:p-2 gap-2 data-[current=false]:data-[context-menu=true]:bg-neutral-800 data-[current=false]:hover:bg-neutral-800 transition-colors data-[current=true]:bg-neutral-800 whitespace-nowrap group-data-[style=compact]:justify-center"
                >
                  <div class="flex gap-2 items-center overflow-hidden">
                    <img
                      draggable="false"
                      loading="lazy"
                      alt={item.title + " logo"}
                      class="shrink-0 group-data-[style=default]:size-8 group-data-[style=compact]:size-4 group-data-[style=default]:rounded-lg group-data-[style=compact]:rounded-md"
                      src={"/cdn/assets/assets/" + item.id + "/icon.webp"}
                    />
                    <span
                      class="group-data-[style=compact]:hidden overflow-hidden text-ellipsis"
                      >{item.title}</span
                    >
                  </div>
                </a>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem
                  onclick={() => storage.setActive(item.id)}
                >
                  <Play size="16" />
                  <span>Play</span>
                </ContextMenuItem>
                <ContextMenuItem
                  onclick={() => storage.removeFavorite(item.id)}
                >
                  <Star size="16" class="fill-text" />
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
                      <p>Uninstall Game?</p>
                      <p class="text-sm text-text-placeholder">
                        This will permanently uninstall this game. All data and
                        stats will be deleted.
                      </p>
                    </div>
                    <div class="w-full flex gap-2">
                      <AlertDialogClose>
                        <Button
                          variant="outline"
                          size="sm"
                          class="outline-none flex-1 justify-center bg-neutral-800"
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
          class="h-8 px-4 text-xs text-text-placeholder flex items-center shrink-0 group-data-[style=compact]:hidden overflow-hidden whitespace-nowrap"
        >
          Library
        </p>
        <hr class="mb-4 mx-2 text-border group-data-[style=default]:hidden" />
        <div class="p-2 pt-0 flex flex-col gap-1">
          {#each filteredLibrary as item (item.id)}
            <ContextMenu>
              <ContextMenuTrigger>
                <a
                  href={"/library/" + item.id}
                  data-current={$page.url.pathname === "/library/" + item.id}
                  class="cursor-pointer group-data-[style=default]:h-12 group-data-[style=compact]:h-8 group-data-[style=default]:w-full group-data-[style=compact]:w-8 rounded-lg text-sm flex items-center justify-between group-data-[style=default]:p-2 gap-2 data-[current=false]:data-[context-menu=true]:bg-neutral-800 data-[current=false]:hover:bg-neutral-800 transition-colors data-[current=true]:bg-neutral-800 whitespace-nowrap group-data-[style=compact]:justify-center"
                >
                  <div class="flex gap-2 items-center overflow-hidden">
                    <img
                      draggable="false"
                      loading="lazy"
                      alt={item.title + " logo"}
                      class="group-data-[style=default]:size-8 group-data-[style=compact]:size-4 group-data-[style=default]:rounded-lg group-data-[style=compact]:rounded-md"
                      src={"/cdn/assets/assets/" + item.id + "/icon.webp"}
                    />
                    <span
                      class="group-data-[style=compact]:hidden overflow-hidden text-ellipsis"
                      >{item.title}</span
                    >
                  </div>
                </a>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem
                  onclick={() => storage.setActive(item.id)}
                >
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
                      <p>Uninstall Game?</p>
                      <p class="text-sm text-text-placeholder">
                        This will permanently uninstall this game. All data and
                        stats will be deleted.
                      </p>
                    </div>
                    <div class="w-full flex gap-2">
                      <AlertDialogClose>
                        <Button
                          variant="outline"
                          size="sm"
                          class="outline-none flex-1 justify-center bg-neutral-800"
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
    <hr class="mb-4 mx-2 text-border group-data-[style=default]:hidden" />
  </div>
  <div class="p-2 pt-0">
    {#if user}
      <div
        class="group-data-[style=default]:h-12 rounded-xl text-sm flex items-center gap-2 group-data-[style=default]:bg-neutral-800"
      >
        <a
          class="flex gap-2 items-center group-data-[style=default]:p-2 group-data-[style=default]:pr-0 min-w-0"
          href="/account"
        >
          <img
            class="size-8 rounded-lg"
            src={"/cdn/avatars/" + user.image}
            alt="Profile"
            draggable="false"
          />
          <div
            class="flex flex-col overflow-hidden group-data-[style=compact]:hidden"
          >
            <span class="overflow-hidden whitespace-nowrap text-ellipsis"
              >{user.username}</span
            >
            <span
              class="text-xs text-text-placeholder overflow-hidden whitespace-nowrap text-ellipsis"
              >{user.email}</span
            >
          </div>
        </a>
      </div>
    {:else}
      <Button
        href="/account/login"
        variant="secondary"
        size="sm"
        class="group-data-[style=default]:w-full group-data-[style=compact]:w-8 justify-center"
      >
        <User class="shrink-0" size="16" />
        <span class="group-data-[style=compact]:hidden">Sign In</span>
      </Button>
    {/if}
  </div>
</div>
