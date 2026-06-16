<script>
  import { invalidateAll } from "$app/navigation";
  import { storage } from "$lib/storage.svelte";
  import { X } from "@lucide/svelte";

  let { authClient, impersonating } = $props();

  async function stopImpersonating() {
    await authClient.admin.stopImpersonating();
    await invalidateAll();
    await storage.broadcastAuthChange();
  }
</script>

{#if impersonating}
  <div
    class="absolute h-8 left-4 right-4 w-full bg-background z-40 text-sm flex gap-2 items-center justify-center"
  >
    <span>Currently Impersonating User</span>
    <X
      size="20"
      class="cursor-pointer"
      onclick={async () => await stopImpersonating()}
    />
  </div>
{/if}
