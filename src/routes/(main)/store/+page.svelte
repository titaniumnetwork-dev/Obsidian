<script>
  import { goto } from "$app/navigation";
  import Cards from "$lib/components/Cards.svelte";
  import { carousel, featured } from "$lib/featured.js";
  import { links } from "$lib/links";
  import { storage } from "$lib/storage.svelte.js";
  import { SiDiscord } from "@icons-pack/svelte-simple-icons";
  import {
    CarFront,
    Check,
    ChevronLeft,
    ChevronRight,
    Crosshair,
    Download,
    Ghost,
    Puzzle,
    SearchX,
    Sword,
    Zap,
  } from "@lucide/svelte";
  import { getContext } from "svelte";

  let searchQuery = getContext("searchQuery");

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

  let carouselData = carousel
    .map((id) => storage.catalog.find((item) => item.id === id))
    .filter(Boolean);

  let featuredData = featured
    .map((id) => storage.catalog.find((item) => item.id === id))
    .filter(Boolean);

  let sortedLibrary = $derived(
    storage.catalog
      .filter((item) =>
        item.title.toLowerCase().includes(searchQuery().toLowerCase()),
      )
      .sort((a, b) => {
        //Alphabetical
        return (a.title || "").localeCompare(b.title || "");
      }),
  );
</script>

