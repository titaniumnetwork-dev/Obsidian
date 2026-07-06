<script>
  import Head from "$lib/components/Head.svelte";
  import { ChevronDown, Folder, Home, Search, Tag, X } from "@lucide/svelte";
  import { setContext } from "svelte";

  let { data, children } = $props();

  let searchQuery = $state("");

  setContext("searchQuery", () => searchQuery);
</script>

<Head title="Store" />

<div class="flex gap-2 p-4 bg-background sticky top-0 z-10">
  <div
    class="bg-neutral-900 rounded-lg items-center flex w-96 border border-input h-9 px-2.5 gap-1.5"
  >
    <Search size="16" class="text-text-placeholder shrink-0" />
    <input
      bind:value={searchQuery}
      placeholder="Search store"
      class="w-full h-full bg-transparent outline-none placeholder:text-text-placeholder text-sm"
    />
    {#if searchQuery.length > 0}
      <button
        class="cursor-pointer shrink-0 text-text-placeholder"
        onclick={() => (searchQuery = "")}
      >
        <X size="16" />
      </button>
    {/if}
  </div>
  <a
    class="h-9 px-2.5 bg-neutral-900 rounded-lg flex gap-1.5 items-center cursor-pointer border border-input text-sm"
    href="/store"
  >
    <Home size="16" />
    <span>Home</span>
  </a>
  <a
    class="h-9 px-2.5 bg-neutral-900 rounded-lg flex gap-1.5 items-center cursor-pointer border border-input text-sm"
    href="/store"
  >
    <Folder size="16" />
    <span>Categories</span>
    <ChevronDown size="16" />
  </a>
  <a
    class="h-9 px-2.5 bg-neutral-900 rounded-lg flex gap-1.5 items-center cursor-pointer border border-input text-sm"
    href="/store"
  >
    <Tag size="16" />
    <span>Tags</span>
    <ChevronDown size="16" />
  </a>
  <!--
  <div class="flex gap-2 overflow-y-scroll no-scrollbar">
    <a
      href="/store"
      data-active={$page.url.pathname === "/store"}
      class="h-9 px-2.5 flex items-center text-sm cursor-pointer rounded-lg whitespace-nowrap border border-input transition-colors data-[active=true]:bg-neutral-900"
      >All</a
    >
    {#each categories as category}
      <a
        href={"/store/category/" + category}
        data-active={decodeURIComponent($page.url.pathname) ===
          "/store/category/" + category}
        class="h-9 px-2.5 flex items-center text-sm cursor-pointer rounded-lg whitespace-nowrap border border-input transition-colors data-[active=true]:bg-neutral-900"
        >{category}</a
      >
    {/each}
    {#each storage.tags as tag}
      <a
        href={"/store/tag/" + tag}
        data-active={decodeURIComponent($page.url.pathname) ===
          "/store/tag/" + tag}
        class="h-9 px-2.5 flex items-center text-sm cursor-pointer rounded-lg whitespace-nowrap border border-input transition-colors data-[active=true]:bg-neutral-900"
        >{tag}</a
      >
    {/each}
  </div>
  -->
</div>
{@render children()}
