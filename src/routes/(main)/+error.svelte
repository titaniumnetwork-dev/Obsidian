<script>
  import { page } from "$app/stores";
  import ErrorGame from "$lib/components/ErrorGame.svelte";
  import Head from "$lib/components/Head.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import { storage } from "$lib/storage.svelte";
  import { ArrowLeft, Home } from "@lucide/svelte";
</script>

<Head title={$page.status === 404 ? "Page Not Found" : "An Error Occurred"} />

<div class="flex flex-col gap-4 items-center my-8">
  <ErrorGame />
  <div class="flex items-center flex-col gap-2">
    <p>
      {$page.status === 404 ? "Page Not Found" : "An Error Occurred"}
    </p>
    <p class="text-sm text-text-placeholder">
      {$page.error?.message === "Not found"
        ? "The page you're looking for doesn't exist"
        : $page.error?.message}
    </p>
  </div>
  <div class="flex gap-2">
    <Button variant="outline" onclick={() => window.history.back()}>
      <ArrowLeft size="16" />
      <span>Go Back</span>
    </Button>
    <Button
      variant="outline"
      href={storage.settings.libraryMode ? "/library" : "/"}
    >
      <Home size="16" />
      <span>{storage.settings.libraryMode ? "Library" : "Home"}</span>
    </Button>
  </div>
</div>
