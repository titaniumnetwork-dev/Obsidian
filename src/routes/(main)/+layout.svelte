<script>
  import Footer from "#lib/components/Footer.svelte";
  import MobileBlocker from "#lib/components/MobileBlocker.svelte";
  import Sidebar from "#lib/components/Sidebar.svelte";
  import "#lib/consoleMessage.js";
  import "#lib/konami.svelte.js";
  import { storage } from "#lib/storage.svelte";
  import "#lib/style/layout.css";
  import { afterNavigate, beforeNavigate } from "$app/navigation";
  import { onMount } from "svelte";
  import { Toaster } from "svelte-sonner";

  let { children, data } = $props();

  let scrollContainer = $state(null);
  const scrollPositions = new Map();

  beforeNavigate(({ from, to }) => {
    if (scrollContainer && from?.url) {
      if (!to?.url || from.url.pathname !== to.url.pathname) {
        scrollPositions.set(
          from.url.pathname + from.url.search,
          scrollContainer.scrollTop,
        );
      }
    }
  });

  afterNavigate(({ from, to, type }) => {
    if (!scrollContainer || !to?.url) return;

    // In-page search and filter changes reset/stay at top
    if (from?.url && from.url.pathname === to.url.pathname) {
      scrollContainer.scrollTop = 0;
      requestAnimationFrame(() => {
        if (scrollContainer) scrollContainer.scrollTop = 0;
      });
      return;
    }

    const key = to.url.pathname + to.url.search;
    const saved = scrollPositions.get(key);
    if (saved != null && type !== "enter") {
      requestAnimationFrame(() => {
        if (scrollContainer) {
          scrollContainer.scrollTop = saved;
          requestAnimationFrame(() => {
            if (scrollContainer && scrollContainer.scrollTop !== saved) {
              scrollContainer.scrollTop = saved;
            }
          });
        }
      });
    } else {
      scrollContainer.scrollTop = 0;
    }
  });

  onMount(async () => {
    await storage.loadStorage(data.catalogData);

    window.addEventListener("keydown", (e) => {
      if (e.code === storage.settings.panicKey) {
        if (storage.settings.panicURL) {
          e.preventDefault();
          window.location.assign(storage.settings.panicURL);
        }
      }
    });

    if (navigator.storage && navigator.storage.persist) {
      if (await navigator.storage.persisted()) {
        return;
      }

      const granted = await navigator.storage.persist();
      console.log("Storage persistence: ", granted);
    }
  });

  $effect(() => {
    if (Object.keys(storage.active).length === 0) return;

    const intervalId = setInterval(() => {
      for (const id in storage.active) {
        const entry = storage.active[id];
        const win = entry?.win;

        if (win) {
          if (win.closed || win.location.pathname !== entry.initialPath) {
            storage.quitActive(id);
          }
        }
      }
    }, 500);

    return () => clearInterval(intervalId);
  });

  function beforeUnload(e) {
    if (storage.settings.closePrevention) {
      e.preventDefault();
      e.returnValue = "";
    }
  }
</script>

<svelte:window on:beforeunload={beforeUnload} />

<Toaster
  toastOptions={{
    unstyled: true,
    classes: {
      toast:
        "w-max text-sm p-4 bg-card flex gap-4 items-center border border-border rounded-xl shadow-md",
      content: "flex-1 flex flex-col",
      description: "whitespace-nowrap text-muted",
      actionButton:
        "h-9 px-2.5 bg-primary text-primary-foreground rounded-md cursor-pointer",
    },
  }}
/>

{#if storage.isLoaded}
  <MobileBlocker>
    <Sidebar />
    <div bind:this={scrollContainer} class="w-full overflow-auto flex flex-col">
      {@render children()}
      <Footer />
    </div>
  </MobileBlocker>
{/if}
