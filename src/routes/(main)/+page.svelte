<script>
  import { goto } from "$app/navigation";
  import Logo from "$lib/assets/logo.svelte";
  import Cards from "$lib/components/Cards.svelte";
  import Head from "$lib/components/Head.svelte";
  import { featured } from "$lib/featured.js";
  import { getMessage } from "$lib/messages";
  import { storage } from "$lib/storage.svelte.js";
  import { LayoutGrid, Play, Sparkles, Store } from "@lucide/svelte";
  import { toast } from "svelte-sonner";

  let { data } = $props();

  if (storage.settings.libraryMode) {
    goto("/library", {
      replaceState: true,
    });
  }

  let featuredData = featured
    .map((id) => storage.catalog.find((item) => item.id === id))
    .filter(Boolean);

  let currentlyPlayingData = $derived(
    [...storage.library].filter((item) => storage.active[item.id]).reverse(),
  );

  let favoritesData = $derived(
    storage.favorites
      .map((id) => storage.library.find((item) => item.id === id))
      .filter(Boolean),
  );

  const recentData = $derived(
    Object.entries(storage.playTime)
      .sort((a, b) => {
        return b[1].lastPlayed - a[1].lastPlayed;
      })
      .map((item) => storage.catalog.find((g) => g.id === item[0]))
      .filter((item) => !storage.active[item.id])
      .slice(0, 10),
  );

  let clickCount = $state(0);
  let timeoutId;

  function handleRapidClick() {
    clickCount++;

    clearTimeout(timeoutId);

    if (clickCount >= 10) {
      if (!storage.hiddenThemes.includes("Space")) {
        storage.addHiddenTheme("Space");
        storage.updateTheme("Space");
        toast("Theme Unlocked", {
          description: "You unlocked the Space theme!",
          position: "bottom-center",
          icon: Sparkles,
          action: {
            label: "Settings",
            onClick: () => goto("/settings/appearance"),
          },
        });
      }
      clickCount = 0;
    } else {
      timeoutId = setTimeout(() => {
        clickCount = 0;
      }, 1000);
    }
  }
</script>

<Head />

<div class="flex flex-col gap-2 items-center mt-32 mb-16">
  <Logo onclick={handleRapidClick} class="logo w-32 h-32" />
  <h1 class="text-4xl font-bold">Obsidian</h1>
  <p onpointerup={(e) => (e.target.textContent = getMessage())}>
    Your new favorite place on the internet!
  </p>
  <div class="homeButtons flex gap-4 mt-2">
    {#if currentlyPlayingData.length > 0}
      <button
        onclick={() => storage.resumeActive(currentlyPlayingData[0].id)}
        class="px-4 py-2 bg-primary text-text-inverse rounded-xl flex gap-2 items-center cursor-pointer border border-border-primary"
      >
        <Play size="20" />
        <span
          >Resume
          {currentlyPlayingData[0].title}</span
        >
      </button>
    {/if}
    <a
      class="px-4 py-2 bg-surface rounded-xl flex gap-2 items-center border border-border"
      href="/library"
    >
      <LayoutGrid size="20" />
      <span>Your library</span>
    </a>
    <a
      class="px-4 py-2 bg-surface rounded-xl flex gap-2 items-center border border-border"
      href="/store"
    >
      <Store size="20" />
      <span>Browse Store</span>
    </a>
  </div>
</div>
<Cards title="Currently Playing" data={currentlyPlayingData} />
<Cards title="Recent" data={recentData} />
<Cards title="Favorites" data={favoritesData} />
<Cards title="Featured" data={featuredData} buttons="store" link="/store/" />
