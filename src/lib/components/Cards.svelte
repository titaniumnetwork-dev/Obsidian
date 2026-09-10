<script>
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
  } = $props();

  const newData = $derived(row ? data.slice(0, 8) : data);
</script>

<div data-row={row} class="group flex flex-col px-4 gap-4">
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
      class="grid grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-4 
            group-data-[row=true]:grid-rows-1 
            group-data-[row=true]:gap-y-0 
            group-data-[row=true]:overflow-hidden 
            group-data-[row=true]:auto-rows-[0px]"
    >
      {#each newData as item (item.id)}
        <Card data={item} {link} {buttons} {newBadge} />
      {/each}
    </div>
  {/if}
</div>
