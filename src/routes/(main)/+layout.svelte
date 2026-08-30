<script>
  import Footer from "$lib/components/Footer.svelte";
  import MobileBlocker from "$lib/components/MobileBlocker.svelte";
  import Sidebar from "$lib/components/Sidebar.svelte";
  import "$lib/consoleMessage.js";
  import "$lib/konami.svelte.js";
  import { storage } from "$lib/storage.svelte";
  import "$lib/style/layout.css";
  import { onMount } from "svelte";
  import { Toaster } from "svelte-sonner";

  let { children, data } = $props();

  onMount(async () => {
    storage.loadStorage(data.catalogData);

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
        "w-max text-sm px-4 py-2 bg-secondary flex gap-4 items-center border border-border rounded-2xl shadow-lg",
      content: "flex-1 flex flex-col",
      description: "whitespace-nowrap text-muted",
      actionButton:
        "px-4 py-1 bg-primary text-card rounded-xl border border-border-primary cursor-pointer",
    },
  }}
/>

{#if storage.isLoaded}
  <MobileBlocker>
    <Sidebar />
    <div class="w-full overflow-auto flex flex-col">
      {@render children()}
      <Footer />
    </div>
  </MobileBlocker>
{/if}
