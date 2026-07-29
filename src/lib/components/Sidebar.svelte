<script>
  import { page } from "$app/stores";
  import Logo from "$lib/assets/logo.svelte";
  import ContextMenu from "$lib/components/ContextMenu.svelte";
  import { storage } from "$lib/storage.svelte.js";
  import {
    Gamepad2,
    Home,
    LayoutGrid,
    Pause,
    Play,
    Search,
    Settings,
    Sidebar,
    Star,
    Store,
    Trash,
    User,
    X,
  } from "@lucide/svelte";

  let { user, impersonating } = $props();
  let contextMenu = $state();
  let contextMenuItem = $state();

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
      .filter(Boolean),
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
</script>

<ContextMenu bind:this={contextMenu}>
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
    onclick={() => storage.uninstall(contextMenuItem.id) & contextMenu?.close()}
    class="w-full rounded-lg transition-colors bg-surface hover:bg-border p-2 text-sm cursor-pointer flex items-center gap-2"
  >
    <Trash size="20" />
    <span>Uninstall</span>
  </button>
</ContextMenu>

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
        <a
          class="size-8 cursor-pointer flex items-center justify-center rounded-lg transition-colors hover:bg-neutral-800"
          aria-label="Home Logo"
          href={storage.settings.libraryMode ? "/library" : "/"}
        >
          <Logo class="size-5" />
        </a>
        <p class="text-sm group-data-[style=compact]:hidden">Obsidian</p>
      </div>
      <div
        class="flex gap-1 group-data-[style=default]:items-center group-data-[style=compact]:flex-col"
      >
        <button
          aria-label="Search"
          class="size-8 cursor-pointer flex items-center justify-center rounded-lg transition-colors hover:bg-neutral-800 text-text-placeholder"
        >
          <Search size="16" />
        </button>
        <button
          aria-label="Toggle Sidebar"
          onclick={toggleSidebar}
          class="size-8 cursor-pointer flex items-center justify-center rounded-lg transition-colors hover:bg-neutral-800 text-text-placeholder"
        >
          <Sidebar size="16" />
        </button>
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
            <a
              oncontextmenu={(e) =>
                (contextMenuItem = { ...item }) & contextMenu?.open(e)}
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
          {/each}
        </div>
      </div>
    {/if}
    {#if storage.favorites.length > 0}
      <div>
        <p
          class="h-8 px-4 text-xs text-text-placeholder flex items-center shrink-0 group-data-[style=compact]:hidden"
        >
          Favorites
        </p>
        <hr class="mb-4 mx-2 text-border group-data-[style=default]:hidden" />
        <div class="p-2 pt-0 flex flex-col gap-1">
          {#each favoritesData as item (item.id)}
            <a
              oncontextmenu={(e) =>
                (contextMenuItem = { ...item }) & contextMenu?.open(e)}
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
            <a
              oncontextmenu={(e) =>
                (contextMenuItem = { ...item }) & contextMenu?.open(e)}
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
          {/each}
        </div>
      </div>
    {/if}
    <hr class="mb-4 mx-2 text-border group-data-[style=default]:hidden" />
  </div>
  <div class="p-2 pt-0">
    {#if user}
      <div
        class="group-data-[style=default]:h-12 rounded-xl text-sm flex items-center gap-2 group-data-[style=default]:bg-neutral-800 group-data-[style=compact]:flex-col-reverse"
      >
        <a
          class="flex gap-2 items-center group-data-[style=default]:p-2 group-data-[style=default]:pr-0 min-w-0"
          href="/account"
        >
          <img
            class="size-8 rounded-full"
            src="https://localhost:5173/cdn/assets/assets/db2fd199-a687-4055-818b-6aac58f4f070/icon.webp"
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
        <a
          aria-label="Settings"
          href="/settings/account"
          class="shrink-0 size-8 cursor-pointer flex items-center justify-center rounded-lg group-data-[style=default]:bg-input group-data-[style=compact]:bg-neutral-800 group-data-[style=default]:m-2 group-data-[style=default]:ml-auto"
        >
          <Settings size="16" />
        </a>
      </div>
    {:else}
      <div class="flex gap-2 group-data-[style=compact]:flex-col">
        <a
          href="/account/login"
          class="flex items-center justify-safe cursor-pointer text-sm rounded-lg h-8 group-data-[style=default]:w-full group-data-[style=compact]:w-8 group-data-[style=default]:px-2.5 gap-2 bg-neutral-800 whitespace-nowrap overflow-hidden"
        >
          <User class="shrink-0" size="16" />
          <span class="group-data-[style=compact]:hidden">Sign In</span>
        </a>
        <a
          aria-label="Settings"
          href="/settings/account"
          class="size-8 cursor-pointer flex items-center justify-center rounded-lg bg-neutral-800 shrink-0"
        >
          <Settings size="16" />
        </a>
      </div>
    {/if}
  </div>
</div>
