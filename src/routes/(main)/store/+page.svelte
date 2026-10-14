<script>
  import { collections } from "#lib/collections.js";
  import Cards from "#lib/components/Cards.svelte";
  import Obfuscate from "#lib/components/Obfuscate.svelte";
  import Button from "#lib/components/ui/Button.svelte";
  import Card from "#lib/components/ui/Card.svelte";
  import { carousel, featured } from "#lib/featured.js";
  import { links } from "#lib/links";
  import { storage } from "#lib/storage.svelte.js";
  import { goto } from "$app/navigation";
  import { SiDiscord } from "@icons-pack/svelte-simple-icons";
  import {
    CarFront,
    Check,
    ChevronLeft,
    ChevronRight,
    Crosshair,
    Dice5,
    Eye,
    Ghost,
    LoaderCircle,
    Plus,
    Puzzle,
    SearchX,
    Sword,
    Zap,
  } from "@lucide/svelte";
  import { getContext } from "svelte";

  let searchQuery = getContext("searchQuery");

  let carouselIndex = $state(0);
  let isHovered = $state(false);

  const next = (e) => {
    e.preventDefault();
    carouselIndex = (carouselIndex + 1) % carouselData.length;
  };

  const prev = (e) => {
    e.preventDefault();
    carouselIndex =
      (carouselIndex - 1 + carouselData.length) % carouselData.length;
  };

  const pickRandom = (e) => {
    if (storage.catalog.length === 0) return;

    e.target.children[0].classList.add("animate-shake");
    setTimeout(() => {
      e.target.children[0].classList.remove("animate-shake");
      goto(
        "/store/" +
          storage.catalog[Math.floor(Math.random() * storage.catalog.length)]
            .id,
      );
    }, 300);
  };

  let carouselData = $derived(
    carousel
      .map((id) => storage.catalog.find((item) => item.id === id))
      .filter(Boolean),
  );

  let featuredData = $derived(
    featured
      .map((id) => storage.catalog.find((item) => item.id === id))
      .filter(Boolean),
  );

  let recentlyAddedData = $derived(
    [...storage.catalog].sort((a, b) => {
      return b.dateAdded - a.dateAdded;
    }),
  );

  const batchSize = 10;
  let displayCount = $state(batchSize);
  let sentinelNode = $state(null);

  let infiniteScrollData = $derived(
    [...storage.catalog]
      .sort((a, b) => (a.title || "").localeCompare(b.title || ""))
      .slice(0, displayCount),
  );

  let hasMoreItems = $derived(displayCount < storage.catalog.length);

  $effect(() => {
    if (isHovered || searchQuery() || carouselData.length <= 1) return;
    carouselIndex;

    const timer = setTimeout(() => {
      carouselIndex = (carouselIndex + 1) % carouselData.length;
    }, 5000);

    return () => clearTimeout(timer);
  });

  $effect(() => {
    if (!sentinelNode || searchQuery() || !hasMoreItems) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreItems) {
          displayCount += batchSize;
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinelNode);

    return () => observer.disconnect();
  });

  const getCollection = (id) =>
    (collections[id]?.items || [])
      .map((itemId) => storage.catalog.find((item) => item.id === itemId))
      .filter(Boolean);

  const getByTag = (tag) =>
    storage.catalog.filter((item) =>
      item.tags.some((itemTag) => itemTag === tag),
    );

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
      <div
        role="region"
        aria-label="Featured Games Carousel"
        onmouseenter={() => (isHovered = true)}
        onmouseleave={() => (isHovered = false)}
        class="group overflow-hidden relative"
      >
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
              <div class="h-full w-full flex gap-4 items-center px-13">
                <div class="flex-1 flex items-center">
                  <div class="w-full">
                    <h1 class="text-6xl font-bold mb-4 w-2/3 line-clamp-2">
                      {item.title}
                    </h1>
                    <p class="w-2/3 mb-4 line-clamp-3">
                      {item.description}
                    </p>
                    {#if storage.installed.includes(item.id)}
                      <a
                        href={"/library/" + item.id}
                        class="bg-primary h-9 px-4 cursor-pointer rounded-full flex gap-1.5 items-center text-primary-foreground text-sm w-fit"
                      >
                        <Check size="16" />
                        <span>View in Library</span>
                      </a>
                    {:else}
                      <div class="flex gap-2">
                        <button
                          onclick={(e) => {
                            e.preventDefault();
                            storage.install(item.id);
                            goto("/library/" + item.id);
                          }}
                          class="bg-primary h-9 px-4 cursor-pointer rounded-full flex gap-1.5 items-center text-primary-foreground text-sm w-fit"
                        >
                          <Plus size="16" />
                          <span>Add to Library</span>
                        </button>
                        <a
                          href={"/store/" + item.id}
                          class="bg-secondary border border-input h-9 px-4 cursor-pointer rounded-full flex gap-1.5 items-center text-sm w-fit"
                        >
                          <Eye size="16" />
                          <span>View</span>
                        </a>
                      </div>
                    {/if}
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
        <button
          aria-label="Previous Slide"
          onclick={prev}
          class="absolute left-4 top-1/2 -translate-y-1/2 bg-secondary border border-input size-9 cursor-pointer rounded-full flex justify-center items-center shrink-0"
        >
          <ChevronLeft size="16" />
        </button>
        <button
          aria-label="Next Slide"
          onclick={next}
          class="absolute right-4 top-1/2 -translate-y-1/2 bg-secondary border border-input size-9 cursor-pointer rounded-full flex justify-center items-center shrink-0"
        >
          <ChevronRight size="16" />
        </button>
        <div class="absolute right-0 left-0 bottom-4 w-fit mx-auto flex">
          {#each carouselData as carouselPage, index}
            {@const current = index === carouselIndex}
            <button
              aria-label={"Carousel Slide " + index}
              onclick={() => (carouselIndex = index)}
              class="size-6 rounded-full cursor-pointer flex items-center justify-center"
            >
              <div
                class={"size-2.5 rounded-full transition-[background,width]" +
                  (current ? " bg-primary" : " bg-input")}
              ></div>
            </button>
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
      title="Recently Added"
      data={recentlyAddedData}
      buttons="store"
      link="/store/"
      newBadge={true}
      row={true}
    />
    <Card class="flex-row items-center mx-4" size="sm">
      <div class="flex-col gap-1">
        <p>Not sure what to play?</p>
        <p class="text-sm text-muted">
          Roll the dice and jump into a random <Obfuscate text="game"
          ></Obfuscate> from the catalog.
        </p>
      </div>
      <Button class="ml-auto" onclick={pickRandom}>
        <Dice5 size="16" />
        <span class="pointer-events-none">Random Game</span>
      </Button>
    </Card>
    <Cards
      title="Action"
      row={true}
      viewAll={"/store/tag/Action"}
      data={getByTag("Action")}
      link="/store/"
      buttons="store"
    />
    <div class="mx-4 py-4 rounded-xl border border-border bg-card">
      <Cards
        title="The Binding of Isaac Collection"
        data={getCollection("16fb74cb-d2be-4ae8-b621-62fd0d95b491")}
        link="/store/"
        buttons="store"
      />
    </div>
    <Cards
      title="Platformers"
      row={true}
      viewAll={"/store/tag/Platformer"}
      data={getByTag("Platformer")}
      link="/store/"
      buttons="store"
    />
    <Cards
      title="Roguelites"
      row={true}
      viewAll={"/store/tag/Roguelite"}
      data={getByTag("Roguelite")}
      link="/store/"
      buttons="store"
    />
    <Cards
      title="Shooters"
      row={true}
      viewAll={"/store/tag/Shooter"}
      data={getByTag("Shooter")}
      link="/store/"
      buttons="store"
    />
    <div class="mx-4 py-4 rounded-xl border border-border bg-card">
      <Cards
        title="GTA Collection"
        data={getCollection("4c2a56b7-a699-415e-b4c4-6ade2f2edf65")}
        link="/store/"
        buttons="store"
      />
    </div>
    <Cards
      title="Horror"
      row={true}
      viewAll={"/store/tag/Horror"}
      data={getByTag("Horror")}
      link="/store/"
      buttons="store"
    />
    <div class="mx-4 py-4 rounded-xl border border-border bg-card">
      <Cards
        title="FNAF Collection"
        row={true}
        data={getCollection("90980804-79f0-433d-9103-c3294a3c7ff4")}
        link="/store/"
        buttons="store"
      />
    </div>
    <Cards
      title="Puzzles"
      row={true}
      viewAll={"/store/tag/Puzzle"}
      data={getByTag("Puzzle")}
      link="/store/"
      buttons="store"
    />
    <Cards
      title="Strategy"
      row={true}
      viewAll={"/store/tag/Strategy"}
      data={getByTag("Strategy")}
      link="/store/"
      buttons="store"
    />
    <Cards
      title="Racing"
      row={true}
      viewAll={"/store/tag/Racing"}
      data={getByTag("Racing")}
      link="/store/"
      buttons="store"
    />
    <Cards
      title="Driving"
      row={true}
      viewAll={"/store/tag/Driving"}
      data={getByTag("Driving")}
      link="/store/"
      buttons="store"
    />
    <Cards
      title="Arcade"
      row={true}
      viewAll={"/store/tag/Arcade"}
      data={getByTag("Arcade")}
      link="/store/"
      buttons="store"
    />
    <Cards
      title="Simulation"
      row={true}
      viewAll={"/store/tag/Simulation"}
      data={getByTag("Simulation")}
      link="/store/"
      buttons="store"
    />
    <Cards
      title="RPG"
      row={true}
      viewAll={"/store/tag/RPG"}
      data={getByTag("RPG")}
      link="/store/"
      buttons="store"
    />
    <Cards
      title="Retro"
      row={true}
      viewAll={"/store/tag/Retro"}
      data={getByTag("Retro")}
      link="/store/"
      buttons="store"
    />
    <Cards
      title="All Games"
      data={infiniteScrollData}
      link="/store/"
      buttons="store"
    />
    {#if hasMoreItems}
      <div
        bind:this={sentinelNode}
        class="mt-8 w-full flex items-center justify-center"
      >
        <LoaderCircle class="text-muted animate-spin" />
      </div>
    {/if}
  {:else}
    <Cards data={sortedLibrary} link="/store/" buttons="store" />
  {/if}
</div>
{#if storage.catalog.length > 0 && sortedLibrary.length === 0}
  <div class="flex flex-col gap-4 h-full w-full justify-center items-center">
    <div class="flex flex-col gap-2 max-w-sm items-center">
      <SearchX class="mb-2" size="32" />
      <p class="text-sm text-center">No results found</p>
      <p class="text-muted text-sm text-center text-balance">
        Try checking for typos or adjusting your search terms. Join our Discord
        server to request a <Obfuscate text="game"></Obfuscate>.
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
