<script>
  import Card from "$lib/components/ui/Card.svelte";
  import Switch from "$lib/components/ui/Switch.svelte";
  import { storage } from "$lib/storage.svelte.js";
  import { ArrowDownUp, Check, ChevronDown } from "@lucide/svelte";

  let sortNode;

  function handleClickOutside(event) {
    if (sortNode && !sortNode.contains(event.target)) {
      sortNode.removeAttribute("open");
    }
  }
</script>

<svelte:window onclick={handleClickOutside} />

<div class="grid grid-cols-2 gap-4">
  <Card size="sm" class="flex-row justify-between">
    <div>
      <p>Collapsed</p>
      <p class="text-sm text-muted">
        Choose between the full sidebar or a compact layout
      </p>
    </div>
    <Switch
      aria-label="Collapsed Sidebar"
      checked={storage.settings.sidebarCollapsed}
      onchange={(e) =>
        storage.updateSetting("sidebarCollapsed", e.target.checked)}
    />
  </Card>
  <Card size="sm">
    <div>
      <p>Sort</p>
      <p class="text-sm text-muted">
        Change the sort order of the items in the sidebar
      </p>
    </div>
    <div class="flex justify-start">
      <details
        class="relative bg-secondary rounded-lg border border-input h-9"
        bind:this={sortNode}
      >
        <summary
          class="flex gap-1.5 cursor-pointer text-sm justify-between items-center h-full select-none px-2"
        >
          <ArrowDownUp size="16" />
          <span>Sort: </span>
          <span>
            {#if storage.settings.sidebarSort === "alphabetical"}
              Name
            {:else if storage.settings.sidebarSort === "alphabetical_reverse"}
              Name (Z-A)
            {:else if storage.settings.sidebarSort === "recent"}
              Recently Played
            {:else if storage.settings.sidebarSort === "most_played"}
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
              storage.updateSetting("sidebarSort", "alphabetical");
              e.currentTarget.closest("details").removeAttribute("open");
            }}
          >
            <span>Name</span>
            {#if storage.settings.sidebarSort === "alphabetical"}
              <Check size="16" />
            {/if}
          </button>
          <button
            class="rounded-md flex items-center px-2 py-1.5 gap-2 cursor-pointer hover:bg-secondary text-sm transition-colors justify-between"
            onclick={(e) => {
              storage.updateSetting("sidebarSort", "alphabetical_reverse");
              e.currentTarget.closest("details").removeAttribute("open");
            }}
          >
            Name (Z-A)
            {#if storage.settings.sidebarSort === "alphabetical_reverse"}
              <Check size="16" />
            {/if}
          </button>
          <button
            class="rounded-md flex items-center px-2 py-1.5 gap-2 cursor-pointer hover:bg-secondary text-sm transition-colors justify-between"
            onclick={(e) => {
              storage.updateSetting("sidebarSort", "recent");
              e.currentTarget.closest("details").removeAttribute("open");
            }}
          >
            Recently Played
            {#if storage.settings.sidebarSort === "recent"}
              <Check size="16" />
            {/if}
          </button>
          <button
            class="rounded-md flex items-center px-2 py-1.5 gap-2 cursor-pointer hover:bg-secondary text-sm transition-colors justify-between"
            onclick={(e) => {
              storage.updateSetting("sidebarSort", "most_played");
              e.currentTarget.closest("details").removeAttribute("open");
            }}
          >
            Most Played
            {#if storage.settings.sidebarSort === "most_played"}
              <Check size="16" />
            {/if}
          </button>
        </div>
      </details>
    </div>
  </Card>
</div>
