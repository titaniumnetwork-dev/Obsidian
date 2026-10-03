<script>
  import { page } from "$app/state";
  import ErrorGame from "#lib/components/ErrorGame.svelte";
  import Footer from "#lib/components/Footer.svelte";
  import Head from "#lib/components/Head.svelte";
  import Sidebar from "#lib/components/Sidebar.svelte";
  import Button from "#lib/components/ui/Button.svelte";
  import { storage } from "#lib/storage.svelte";
  import { ArrowLeft, Home } from "@lucide/svelte";
</script>

<Head title={page.status === 404 ? "Page Not Found" : "An Error Occurred"} />

<Sidebar />
<div class="w-full overflow-auto flex flex-col">
  <div class="flex flex-col gap-4 items-center my-8">
    <ErrorGame />
    <h1 class="text-4xl font-bold">
      {page.status === 404 ? "Page Not Found" : "An Error Occurred"}
    </h1>
    <p>Message: {page.error?.message}</p>
    <div class="flex gap-4">
      <Button variant="outline" onclick={() => window.history.back()}>
        <ArrowLeft size="16" />
        <span>Go Back</span>
      </Button>
      <Button
        variant="outline"
        href={storage.settings.libraryMode ? "/library" : "/"}
      >
        <Home size="16" />
        <span>Home</span>
      </Button>
    </div>
  </div>
  <Footer />
</div>