<div class="flex flex-col gap-4">
  {#if !searchQuery()}
    <div class="shrink-0 p-4 pb-0 pt-0 flex flex-col gap-4 relative">
      <div class="group overflow-hidden relative">
        <div
          class="shrink-0 flex w-full transition-transform duration-500 ease-in-out gap-8"
          style="transform: translateX(calc(-{carouselIndex *
            100}% - {carouselIndex * 2}rem))"
        >
          {#each carouselData as item}
            <div
              style={"--hero: url('/cdn/assets/assets/" +
                item.id +
                "/hero.webp')"}
              class="shrink-0 [background:linear-gradient(to_left,var(--color-overlay)0%,var(--theme-card)60%)padding-box,var(--hero)left/cover_padding-box,var(--color-card)] w-full h-96 flex flex-col items-start justify-between p-4 gap-4 rounded-lg border border-border relative"
            >
              <div class="absolute top-4 right-4 flex flex-wrap gap-2">
                {#each item.tags as tag}
                  <a
                    href={"/store/tag/" + tag}
                    class="h-6 px-2 py-0.5 text-xs rounded-full bg-secondary flex items-center cursor-pointer"
                  >
                    {tag}
                  </a>
                {/each}
              </div>
              <div class="h-full flex gap-4 items-center">
                <button
                  aria-label="Previous Slide"
                  onclick={prev}
                  class="bg-secondary border border-input size-8 cursor-pointer rounded-full flex justify-center items-center shrink-0"
                >
                  <ChevronLeft size="16" />
                </button>
                <div class="flex items-center">
                  <div>
                    <h1 class="text-6xl font-bold mb-4 w-2/3">{item.title}</h1>
                    <p class="w-2/3 mb-4">
                      {item.description}
                    </p>
                    {#if storage.installed.includes(item.id)}
                      <a
                        href={"/library/" + item.id}
                        class="bg-primary h-9 px-14 py-2.5 cursor-pointer rounded-full flex gap-2 items-center text-primary-foreground text-sm w-fit"
                      >
                        <Check size="20" />
                        <span>View in Library</span>
                      </a>
                    {:else}
                      <div class="flex gap-2">
                        <button
                          onclick={(e) => {
                            e.preventDefault() & storage.install(item.id);
                            goto("/library/" + item.id);
                          }}
                          class="bg-primary h-9 px-14 py-2.5 cursor-pointer rounded-full flex gap-2 items-center text-primary-foreground text-sm"
                        >
                          <Download size="20" />
                          <span>Install</span>
                        </button>
                        <a
                          href={"/store/" + item.id}
                          class="bg-secondary border border-input h-9 px-14 py-2.5 cursor-pointer rounded-full flex gap-2 items-center text-sm"
                        >
                          <span>View</span>
                        </a>
                      </div>
                    {/if}
                  </div>
                </div>
                <button
                  aria-label="Next Slide"
                  onclick={next}
                  class="bg-secondary border border-input size-8 cursor-pointer rounded-full flex justify-center items-center shrink-0"
                >
                  <ChevronRight size="16" />
                </button>
              </div>
              <div
                class="absolute right-0 left-0 bottom-4 w-fit mx-auto flex gap-2"
              >
                {#each carouselData as carouselPage, index}
                  {@const current = index === carouselIndex}
                  <button
                    aria-label={"Carousel Slide " + index}
                    onclick={() => (carouselIndex = index)}
                    class={"size-2 rounded-full cursor-pointer transition-[background,width]" +
                      (current ? " bg-primary" : " bg-input")}
                  ></button>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
    <div class="flex flex-col px-4 gap-4">
      <p class="flex items-center">Genres</p>
      <div class="flex gap-4">
        <a
          href="/store/tag/Action"
          class="flex flex-1 flex-col items-center justify-center bg-card rounded-lg p-6 text-sm border border-border gap-1.5 cursor-pointer"
        >
          <Sword />
          <p>Action</p>
        </a>
        <a
          href="/store/tag/Puzzle"
          class="flex flex-1 flex-col items-center justify-center bg-card rounded-lg p-6 text-sm border border-border gap-1.5 cursor-pointer"
        >
          <Puzzle />
          <p>Puzzle</p>
        </a>
        <a
          href="/store/tag/Shooter"
          class="flex flex-1 flex-col items-center justify-center bg-card rounded-lg p-6 text-sm border border-border gap-1.5 cursor-pointer"
        >
          <Crosshair />
          <p>Shooter</p>
        </a>
        <a
          href="/store/tag/Racing"
          class="flex flex-1 flex-col items-center justify-center bg-card rounded-lg p-6 text-sm border border-border gap-1.5 cursor-pointer"
        >
          <CarFront />
          <p>Racing</p>
        </a>
        <a
          href="/store/tag/Horror"
          class="flex flex-1 flex-col items-center justify-center bg-card rounded-lg p-6 text-sm border border-border gap-1.5 cursor-pointer"
        >
          <Ghost />
          <p>Horror</p>
        </a>
        <a
          href="/store/tag/Arcade"
          class="flex flex-1 flex-col items-center justify-center bg-card rounded-lg p-6 text-sm border border-border gap-1.5 cursor-pointer"
        >
          <Zap />
          <p>Arcade</p>
        </a>
      </div>
    </div>
    <Cards
      title="Featured"
      data={featuredData}
      link="/store/"
      buttons="store"
    />
    <Cards
      title="Platformers"
      data={storage.catalog.filter((item) =>
        item.tags.some((itemTag) => itemTag === "Platformer"),
      )}
      link="/store/"
      buttons="store"
    />
    <Cards
      title="Puzzles"
      data={storage.catalog.filter((item) =>
        item.tags.some((itemTag) => itemTag === "Puzzle"),
      )}
      link="/store/"
      buttons="store"
    />
  {:else}
    <Cards data={sortedLibrary} link="/store/" buttons="store" />
  {/if}
</div>
{#if sortedLibrary.length === 0}
  <div class="flex flex-col gap-4 h-full w-full justify-center items-center">
    <div class="flex flex-col gap-2 max-w-sm items-center">
      <SearchX class="mb-2" size="32" />
      <p class="text-sm text-center">No results found</p>
      <p class="text-muted text-sm text-center text-balance">
        Try checking for typos or adjusting your search terms. Join our Discord
        server to request a game.
      </p>
    </div>
    <a
      href={links.discord}
      class="h-9 px-2.5 bg-primary text-primary-foreground rounded-lg flex gap-1.5 items-center cursor-pointer text-sm"
    >
      <SiDiscord size="16" />
      <span>Join Discord Server</span>
    </a>
  </div>
{/if}
