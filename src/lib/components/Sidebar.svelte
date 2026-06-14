<script>
  import { page } from "$app/stores";
  import Logo from "$lib/assets/logo.svelte";
  import { storage } from "$lib/storage.svelte.js";
  import { Activity, Search, Sidebar, X } from "@lucide/svelte";

  let { data } = $props();
  let searchQuery = $state("");

  let filteredLibrary = $derived.by(() => {
    //Reference active to ensure it's tracked as a dependency. Don't remove
    Object.keys(storage.active);

    return storage.library
      .filter((item) => {
        return !storage.favorites.includes(item.id);
      })
      .filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .sort((a, b) => {
        //Alphabetical maybe allow changing later
        return (a.title || "").localeCompare(b.title || "");
      })
      .sort((a, b) => {
        if (storage.settings.playingFirst) {
          return (
            Object.hasOwn(storage.active, b.id) -
            Object.hasOwn(storage.active, a.id)
          );
        } else {
          return 1;
        }
      });
  });

  let favoritesLibrary = $derived(
    storage.favorites
      .map((id) => storage.library.find((item) => item.id === id))
      .filter(Boolean),
  );

  $effect(() => {
    if (
      storage.settings.sidebarSearch === false ||
      storage.settings.sidebarStyle !== "default"
    ) {
      searchQuery = "";
    }
  });

  function toggleSidebar() {
    if (storage.settings.sidebarStyle === "default") {
      storage.updateSetting("sidebarStyle", "compact");
    } else {
      storage.updateSetting("sidebarStyle", "default");
    }
  }
</script>

<div
  data-style={storage.settings.sidebarStyle}
  class="sidebar group bg-secondary h-[calc(100%-2rem)] data-[style=hidden]:hidden data-[style=compact]:w-23 data-[style=default]:w-64 transition-[width] flex flex-col overflow-y-scroll shrink-0 m-4 mr-0 rounded-2xl border border-surface duration-300"
>
  <div class="bg-secondary sticky top-0 py-4 z-10">
    <div
      class="group/logo h-6 group-data-[style=compact]:w-6 gap-4 flex items-center justify-between relative"
    >
      <a
        class="w-6 h-6 absolute group-data-[style=default]:translate-x-6 group-data-[style=compact]:translate-x-8 transition-[translate,opacity] group-data-[style=compact]:group-hover/logo:opacity-0 duration-300"
        aria-label="Home Logo"
        href={storage.settings.libraryMode ? "/library" : "/"}
      >
        <Logo class="h-6 w-6 shrink-0" />
      </a>
      <button
        aria-label="Toggle Sidebar"
        onclick={toggleSidebar}
        class="peer w-6 h-6 ml-auto mr-4 cursor-pointer absolute group-data-[style=default]:translate-x-54 group-data-[style=compact]:translate-x-8 transition-transform flex items-center justify-center duration-300"
      >
        <Sidebar
          class="group-data-[style=compact]:opacity-0 group-data-[style=compact]:group-hover/logo:opacity-100 text-text-placeholder transition-opacity"
          size="20"
        />
      </button>
    </div>
  </div>
  {#if storage.settings.sidebarSearch}
    <div
      class={`bg-secondary sticky top-14 z-10 overflow-hidden transition-[height,opacity,padding] duration-300 shrink-0 px-4 ${
        storage.settings.sidebarStyle === "default"
          ? "h-13.5 pb-4 opacity-100"
          : "h-0 pb-0 opacity-0 border-none"
      }`}
    >
      <div
        class="focus-within:bg-surface bg-secondary rounded-xl items-center shrink-0 flex border border-border h-full"
      >
        <Search size="20" class="ml-3 text-text-placeholder shrink-0" />
        <input
          bind:value={searchQuery}
          placeholder="Search"
          class="h-9 w-full pl-2 pr-4 bg-transparent outline-none placeholder:text-text-placeholder"
        />
        {#if searchQuery.length > 0}
          <button
            class="mr-3 cursor-pointer shrink-0 text-text-placeholder"
            onclick={() => (searchQuery = "")}
          >
            <X size="20" />
          </button>
        {/if}
      </div>
    </div>
  {/if}
  <div class="m-4 mt-0 flex flex-col gap-2">
    {#if storage.favorites.length > 0}
      <div class="grid grid-cols-[repeat(auto-fit,minmax(3.5rem,1fr))] gap-2">
        {#each favoritesLibrary as item (item.id)}
          <a
            href={"/library/" + item.id}
            style={"--icon: url('/cdn/assets/assets/" +
              item.id +
              "/icon.webp')"}
            data-current={$page.url.pathname === "/library/" + item.id}
            data-active={storage.active[item.id] !== undefined}
            class="group border border-border cursor-pointer w-full h-14 rounded-2xl flex items-center justify-center data-[current=false]:hover:bg-surface data-[current=true]:bg-surface transition-colors"
          >
            <div
              class="group-data-[active=false]:[background:var(--icon)center/cover_padding-box] group-data-[active=true]:[background:linear-gradient(rgba(0,0,0,0.4),rgba(0,0,0,0.4)),var(--icon)center/cover_padding-box] h-8 w-8 rounded-lg flex items-center justify-center"
            >
              {#if storage.active[item.id]}
                <Activity size="16" />
              {/if}
            </div>
          </a>
        {/each}
      </div>
    {/if}
    {#each filteredLibrary as item (item.id)}
      <a
        href={"/library/" + item.id}
        data-current={$page.url.pathname === "/library/" + item.id}
        class="cursor-pointer h-14 w-full rounded-2xl text-sm flex items-center justify-between p-2 gap-2 data-[current=false]:hover:bg-surface transition-colors data-[current=true]:bg-surface whitespace-nowrap border border-transparent data-[current=true]:border data-[current=true]:border-border duration-300"
      >
        <div class="flex gap-2 items-center overflow-hidden">
          <img
            draggable="false"
            loading="lazy"
            alt={item.title + " logo"}
            class="h-10 w-10 rounded-xl"
            src={"/cdn/assets/assets/" + item.id + "/icon.webp"}
          />
          <span
            class="group-data-[style=hidden]:opacity-0 group-data-[style=compact]:opacity-0 transition-opacity overflow-hidden text-ellipsis duration-300"
            >{item.title}</span
          >
        </div>
        {#if storage.active[item.id]}
          <Activity
            size="16"
            class="mx-2 text-text-placeholder group-data-[style=hidden]:opacity-0 group-data-[style=compact]:opacity-0 transition-opacity shrink-0 duration-300"
          />
        {/if}
      </a>
    {/each}

    {#if storage.library.length > 0 && filteredLibrary.concat(favoritesLibrary).length === 0}
      <div class="text-text-placeholder text-center text-sm p-4">
        No items found.
      </div>
    {/if}
    {#if storage.library.length === 0}
      <div
        class="text-text-placeholder text-center text-sm p-4 transition-opacity group-data-[style=hidden]:hidden group-data-[style=compact]:opacity-0 whitespace-nowrap duration-300"
      >
        Nothing in your library
      </div>
    {/if}
  </div>
</div>
