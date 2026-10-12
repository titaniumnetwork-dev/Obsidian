<script>
  import Head from "#lib/components/Head.svelte";
  import LibraryItem from "#lib/components/LibraryItem.svelte";
  import { storage } from "#lib/storage.svelte.js";
  import { goto } from "$app/navigation";
  import { untrack } from "svelte";

  let { data } = $props();

  untrack(() => {
    if (storage.installed.includes(data.currentData.id)) {
      goto("/library/" + data.currentData.id);
    }
  });
</script>

<Head title={data.currentData.title} />

<LibraryItem {data} />
