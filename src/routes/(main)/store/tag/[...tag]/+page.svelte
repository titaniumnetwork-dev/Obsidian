<script>
  import Cards from "$lib/components/Cards.svelte";
  import { storage } from "$lib/storage.svelte";
  import { getContext } from "svelte";

  let { data } = $props();

  let searchQuery = getContext("searchQuery");

  let sortedLibrary = $derived(
    storage.catalog
      .filter((item) =>
        item.title.toLowerCase().includes(searchQuery().toLowerCase()),
      )
      .filter((item) => {
        if (data.tag) {
          return item.tags.some((itemTag) => data.tag === itemTag);
        } else {
          return true;
        }
      })
      .sort((a, b) => {
        //Alphabetical
        return (a.title || "").localeCompare(b.title || "");
      }),
  );
</script>

<Cards title={data.tag} data={sortedLibrary} link="/store/" buttons="store" />
{#if !sortedLibrary.length}
  <div class="text-muted text-center p-4 text-sm">No results found.</div>
{/if}
