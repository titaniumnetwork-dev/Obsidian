<script>
  import Card from "./Card.svelte";

  let { data, link, buttons, title } = $props();
</script>

{#if data.length > 0}
  {#if title}
    <p class="text-xl m-4">{title}</p>
  {/if}
  <div
    class="p-4 pt-0 grid grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-4"
  >
    {#each data as item}
      <Card data={item} {link} {buttons} />
    {/each}
  </div>
{/if}
