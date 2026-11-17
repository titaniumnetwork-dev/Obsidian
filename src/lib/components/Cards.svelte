<script>
  import { storage } from "#lib/storage.svelte.js";
  import { ChevronRight } from "@lucide/svelte";
  import Card from "./Card.svelte";
  import Button from "./ui/Button.svelte";

  let {
    data,
    link = "/library/",
    buttons = "default",
    title,
    row = false,
    viewAll,
    newBadge = false,
    cols = $bindable(5),
  } = $props();

  let gridNode = $state(null);
  let gridWidth = $state(0);

  const rowCount = $derived(
    row === true ? 1 : typeof row === "number" && row > 0 ? row : 0,
  );

  $effect(() => {
    gridWidth;
    storage.settings.cards;
    if (!gridNode) return;

    const tracks = getComputedStyle(gridNode).gridTemplateColumns;
    if (tracks && tracks !== "none") {
      cols = tracks.split(" ").length;
    }
  });

  const newData = $derived(
    rowCount > 0 ? data.slice(0, rowCount * cols) : data,
  );
</script>

<div class="group flex flex-col px-4 gap-4">
  {#if data.length > 0}
    {#if title}
      {#if viewAll}
        <div class="flex items-center justify-between gap-2">
          <p class="flex items-center">{title}</p>
          <Button variant="link" href={viewAll}>
            <span>View All</span>
            <ChevronRight size="16" />
          </Button>
        </div>
      {:else}
        <p class="flex items-center">{title}</p>
      {/if}
    {/if}
    <div
      bind:this={gridNode}
      bind:clientWidth={gridWidth}
      data-cards-style={storage.settings.cards}
      class="grid data-[cards-style=compact]:grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] data-[cards-style=default]:grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] data-[cards-style=showcase]:grid-cols-[repeat(auto-fill,minmax(13.5rem,1fr))] gap-4"
    >
      {#each newData as item (item.id)}
        <Card data={item} {link} {buttons} {newBadge} />
      {/each}
    </div>
  {/if}
</div>
