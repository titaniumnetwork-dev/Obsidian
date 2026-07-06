<script>
  import { goto } from "$app/navigation";
  import Logo from "$lib/assets/logo.svelte";
  import Cards from "$lib/components/Cards.svelte";
  import Head from "$lib/components/Head.svelte";
  import { featured } from "$lib/featured.js";
  import { getMessage } from "$lib/messages";
  import { storage } from "$lib/storage.svelte.js";
  import { SiDiscord } from "@icons-pack/svelte-simple-icons";
  import {
    Heart,
    Library,
    LockOpen,
    MessageSquare,
    SlidersHorizontal,
    Sparkles,
    Store,
  } from "@lucide/svelte";
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

<div class="flex flex-col mt-28 gap-16">
  <div class="flex flex-col gap-8 items-center mb-16">
    <Logo onclick={handleRapidClick} class="logo w-20 h-20" />
    <h1 class="text-6xl font-bold">
      Play instantly. <span class="text-text-placeholder">No downloads.</span>
    </h1>
    <p
      class="text-center max-w-2xl"
      onpointerup={(e) => (e.target.textContent = getMessage())}
    >
      Obsidian is your ultimate web-based game library. Dive into a massive
      collection of classic and modern online games, preserved Flash
      masterpieces, and emulated retro classics directly in your browser.
    </p>
    <div class="flex gap-2">
      <a
        class="h-9 px-2.5 bg-primary text-text-inverse rounded-lg flex gap-1.5 items-center cursor-pointer text-sm"
        href="/library"
      >
        <Library size="16" />
        <span>Your library</span>
      </a>
      <a
        class="h-9 px-2.5 bg-neutral-900 rounded-lg flex gap-1.5 items-center cursor-pointer border border-input text-sm"
        href="/store"
      >
        <Store size="16" />
        <span>Browse Store</span>
      </a>
    </div>
  </div>
  <div class="grid grid-cols-4 gap-4 mx-4">
    <div
      class="flex flex-col gap-1 bg-neutral-900 rounded-radius p-6 text-sm border border-border"
    >
      <div class="flex gap-1.5 items-center">
        <LockOpen size="16" />
        <p>100% Free Forever</p>
      </div>
      <p class="text-sm text-text-placeholder">
        All games are completely free, no paywalls, and no subscriptions. Enjoy
        full, unrestricted access to our entire gaming library completely free
        of charge.
      </p>
    </div>
    <div
      class="flex flex-col gap-1 bg-neutral-900 rounded-radius p-6 text-sm border border-border"
    >
      <div class="flex gap-1.5 items-center">
        <Library size="16" />
        <p>Massive Library</p>
      </div>
      <p class="text-sm text-text-placeholder">
        Play thousands of curated games directly in your browser with zero
        downloads. Powered by Ruffle for classic Flash hits and EmulatorJS for
        retro consoles.
      </p>
    </div>
    <div
      class="flex flex-col gap-1 bg-neutral-900 rounded-radius p-6 text-sm border border-border"
    >
      <div class="flex gap-1.5 items-center">
        <Heart size="16" />
        <p>Built for Gamers</p>
      </div>
      <p class="text-sm text-text-placeholder">
        Created by gamers, for gamers. We've stripped away the bloat to focus
        entirely on delivering a gaming experience with the quality-of-life
        features you actually want.
      </p>
    </div>
    <div
      class="flex flex-col gap-1 bg-neutral-900 rounded-radius p-6 text-sm border border-border"
    >
      <div class="flex gap-1.5 items-center">
        <SlidersHorizontal size="16" />
        <p>Advanced Features</p>
      </div>
      <p class="text-sm text-text-placeholder">
        Track your playtime, save your favorites, and configure advanced
        settings. Create a free Obsidian account to securely sync your settings
        and saves across devices.
      </p>
    </div>
  </div>
  <div
    class="flex items-center justify-between gap-3.5 bg-neutral-900 rounded-[10px] py-3.5 px-4 text-sm border border-border mx-4"
  >
    <MessageSquare />
    <div class="flex-col gap-1">
      <p>Join the Obsidian Community</p>
      <p class="text-text-placeholder">
        Request new games, report bugs, participate in events, and hang out with
        other players in our official Discord server.
      </p>
    </div>
    <a
      class="ml-auto h-8 px-2.5 bg-primary text-text-inverse rounded-lg flex gap-1.5 items-center cursor-pointer text-sm"
      href="https://discord.com"
    >
      <SiDiscord size="16" />
      <span>Join Discord Server</span>
    </a>
  </div>
  <div>
    <Cards
      title="Featured"
      data={featuredData}
      buttons="store"
      link="/store/"
    />
  </div>
  <div>
    <Cards
      title="Recently Added"
      data={featuredData.reverse()}
      buttons="store"
      link="/store/"
      newBadge={true}
    />
  </div>
  <div
    class="flex items-center justify-between gap-3.5 bg-neutral-900 rounded-[10px] py-3.5 px-4 text-sm border border-border mx-4"
  >
    <div class="flex-col gap-1">
      <p>Ready to start playing?</p>
      <p class="text-sm text-text-placeholder">
        Join hundreds of players using Obsidian.
      </p>
    </div>
    <div class="flex gap-2 ml-auto">
      <a
        class="h-8 px-2.5 bg-primary text-text-inverse rounded-lg flex gap-1.5 items-center cursor-pointer"
        href="/library"
      >
        <Library size="16" />
        <span>Your library</span>
      </a>
      <a
        class="h-8 px-2.5 bg-neutral-800 rounded-lg flex gap-1.5 items-center cursor-pointer border border-input"
        href="/store"
      >
        <Store size="16" />
        <span>Browse Store</span>
      </a>
    </div>
  </div>
</div>
