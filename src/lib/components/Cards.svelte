<script>
  import Card from "./Card.svelte";

  let {
    data,
    link = "/library/",
    buttons = "default",
    title,
    newBadge = false,
  } = $props();
</script>

<div class="flex flex-col px-4 gap-4">
  {#if data.length > 0}
    {#if title}
      <p class="flex items-center">{title}</p>
    {/if}
    <div class="grid grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-4">
      {#each data as item (item.id)}
        <Card data={item} {link} {buttons} {newBadge} />
      {/each}
    </div>
  {/if}
</div>
