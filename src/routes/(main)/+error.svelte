<script>
  import { page } from "$app/stores";
  import ErrorGame from "$lib/components/ErrorGame.svelte";
  import Head from "$lib/components/Head.svelte";
  import { ArrowLeft, Home } from "@lucide/svelte";
</script>

<Head title={$page.status === 404 ? "Page Not Found" : "An Error Occurred"} />

<div class="flex flex-col gap-4 items-center my-8">
  <ErrorGame />
  <h1 class="text-4xl font-bold">
    {$page.status === 404 ? "Page Not Found" : "An Error Occurred"}
  </h1>
  <p>Message: {$page.error?.message}</p>
  <div class="flex gap-4">
    <button
      onclick={() => window.history.back()}
      class="px-4 py-2 bg-surface rounded-xl flex gap-2 items-center border border-border cursor-pointer"
    >
      <ArrowLeft size="20" />
      <span>Go Back</span>
    </button>
    <a
      class="px-4 py-2 bg-surface rounded-xl flex gap-2 items-center border border-border cursor-pointer"
      href="/"
    >
      <Home size="20" />
      <span>Home</span>
    </a>
  </div>
</div>
