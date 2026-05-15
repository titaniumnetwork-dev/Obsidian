<script>
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import Cards from "$lib/components/Cards.svelte";
  import Head from "$lib/components/Head.svelte";
  import { carousel, categories, featured } from "$lib/featured";
  import { storage } from "$lib/storage.svelte";
  import {
    Check,
    ChevronLeft,
    ChevronRight,
    Download,
    Search,
    X,
  } from "@lucide/svelte";

  let { data } = $props();

  const filterCategory = $derived(
    decodeURIComponent(
      page.url.pathname.split("/store")[1].startsWith("/category/")
        ? page.url.pathname.split("/store/category/")[1]
        : "",
    ),
  );
  const filterTag = $derived(
    decodeURIComponent(
      page.url.pathname.split("/store")[1].startsWith("/tag/")
        ? page.url.pathname.split("/store/tag/")[1]
        : "",
    ),
  );

  let searchQuery = $state("");

  let sortedLibrary = $derived(
    storage.catalog
      .filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .filter((item) => {
        if (filterTag) {
          return item.tags.some((itemTag) => filterTag === itemTag);
        } else {
          return true;
        }
      })
      .filter((item) => {
        if (filterCategory) {
          return item.type === filterCategory;
        } else {
          return true;
        }
      })
      .sort((a, b) => {
        //Alphabetical
        return (a.title || "").localeCompare(b.title || "");
      }),
  );

  let carouselData = carousel
    .map((id) => storage.catalog.find((item) => item.id === id))
    .filter(Boolean);

  let featuredData = featured
    .map((id) => storage.catalog.find((item) => item.id === id))
    .filter(Boolean);

  let carouselIndex = $state(0);

  const next = (e) => {
    e.preventDefault();
    carouselIndex = (carouselIndex + 1) % carouselData.length;
  };

  const prev = (e) => {
    e.preventDefault();
    carouselIndex =
      (carouselIndex - 1 + carouselData.length) % carouselData.length;
  };
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
      data-active={!filterCategory && !filterTag}
      class="px-4 py-2 text-sm cursor-pointer rounded-xl whitespace-nowrap border border-border transition-colors data-[active=true]:bg-surface"
      >Home</a
    >
    {#each categories as category}
      <a
        href={"/store/category/" + category}
        data-active={category === filterCategory}
        class="px-4 py-2 text-sm cursor-pointer rounded-xl whitespace-nowrap border border-border transition-colors data-[active=true]:bg-surface"
        >{category}</a
      >
    {/each}
    {#each storage.tags as tag}
      <a
        href={"/store/tag/" + tag}
        data-active={tag === filterTag}
        class="px-4 py-2 text-sm cursor-pointer rounded-xl whitespace-nowrap border border-border transition-colors data-[active=true]:bg-surface"
        >{tag}</a
      >
    {/each}
  </div>
</div>
{#if !searchQuery && !filterCategory && !filterTag}
  <div class="shrink-0 p-4 pb-0 pt-0 flex flex-col gap-4 relative">
    <div class="group overflow-hidden relative">
      <div
        class="shrink-0 flex w-full transition-transform duration-500 ease-in-out gap-8"
        style="transform: translateX(calc(-{carouselIndex *
          100}% - {carouselIndex * 2}rem))"
      >
        {#each carouselData as item}
          <a
            href={"/store/" + item.id}
            style={"--hero: url('/cdn/assets/" + item.id + "/hero.webp')"}
            class="shrink-0 [background:linear-gradient(to_left,var(--color-overlay)0%,var(--theme-secondary)60%)padding-box,var(--hero)left/cover_padding-box,var(--color-surface)] w-full h-96 rounded-b-2xl flex flex-col items-start justify-between p-8 pb-4 gap-4 rounded-2xl border border-border"
          >
            <div class="flex flex-wrap gap-4 ml-auto">
              {#each item.tags as tag}
                <button
                  onclick={(e) => {
                    e.preventDefault();

                    goto("/store/tag/" + tag);
                  }}
                  class=" px-4 py-1 text-sm rounded-full bg-surface border border-border flex items-center cursor-pointer"
                >
                  {tag}
                </button>
              {/each}
            </div>
            <div class="w-full">
              <h1 class="text-6xl font-bold mb-4 sm:w-2/3">{item.title}</h1>
              <p class="sm:w-1/2 mb-4">
                {item.description}
              </p>
              <div class="flex gap-4 flex-row items-center justify-between">
                <div class="flex gap-2">
                  {#if storage.installed.includes(item.id)}
                    <div
                      class="bg-primary px-14 py-2 cursor-pointer rounded-full flex gap-2 items-center text-text-inverse border border-border-primary"
                    >
                      <Check size="20" />
                      <span>Installed</span>
                    </div>
                  {:else}
                    <button
                      onclick={(e) => {
                        e.preventDefault() & storage.install(item.id);
                        goto("/library/" + item.id);
                      }}
                      class="bg-primary px-14 py-2 cursor-pointer rounded-full flex gap-2 items-center text-text-inverse border border-border-primary"
                    >
                      <Download size="20" />
                      <span>Install</span>
                    </button>
                  {/if}
                </div>
              </div>
            </div>
            <div class="ml-auto flex gap-4 items-center">
              <button
                onclick={prev}
                class="bg-surface border border-border w-10 h-10 cursor-pointer rounded-full flex justify-center items-center"
              >
                <ChevronLeft size="20" />
              </button>
              <p>{carouselIndex + 1} / {carouselData.length}</p>
              <button
                onclick={next}
                class="bg-surface border border-border w-10 h-10 cursor-pointer rounded-full flex justify-center items-center"
              >
                <ChevronRight size="20" />
              </button>
            </div>
          </a>
        {/each}
      </div>
    </div>
  </div>
  <Cards title="Featured" data={featuredData} link="/store/" buttons="store" />
{:else}
  <Cards data={sortedLibrary} link="/store/" buttons="store" />
  {#if sortedLibrary.length === 0}
    <div class="text-text-placeholder text-center p-4">No results found.</div>
  {/if}
{/if}
