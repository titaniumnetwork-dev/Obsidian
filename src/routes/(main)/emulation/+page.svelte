<script>
  import Head from "$lib/components/Head.svelte";
  import { companies, emulators } from "$lib/emulators";
  import { Search, X } from "@lucide/svelte";

  let searchQuery = $state("");
  let filterCompany = $state("");

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
    class="bg-neutral-900 rounded-lg items-center flex w-96 border border-input h-9 px-2.5 gap-1.5"
  >
    <Search size="16" class="text-text-placeholder shrink-0" />
    <input
      bind:value={searchQuery}
      placeholder="Search emulators"
      class="w-full h-full bg-transparent outline-none placeholder:text-text-placeholder text-sm"
    />
    {#if searchQuery.length > 0}
      <button
        class="cursor-pointer shrink-0 text-text-placeholder"
        onclick={() => (searchQuery = "")}
      >
        <X size="16" />
      </button>
    {/if}
  </div>
  <div class="flex gap-2 overflow-y-scroll no-scrollbar">
    <button
      onclick={() => (filterCompany = "")}
      data-active={filterCompany === ""}
      class="h-9 px-2.5 rounded-lg flex gap-1.5 items-center cursor-pointer border border-input text-sm transition-colors bg-neutral-900 data-[active=true]:bg-neutral-800"
      >All</button
    >
    {#each companies as company}
      <button
        onclick={() => (filterCompany = company)}
        data-active={filterCompany === company}
        class="h-9 px-2.5 rounded-lg flex gap-1.5 items-center cursor-pointer border border-input text-sm transition-colors bg-neutral-900 data-[active=true]:bg-neutral-800"
        >{company}</button
      >
    {/each}
  </div>
</div>
<div class="flex flex-col px-4">
  <div class="grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-4">
    {#each filteredEmulators as item (item.id)}
      <a
        class="w-full cursor-pointer flex flex-col gap-2 bg-neutral-900 rounded-radius p-2 text-sm border border-border"
        href={"/emulation/" + item.id}
      >
        <div
          class="aspect-square bg-neutral-800 rounded-lg flex items-center justify-center"
        >
          <item.icon class="size-3/5" />
        </div>
        <div class="flex flex-col">
          <span>{item.shortTitle || item.title}</span>
          <span class="text-xs text-text-placeholder">{item.company}</span>
        </div>
      </a>
    {/each}
  </div>
</div>
{#if filteredEmulators.length === 0}
  <div class="text-text-placeholder text-center p-4 text-sm">
    No results found
  </div>
{/if}
