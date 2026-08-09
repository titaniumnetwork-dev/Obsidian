<script>
  import { page } from "$app/stores";
  import Cards from "$lib/components/Cards.svelte";
  import Head from "$lib/components/Head.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import { storage } from "$lib/storage.svelte.js";
  import { removeURLParam, setURLParam } from "$lib/utils.js";
  import {
    ArrowDownUp,
    Check,
    ChevronDown,
    Dice5,
    Ghost,
    Search,
    SearchX,
    Store,
    Tags,
    X,
  } from "@lucide/svelte";

  let { data } = $props();

  let searchQuery = $state($page.data.search || "");
  let sortCategory = $state("all");
  let tagFilter = $state(storage.tags);

  if ($page.data.category) {
    if (["all", "Flash", "HTML", "Emulation"].includes($page.data.category)) {
      sortCategory = $page.data.category;
    }
  }

  if ($page.data.tags) {
    try {
      let tagData = JSON.parse($page.data.tags);
      if (Array.isArray(tagData)) {
        tagData = tagData.filter((tag) => storage.tags.includes(tag));
        if (tagData.length) {
          tagFilter = tagData;
        }
      }
    } catch {}
  }

  let allTagsSelected = $derived(tagFilter.length === storage.tags.length);

  let sortedLibrary = $derived(
    storage.library
      .filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .filter((item) => {
        if (allTagsSelected) {
          return true;
        }

        return item.tags.some((tag) => tagFilter.includes(tag));
      })
      .filter((item) => {
        if (sortCategory === "all") {
          return true;
        } else {
          return item.type === sortCategory;
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

  function pickRandom(e) {
    if (sortedLibrary.length === 0) return;

    e.target.children[0].classList.add("animate-shake");
    setTimeout(() => {
      e.target.children[0].classList.remove("animate-shake");
      window.location.href =
        "/library/" +
        sortedLibrary[Math.floor(Math.random() * sortedLibrary.length)].id;
    }, 300);
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

<div class="flex gap-2 p-4 justify-between bg-background sticky top-0 z-10">
  <div class="flex gap-2">
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
        placeholder="Search library"
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
    <details
      class="relative bg-card rounded-lg border border-input h-9"
      bind:this={tagsNode}
    >
      <summary
        class="flex gap-1.5 cursor-pointer text-sm justify-between items-center h-full select-none px-2"
      >
        {#if tagFilter.length === 0}
          <Tags size="16" />
          <span>Select Tags</span>
          <ChevronDown size="16" />
        {:else if allTagsSelected}
          <Tags size="16" />
        {:else}
          <Tags size="16" />
          <span>
            {tagFilter.length > 1
              ? tagFilter.length + " Tags"
              : tagFilter[0]}</span
          >
          <ChevronDown size="16" />
        {/if}
      </summary>
      <div
        class="absolute -left-px -right-px min-w-[calc(100%+2px)] w-max mt-2.5 bg-card rounded-lg max-h-60 overflow-y-auto border border-input z-10 flex flex-col p-1"
      >
        <label
          class="rounded-md flex items-center px-2 py-1.5 gap-1.5 cursor-pointer hover:bg-secondary text-sm transition-colors"
        >
          <div class="relative flex items-center justify-center">
            <input
              type="checkbox"
              class="peer w-4 h-4 cursor-pointer appearance-none border border-border checked:bg-primary rounded"
              checked={allTagsSelected}
              onchange={(e) => (
                (tagFilter = e.target.checked ? [...storage.tags] : []),
                removeURLParam("tags")
              )}
            />
            <Check
              class="absolute hidden peer-checked:block text-card"
              size="14"
            />
          </div>
          <p class="select-none">All Tags</p>
        </label>
        {#each storage.tags as tag}
          <label
            class="rounded-md flex items-center px-2 py-1.5 gap-1.5 cursor-pointer hover:bg-secondary text-sm transition-colors"
          >
            <div class="relative flex items-center justify-center">
              <input
                type="checkbox"
                class="peer w-4 h-4 cursor-pointer appearance-none border border-border checked:bg-primary rounded"
                value={tag}
                checked={tagFilter.includes(tag)}
                onchange={(e) => {
                  const isChecked = e.target.checked;

                  const newTags = isChecked
                    ? [...tagFilter, tag]
                    : tagFilter.filter((t) => t !== tag);

                  tagFilter = newTags;
                  setURLParam("tags", JSON.stringify(newTags));
                }}
              />
              <Check
                class="absolute hidden peer-checked:block text-card"
                size="14"
              />
            </div>
            <p class="select-none">{tag}</p>
          </label>
        {/each}
      </div>
    </details>
    {#if sortedLibrary.length > 0}
      <Button variant="outline" size="icon" onclick={(e) => pickRandom(e)}>
        <Dice5 class="pointer-events-none" size="16" />
      </Button>
    {/if}
  </div>
  <div class="flex gap-2">
    <div
      class="bg-card flex items-center p-1 h-9 rounded-lg text-sm border border-input gap-1"
    >
      <button
        onclick={() => ((sortCategory = "all"), removeURLParam("category"))}
        data-active={sortCategory === "all"}
        class="h-full flex items-center data-[active=true]:bg-input transition-colors rounded-md px-2 cursor-pointer"
        >All</button
      >
      <button
        onclick={() => (
          (sortCategory = "HTML"),
          setURLParam("category", "HTML")
        )}
        data-active={sortCategory === "HTML"}
        class="h-full flex items-center data-[active=true]:bg-input transition-colors rounded-md px-2 cursor-pointer"
        >HTML</button
      >
      <button
        onclick={() => (
          (sortCategory = "Flash"),
          setURLParam("category", "Flash")
        )}
        data-active={sortCategory === "Flash"}
        class="h-full flex items-center data-[active=true]:bg-input transition-colors rounded-md px-2 cursor-pointer"
        >Flash</button
      >
      <button
        onclick={() => (
          (sortCategory = "Emulation"),
          setURLParam("category", "Emulation")
        )}
        data-active={sortCategory === "Emulation"}
        class="h-full flex items-center data-[active=true]:bg-input transition-colors rounded-md px-2 cursor-pointer"
        >Emulation</button
      >
    </div>
    <details
      class="relative bg-card rounded-lg border border-input h-9"
      bind:this={sortNode}
    >
      <summary
        class="flex gap-1.5 cursor-pointer text-sm justify-between items-center h-full select-none px-2"
      >
        <ArrowDownUp size="16" />
        <span>Sort: </span>
        <span>
          {#if storage.settings.sortBy === "alphabetical"}
            Name
          {:else if storage.settings.sortBy === "alphabetical_reverse"}
            Name (Z-A)
          {:else if storage.settings.sortBy === "recent"}
            Recently Played
          {:else if storage.settings.sortBy === "most_played"}
            Most Played
          {/if}
        </span>
        <ChevronDown size="16" class="shrink-0" />
      </summary>
      <div
        class="absolute -left-px -right-px min-w-[calc(100%+2px)] w-max mt-2.5 bg-card rounded-lg max-h-60 overflow-y-auto border border-input z-10 flex flex-col p-1"
      >
        <button
          class="rounded-md flex items-center px-2 py-1.5 gap-2 cursor-pointer hover:bg-secondary text-sm transition-colors justify-between"
          onclick={(e) => {
            storage.updateSetting("sortBy", "alphabetical");
            e.currentTarget.closest("details").removeAttribute("open");
          }}
        >
          <span>Name</span>
          {#if storage.settings.sortBy === "alphabetical"}
            <Check size="16" />
          {/if}
        </button>
        <button
          class="rounded-md flex items-center px-2 py-1.5 gap-2 cursor-pointer hover:bg-secondary text-sm transition-colors justify-between"
          onclick={(e) => {
            storage.updateSetting("sortBy", "alphabetical_reverse");
            e.currentTarget.closest("details").removeAttribute("open");
          }}
        >
          Name (Z-A)
          {#if storage.settings.sortBy === "alphabetical_reverse"}
            <Check size="16" />
          {/if}
        </button>
        <button
          class="rounded-md flex items-center px-2 py-1.5 gap-2 cursor-pointer hover:bg-secondary text-sm transition-colors justify-between"
          onclick={(e) => {
            storage.updateSetting("sortBy", "recent");
            e.currentTarget.closest("details").removeAttribute("open");
          }}
        >
          Recently Played
          {#if storage.settings.sortBy === "recent"}
            <Check size="16" />
          {/if}
        </button>
        <button
          class="rounded-md flex items-center px-2 py-1.5 gap-2 cursor-pointer hover:bg-secondary text-sm transition-colors justify-between"
          onclick={(e) => {
            storage.updateSetting("sortBy", "most_played");
            e.currentTarget.closest("details").removeAttribute("open");
          }}
        >
          Most Played
          {#if storage.settings.sortBy === "most_played"}
            <Check size="16" />
          {/if}
        </button>
      </div>
    </details>
  </div>
</div>
<Cards data={sortedLibrary} />
{#if storage.library.length > 0 && sortedLibrary.length === 0}
  <div class="flex flex-col gap-4 h-full w-full justify-center items-center">
    <div class="flex flex-col gap-2 max-w-sm items-center">
      <SearchX class="mb-2" size="32" />
      <p class="text-sm text-center">No results found</p>
      <p class="text-muted text-sm text-center text-balance">
        Try checking for typos or adjusting your search terms. Can't find what
        you're looking for?
      </p>
    </div>
    <a
      href={"/store?search=" + searchQuery}
      class="h-9 px-2.5 bg-primary text-card rounded-lg flex gap-1.5 items-center cursor-pointer text-sm"
    >
      <Store size="16" />
      <span>Search the Store</span>
    </a>
  </div>
{/if}
{#if storage.library.length === 0}
  <div class="flex flex-col gap-4 h-full w-full justify-center items-center">
    <div class="flex flex-col gap-2 max-w-sm items-center">
      <Ghost class="mb-2" size="32" />
      <p class="text-sm">Nothing in your library</p>
      <p class="text-muted text-sm text-center text-balance">
        It looks a little quiet here. Browse the store to discover your next
        favorite game and start building your collection.
      </p>
    </div>
    <a
      href="/store"
      class="h-9 px-2.5 bg-primary text-card rounded-lg flex gap-1.5 items-center cursor-pointer text-sm"
    >
      <Store size="16" />
      <span>Browse Store</span>
    </a>
  </div>
{/if}
