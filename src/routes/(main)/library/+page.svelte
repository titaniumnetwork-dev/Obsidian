<script>
  import Cards from "$lib/components/Cards.svelte";
  import Head from "$lib/components/Head.svelte";
  import { storage } from "$lib/storage.svelte.js";
  import { Check, ChevronDown, Dice5, SearchIcon, X } from "@lucide/svelte";

  let { data } = $props();

  let searchQuery = $state("");

  let allTagsSelected = $derived(
    storage.settings.tagFilter.length === storage.tags.length,
  );

  let sortedLibrary = $derived(
    storage.library
      .filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .filter((item) => {
        if (allTagsSelected) {
          return true;
        }

        return item.tags.some((tag) =>
          storage.settings.tagFilter.includes(tag),
        );
      })
      .filter((item) => {
        if (storage.settings.category === "all") {
          return true;
        } else {
          return item.type === storage.settings.category;
        }
      })
      .sort((a, b) => {
        const compareAlphabetically = () =>
          (a.title || "").localeCompare(b.title || "");
        const compareAlphabeticallyReverse = () =>
          (b.title || "").localeCompare(a.title || "");

        if (storage.settings.sortBy === "alphabetical") {
          return compareAlphabetically();
        } else if (storage.settings.sortBy === "alphabetical_reverse") {
          return compareAlphabeticallyReverse();
        } else if (storage.settings.sortBy === "recent") {
          const lastPlayedA = Number(storage.playTime[a.id]?.lastPlayed) || 0;
          const lastPlayedB = Number(storage.playTime[b.id]?.lastPlayed) || 0;

          if (lastPlayedA !== lastPlayedB) {
            return lastPlayedB - lastPlayedA;
          }

          return compareAlphabetically();
        } else if (storage.settings.sortBy === "most_played") {
          const playTimeA = Number(storage.playTime[a.id]?.playTime) || 0;
          const playTimeB = Number(storage.playTime[b.id]?.playTime) || 0;

          if (playTimeA !== playTimeB) {
            return playTimeB - playTimeA;
          }

          return compareAlphabetically();
        }

        return 0;
      }),
  );

  function pickRandom() {
    if (sortedLibrary.length === 0) return;
    window.location.href =
      "/library/" +
      sortedLibrary[Math.floor(Math.random() * sortedLibrary.length)].id;
  }

  let sortNode;
  let categoryNode;
  let tagsNode;

  function handleClickOutside(event) {
    if (sortNode && !sortNode.contains(event.target)) {
      sortNode.removeAttribute("open");
    }
    if (categoryNode && !categoryNode.contains(event.target)) {
      categoryNode.removeAttribute("open");
    }
    if (tagsNode && !tagsNode.contains(event.target)) {
      tagsNode.removeAttribute("open");
    }
  }
</script>

<Head title="Library" />

<svelte:window onclick={handleClickOutside} />

<div
  class="flex gap-4 p-4 pt-0 justify-between bg-background sticky top-22.5 sorting"
