<script>
  import Logo from "#lib/assets/logo.svelte";
  import Cards from "#lib/components/Cards.svelte";
  import Head from "#lib/components/Head.svelte";
  import Obfuscate from "#lib/components/Obfuscate.svelte";
  import Button from "#lib/components/ui/Button.svelte";
  import Card from "#lib/components/ui/Card.svelte";
  import { featured } from "#lib/featured.js";
  import { links } from "#lib/links.js";
  import { getMessage } from "#lib/messages";
  import { pwa } from "#lib/pwa.svelte";
  import { storage } from "#lib/storage.svelte.js";
  import { goto } from "$app/navigation";
  import { SiDiscord } from "@icons-pack/svelte-simple-icons";
  import {
    Download,
    Library,
    MessageSquare,
    Sparkles,
    Store,
  } from "@lucide/svelte";
  import { toast } from "svelte-sonner";
  let { data } = $props();

  if (storage.settings.libraryMode) {
    goto("/library");
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
  <div class="flex flex-col gap-8 items-center">
    <Logo onclick={handleRapidClick} class="logo w-20 h-20" />
    <h1 class="text-6xl font-bold text-center">
      Play instantly. <span class="text-muted">No downloads.</span>
    </h1>
    <p
      class="text-center max-w-2xl h-18 flex items-center select-none"
      onpointerup={(e) => (e.target.textContent = getMessage())}
    >
      <span>
        Obsidian is your ultimate web-based <Obfuscate
          class="pointer-events-none"
          text="game"
        ></Obfuscate> library. Dive into a massive collection of classic and modern
        online <Obfuscate class="pointer-events-none" text="games"></Obfuscate>,
        preserved Flash masterpieces, and emulated retro classics directly in
        your browser.
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
      <MessageSquare />
      <div class="flex-col gap-1">
        <p>Join the <Obfuscate text="TN"></Obfuscate> Community</p>
        <p class="text-muted">
          Request new <Obfuscate text="games"></Obfuscate>, report bugs,
          participate in events, and hang out with other players in the <Obfuscate
            text="TitaniumNetwork"
          ></Obfuscate> Discord.
        </p>
      </div>
      <Button href={links.discord} class="ml-auto">
        <SiDiscord size="16" />
        <span>Join Discord Server</span>
      </Button>
    {/if}
  </Card>
</div>
