<script>
  import { page } from "$app/stores";
  import Head from "$lib/components/Head.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import { companies, emulators } from "$lib/emulators";
  import { removeURLParam, setURLParam } from "$lib/utils";
  import { Search, X } from "@lucide/svelte";

  let searchQuery = $state($page.data.search || "");
  let filterCompany = $state("");

  if ($page.data.company) {
    if (companies.includes($page.data.company)) {
      filterCompany = $page.data.company;
    }
  }

  let filteredEmulators = $derived.by(() => {
    return emulators
      .filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .filter((item) => (filterCompany ? item.company === filterCompany : true))
      .sort((a, b) => {
        return (a.title || "").localeCompare(b.title || "");
      });
  });
</script>

<Head title="Emulation" />

<div class="flex gap-2 p-4 bg-background sticky top-0 z-10">
  <div
    class="bg-card rounded-lg items-center flex w-96 border border-input h-9 px-2.5 gap-1.5"
  >
    <Search size="16" class="text-muted shrink-0" />
    <input
      oninput={(e) =>
        e.target.value
          ? setURLParam("search", e.target.value)
          : removeURLParam("search")}
      bind:value={searchQuery}
      placeholder="Search emulators"
      class="w-full h-full bg-transparent outline-none placeholder:text-muted text-sm"
    />
    {#if searchQuery.length > 0}
      <button
        class="cursor-pointer shrink-0 text-muted"
        onclick={() => ((searchQuery = ""), removeURLParam("search"))}
      >
        <X size="16" />
      </button>
    {/if}
  </div>
  <div class="flex gap-2 overflow-y-scroll no-scrollbar">
    <Button
      variant="outline"
      onclick={() => ((filterCompany = ""), removeURLParam("company"))}
      data-active={filterCompany === ""}
      class="data-[active=true]:bg-secondary">All</Button
    >
    {#each companies as company}
      <Button
        variant="outline"
        onclick={() => (
          (filterCompany = company),
          setURLParam("company", company)
        )}
        data-active={filterCompany === company}
        class="data-[active=true]:bg-secondary">{company}</Button
      >
    {/each}
  </div>
</div>
<div class="flex flex-col px-4">
  <div class="grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-4">
    {#each filteredEmulators as item (item.id)}
      <a
        class="w-full cursor-pointer flex flex-col gap-2 bg-card rounded-lg p-2 text-sm border border-border"
        href={"/emulation/" + item.id}
      >
        <div
          class="aspect-square bg-secondary rounded-md flex items-center justify-center"
        >
          <item.icon class="size-3/5" />
        </div>
        <div class="flex flex-col">
          <span>{item.shortTitle || item.title}</span>
          <span class="text-xs text-muted">{item.company}</span>
        </div>
      </a>
    {/each}
  </div>
</div>
{#if filteredEmulators.length === 0}
  <div class="text-muted text-center p-4 text-sm">
    No results found
  </div>
{/if}
