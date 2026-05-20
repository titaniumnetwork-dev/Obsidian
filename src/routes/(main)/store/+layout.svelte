<script>
  import { page } from "$app/stores";
  import Head from "$lib/components/Head.svelte";
  import { categories } from "$lib/featured";
  import { storage } from "$lib/storage.svelte";
  import { Search, X } from "@lucide/svelte";
  import { setContext } from "svelte";

  let { data, children } = $props();

  let searchQuery = $state("");

  setContext("searchQuery", () => searchQuery);
</script>

<Head title="Store" />

<div class="sorting flex gap-4 p-4 pt-0 bg-background sticky top-22.5 z-10">
  <div
    class="focus-within:bg-surface bg-secondary transition-colors border border-border rounded-xl items-center flex w-80 shrink-0"
  >
    <Search size="20" class="ml-3 text-text-placeholder shrink-0" />
    <input
      bind:value={searchQuery}
      placeholder="Search"
      class="w-full h-full pl-2 pr-4 bg-transparent outline-none placeholder:text-text-placeholder"
    />
    {#if searchQuery.length > 0}
      <button
        aria-label="Clear Search"
        class="mr-3 cursor-pointer shrink-0 text-text-placeholder"
        onclick={() => (searchQuery = "")}
      >
        <X size="20" />
      </button>
    {/if}
  </div>
  <div class="flex gap-4 overflow-y-scroll no-scrollbar">
    <a
      href="/store"
      data-active={$page.url.pathname === "/store"}
      class="px-4 py-2 text-sm cursor-pointer rounded-xl whitespace-nowrap border border-border transition-colors data-[active=true]:bg-surface"
      >All</a
    >
    {#each categories as category}
      <a
        href={"/store/category/" + category}
        data-active={decodeURIComponent($page.url.pathname) ===
          "/store/category/" + category}
        class="px-4 py-2 text-sm cursor-pointer rounded-xl whitespace-nowrap border border-border transition-colors data-[active=true]:bg-surface"
        >{category}</a
      >
    {/each}
    {#each storage.tags as tag}
      <a
        href={"/store/tag/" + tag}
        data-active={decodeURIComponent($page.url.pathname) ===
          "/store/tag/" + tag}
        class="px-4 py-2 text-sm cursor-pointer rounded-xl whitespace-nowrap border border-border transition-colors data-[active=true]:bg-surface"
        >{tag}</a
      >
    {/each}
  </div>
</div>
{@render children()}
