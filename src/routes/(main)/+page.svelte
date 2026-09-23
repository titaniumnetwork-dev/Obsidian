<script>
  import { goto } from "$app/navigation";
  import Logo from "$lib/assets/logo.svelte";
  import Cards from "$lib/components/Cards.svelte";
  import Head from "$lib/components/Head.svelte";
  import Obfuscate from "$lib/components/Obfuscate.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Card from "$lib/components/ui/Card.svelte";
  import { featured } from "$lib/featured.js";
  import { links } from "$lib/links.js";
  import { getMessage } from "$lib/messages";
  import { pwa } from "$lib/pwa.svelte";
  import { storage } from "$lib/storage.svelte.js";
  import { SiDiscord } from "@icons-pack/svelte-simple-icons";
  import {
    Download,
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

  let recentlyAddedData = $derived(
    [...storage.catalog].sort((a, b) => {
      return b.dateAdded - a.dateAdded;
    }),
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

  async function installApp() {
    if (pwa.installPrompt) {
      await pwa.installPrompt.prompt();
      const { outcome } = await pwa.installPrompt.userChoice;
      if (outcome === "accepted") {
        pwa.installPrompt = null;
      }
    }
  }
</script>

<Head />

<div class="flex flex-col mt-28 gap-16">
  <div class="flex flex-col gap-8 items-center mb-16">
    <Logo onclick={handleRapidClick} class="logo w-20 h-20" />
    <h1 class="text-6xl font-bold text-center">
      Play instantly. <span class="text-muted">No downloads.</span>
    </h1>
    <p
      class="text-center max-w-2xl h-18 flex items-center select-none"
      onpointerup={(e) => (e.target.textContent = getMessage())}
    >
      <span>
        Obsidian is your ultimate web-based <Obfuscate text="game"></Obfuscate> library.
        Dive into a massive collection of classic and modern online <Obfuscate
          text="games"
        ></Obfuscate>, preserved Flash masterpieces, and emulated retro classics
        directly in your browser.
      </span>
    </p>
    <div class="flex gap-2">
      <Button href="/library">
        <Library size="16" />
        <span>Your library</span>
      </Button>
      <Button variant="outline" href="/store">
        <Store size="16" />
        <span>Browse Store</span>
      </Button>
    </div>
  </div>
  <div class="grid grid-cols-4 gap-4 mx-4">
    <Card size="sm">
      <div class="flex gap-1.5 items-center">
        <LockOpen size="16" />
        <p>100% Free Forever</p>
      </div>
      <p class="text-sm text-muted">
        All <Obfuscate text="games"></Obfuscate> are completely free, no paywalls,
        and no subscriptions. Enjoy full, unrestricted access to our entire <Obfuscate
          text="gaming"
        ></Obfuscate> library completely free of charge.
      </p>
    </Card>
    <Card size="sm">
      <div class="flex gap-1.5 items-center">
        <Library size="16" />
        <p>Massive Library</p>
      </div>
      <p class="text-sm text-muted">
        Play hundreds of curated <Obfuscate text="games"></Obfuscate> directly in
        your browser with zero downloads. Powered by Ruffle for classic Flash hits
        and EmulatorJS for retro consoles.
      </p>
    </Card>
    <Card size="sm">
      <div class="flex gap-1.5 items-center">
        <Heart size="16" />
        <p>Built for <Obfuscate text="Gamers"></Obfuscate></p>
      </div>
      <p class="text-sm text-muted">
        Created by <Obfuscate text="gamers"></Obfuscate>, for <Obfuscate
          text="gamers"
        ></Obfuscate>. We've stripped away the bloat to focus entirely on
        delivering a <Obfuscate text="gaming"></Obfuscate> experience with the quality-of-life
        features you actually want.
      </p>
    </Card>
    <Card size="sm">
      <div class="flex gap-1.5 items-center">
        <SlidersHorizontal size="16" />
        <p>Advanced Features</p>
      </div>
      <p class="text-sm text-muted">
        Track your playtime, save your favorites, and configure many settings
        and themes with local syncing and the ability to download and store data
        and <Obfuscate text="game"></Obfuscate> saves.
      </p>
    </Card>
  </div>
  <Card class="flex-row items-center mx-4" size="sm">
    <MessageSquare />
    <div class="flex-col gap-1">
      <p>Join the Obsidian Community</p>
      <p class="text-muted">
        Request new <Obfuscate text="games"></Obfuscate>, report bugs,
        participate in events, and hang out with other players in our official
        Discord server.
      </p>
    </div>
    <Button href={links.discord} class="ml-auto">
      <SiDiscord size="16" />
      <span>Join Discord Server</span>
    </Button>
  </Card>
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
      data={recentlyAddedData}
      buttons="store"
      link="/store/"
      newBadge={true}
      row={true}
    />
  </div>
  <Card class="flex-row items-center mx-4" size="sm">
    {#if pwa.installPrompt}
      <div class="flex-col gap-1">
        <p>Play Obsidian anywhere</p>
        <p class="text-sm text-muted">
          Bypass the browser and launch games instantly.
        </p>
      </div>
      <Button class="ml-auto" onclick={installApp}>
        <Download size="16" />
        <span>Install App</span>
      </Button>
    {:else}
      <div class="flex-col gap-1">
        <p>Ready to start playing?</p>
        <p class="text-sm text-muted">
          Join hundreds of players using Obsidian.
        </p>
      </div>
      <div class="flex gap-2 ml-auto">
        <Button href="/library">
          <Library size="16" />
          <span>Your library</span>
        </Button>
        <Button variant="outline" href="/store" class="bg-secondary">
          <Store size="16" />
          <span>Browse Store</span>
        </Button>
      </div>
    {/if}
  </Card>
</div>
