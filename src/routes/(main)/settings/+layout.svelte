<script>
  import Head from "$lib/components/Head.svelte";

  let { children } = $props();
</script>

<Head title="Settings" />

<main class="flex flex-col gap-4 p-4 mx-auto w-full">
  {@render children()}
</main>
