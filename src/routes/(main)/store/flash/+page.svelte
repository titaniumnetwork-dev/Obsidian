<script>
  import Cards from "$lib/components/Cards.svelte";
  import Obfuscate from "$lib/components/Obfuscate.svelte";
  import { links } from "$lib/links.js";
  import { storage } from "$lib/storage.svelte";
  import { SiDiscord } from "@icons-pack/svelte-simple-icons";
  import { SearchX } from "@lucide/svelte";
  import { getContext } from "svelte";

  let { data } = $props();

  let searchQuery = getContext("searchQuery");

  let sortedLibrary = $derived(
    storage.catalog
      .filter((item) =>
        item.title.toLowerCase().includes(searchQuery().toLowerCase()),
      )
      .filter((item) => {
        return item.type === "Flash";
      })
      .sort((a, b) => {
        //Alphabetical
        return (a.title || "").localeCompare(b.title || "");
      }),
  );
</script>

<Cards title="Flash" data={sortedLibrary} link="/store/" buttons="store" />
{#if !sortedLibrary.length}
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