>
  <div class="flex gap-4 shrink-0">
    <details
      class="relative bg-surface rounded-xl border border-border"
      bind:this={sortNode}
    >
      <summary
        class="rounded-xl flex px-4 py-2 cursor-pointer text-sm justify-between items-center h-full"
      >
        <span class="mr-2 select-none truncate">
          {#if storage.settings.sortBy === "alphabetical"}
            Name (A-Z)
          {:else if storage.settings.sortBy === "alphabetical_reverse"}
            Name (Z-A)
          {:else if storage.settings.sortBy === "recent"}
            Recent
          {:else if storage.settings.sortBy === "most_played"}
            Most Played
          {/if}
        </span>
        <ChevronDown size="20" class="shrink-0" />
      </summary>
      <div
        class="absolute mt-2 min-w-full w-max bg-secondary rounded-xl max-h-60 overflow-y-auto border border-surface z-10 flex flex-col"
      >
        <button
          class="flex items-center px-4 py-2 gap-2 cursor-pointer hover:bg-surface text-sm transition-colors"
          onclick={(e) => {
            storage.updateSetting("sortBy", "alphabetical");
            e.currentTarget.closest("details").removeAttribute("open");
          }}
        >
          Name (A-Z)
        </button>
        <button
          class="flex items-center px-4 py-2 gap-2 cursor-pointer hover:bg-surface text-sm transition-colors"
          onclick={(e) => {
            storage.updateSetting("sortBy", "alphabetical_reverse");
            e.currentTarget.closest("details").removeAttribute("open");
          }}
        >
          Name (Z-A)
        </button>
        <button
          class="flex items-center px-4 py-2 gap-2 cursor-pointer hover:bg-surface text-sm transition-colors"
          onclick={(e) => {
            storage.updateSetting("sortBy", "recent");
            e.currentTarget.closest("details").removeAttribute("open");
          }}
        >
          Recent
        </button>
        <button
          class="flex items-center px-4 py-2 gap-2 cursor-pointer hover:bg-surface text-sm transition-colors"
          onclick={(e) => {
            storage.updateSetting("sortBy", "most_played");
            e.currentTarget.closest("details").removeAttribute("open");
          }}
        >
          Most Played
        </button>
      </div>
    </details>
    <details
      class="relative bg-surface rounded-xl border border-border"
      bind:this={categoryNode}
    >
      <summary
        class="rounded-xl flex px-4 py-2 cursor-pointer text-sm justify-between items-center h-full"
      >
        <span class="mr-2 select-none truncate">
          {#if storage.settings.category === "all"}
            All Types
          {:else}
            {storage.settings.category}
          {/if}
        </span>
        <ChevronDown size="20" class="shrink-0" />
      </summary>
      <div
        class="absolute mt-2 min-w-full w-max bg-secondary rounded-xl max-h-60 overflow-y-auto border border-surface z-10 flex flex-col"
      >
        <button
          class="flex items-center px-4 py-2 gap-2 cursor-pointer hover:bg-surface text-sm transition-colors"
          onclick={(e) => {
            storage.updateSetting("category", "all");
            e.currentTarget.closest("details").removeAttribute("open");
          }}
        >
          All Types
        </button>
        <button
          class="flex items-center px-4 py-2 gap-2 cursor-pointer hover:bg-surface text-sm transition-colors"
          onclick={(e) => {
            storage.updateSetting("category", "HTML");
            e.currentTarget.closest("details").removeAttribute("open");
          }}
        >
          HTML
        </button>
        <button
          class="flex items-center px-4 py-2 gap-2 cursor-pointer hover:bg-surface text-sm transition-colors"
          onclick={(e) => {
            storage.updateSetting("category", "Flash");
            e.currentTarget.closest("details").removeAttribute("open");
          }}
        >
          Flash
        </button>
        <button
          class="flex items-center px-4 py-2 gap-2 cursor-pointer hover:bg-surface text-sm transition-colors"
          onclick={(e) => {
            storage.updateSetting("category", "Emulation");
            e.currentTarget.closest("details").removeAttribute("open");
          }}
        >
          Emulation
        </button>
      </div>
    </details>
    <details
      class="relative bg-surface rounded-xl border border-border"
      bind:this={tagsNode}
    >
      <summary class="rounded-xl flex px-4 py-2 cursor-pointer text-sm">
        <span class="mr-2 select-none">
          {#if storage.settings.tagFilter.length === 0}
            Select Tags
          {:else if allTagsSelected}
            All Tags
          {:else}
            {storage.settings.tagFilter.length > 1
              ? storage.settings.tagFilter.length + " Tags"
              : storage.settings.tagFilter[0]}
          {/if}
        </span>
        <ChevronDown size="20" />
      </summary>
      <div
        class="absolute mt-2 min-w-full w-max bg-secondary rounded-xl max-h-60 overflow-y-auto border border-surface z-10"
      >
        <label
          class="flex items-center px-4 py-2 gap-2 cursor-pointer hover:bg-surface text-sm transition-colors"
        >
          <div class="relative flex items-center justify-center">
            <input
              type="checkbox"
              class="peer w-4 h-4 cursor-pointer appearance-none border border-border checked:bg-primary rounded"
              checked={allTagsSelected}
              onchange={(e) =>
                storage.updateSetting(
                  "tagFilter",
                  e.target.checked ? [...storage.tags] : [],
                )}
            />
            <Check
              class="absolute hidden peer-checked:block text-text-inverse"
              size="14"
            />
          </div>
          <p class="select-none">All Tags</p>
        </label>
        {#each storage.tags as tag}
          <label
            class="flex items-center px-4 py-2 gap-2 cursor-pointer hover:bg-surface text-sm transition-colors"
          >
            <div class="relative flex items-center justify-center">
              <input
                type="checkbox"
                class="peer w-4 h-4 cursor-pointer appearance-none border border-border checked:bg-primary rounded"
                value={tag}
                checked={storage.settings.tagFilter.includes(tag)}
                onchange={(e) => {
                  const isChecked = e.target.checked;

                  const newTags = isChecked
                    ? [...storage.settings.tagFilter, tag]
                    : storage.settings.tagFilter.filter((t) => t !== tag);

                  storage.updateSetting("tagFilter", newTags);
                }}
              />
              <Check
                class="absolute hidden peer-checked:block text-text-inverse"
                size="14"
              />
            </div>
            <p class="select-none">{tag}</p>
          </label>
        {/each}
      </div>
    </details>
    <button
      onclick={pickRandom}
      class="px-4 py-2 text-sm bg-surface rounded-xl flex items-center gap-2 cursor-pointer border border-border"
    >
      <Dice5 size="20" />
      <span>Random</span>
    </button>
  </div>
  <div
    class="focus-within:bg-surface bg-secondary rounded-xl items-center flex w-80 shrink min-w-0 border border-border"
  >
    <SearchIcon size="20" class="ml-3 text-text-placeholder shrink-0" />
    <input
      bind:value={searchQuery}
      placeholder="Search"
      class="w-full h-full pl-2 pr-4 bg-transparent outline-none placeholder:text-text-placeholder"
    />
    {#if searchQuery.length > 0}
      <button
        class="mr-3 cursor-pointer shrink-0 text-text-placeholder"
        onclick={() => (searchQuery = "")}
      >
        <X size="20" />
      </button>
    {/if}
  </div>
</div>
<Cards data={sortedLibrary} />
{#if storage.library.length > 0 && sortedLibrary.length === 0}
  <div class="text-text-placeholder text-center p-4">No results found.</div>
{/if}
{#if storage.library.length === 0}
  <div class="text-text-placeholder text-center p-4">
    Nothing in your library. Check out the
    <a href="/store" class="text-primary hover:underline">store!</a>
  </div>
{/if}
