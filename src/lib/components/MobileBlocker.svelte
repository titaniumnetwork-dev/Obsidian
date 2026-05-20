<script lang="ts">
  import { Smartphone } from "@lucide/svelte";

  let { children } = $props();

  let isMobile = $state(true);

  $effect(() => {
    const checkMobile = () => {
      isMobile = window.innerWidth < 768;
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  });
</script>

{#if isMobile}
  <div class="w-full h-full flex flex-col items-center justify-center p-4 gap-4 text-center">
    <Smartphone size="128" />
    <h1 class="text-2xl font-bold">Mobile Not Supported</h1>
    <p class="text-text-placeholder">
      Please view this application on a desktop browser.
    </p>
  </div>
{:else}
  {@render children()}
{/if}
