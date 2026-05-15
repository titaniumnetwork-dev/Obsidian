<script>
  import { goto } from "$app/navigation";
  import Head from "$lib/components/Head.svelte";
  import LibraryItem from "$lib/components/LibraryItem.svelte";
  import { storage } from "$lib/storage.svelte.js";
  import { untrack } from "svelte";

  let { data } = $props();

  untrack(() => {
    if (data && !storage.installed.includes(data.currentData.id)) {
      goto("/store/" + data.currentData.id, {
        replaceState: true,
      });
    }
  });
</script>

<Head title={data.currentData.title} />

<LibraryItem {data} />
