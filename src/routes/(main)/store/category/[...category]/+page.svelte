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
        if (data.category) {
          return item.type === data.category;
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

<Cards title={data.category} data={sortedLibrary} link="/store/" buttons="store" />
{#if !sortedLibrary.length}
  <div class="text-text-placeholder text-center p-4 text-sm">No results found.</div>
{/if}
