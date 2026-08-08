<script>
  let { children } = $props();
</script>

<main class="flex flex-col gap-4 p-4 mx-auto w-full">
  {@render children()}
</main>
