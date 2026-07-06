<script>
  import { aspects } from "$lib/aspects";
  import { storage } from "$lib/storage.svelte.js";
</script>

<div class="grid grid-cols-2 gap-4">
  <div
    class="flex flex-col gap-4 bg-neutral-900 rounded-radius p-4 text-sm border border-border"
  >
    <div>
      <p>Library Mode</p>
      <p class="text-sm text-text-placeholder">
        Make the library page the home page
      </p>
    </div>
    <input
      aria-label="Library Mode"
      checked={storage.settings.libraryMode}
      onchange={(e) => storage.updateSetting("libraryMode", e.target.checked)}
      class="appearance-none cursor-pointer transition-colors bg-secondary checked:bg-surface border border-border w-11 h-6 rounded-full flex items-center px-0.5 before:content-[''] before:h-4 before:w-4 before:rounded-full before:border before:border-border checked:before:border-border-primary before:bg-surface checked:before:bg-primary before:block checked:before:translate-x-5.5 before:transition-[translate,background,border]"
      type="checkbox"
    />
  </div>
  <div
    class="flex flex-col gap-4 bg-neutral-900 rounded-radius p-4 text-sm border border-border"
  >
    <div>
      <p>Cards</p>
      <p class="text-sm text-text-placeholder">
        Change the card style to your liking
      </p>
    </div>
    <div class="flex flex-wrap gap-2">
      <button
        onclick={() => storage.updateSetting("cards", "default")}
        data-active={storage.settings.cards === "default"}
        class="h-9 px-2.5 text-sm cursor-pointer rounded-xl whitespace-nowrap border border-border data-[active=true]:bg-surface"
      >
        <span>Default</span>
      </button>
      <button
        onclick={() => storage.updateSetting("cards", "square")}
        data-active={storage.settings.cards === "square"}
        class="h-9 px-2.5 text-sm cursor-pointer rounded-xl whitespace-nowrap border border-border transition-colors data-[active=true]:bg-surface"
      >
        <span>Square</span>
      </button>
    </div>
  </div>
  <div
    class="flex flex-col gap-4 bg-neutral-900 rounded-radius p-4 text-sm border border-border"
  >
    <div>
      <p>Aspect Ratio</p>
      <p class="text-sm text-text-placeholder">
        Change the size in which the iframe is rendered
      </p>
    </div>
    <div class="flex flex-wrap gap-2">
      <button
        onclick={() => storage.updateSetting("aspect", "")}
        data-active={storage.settings.aspect.length === 0}
        class="h-9 px-2.5 text-sm cursor-pointer rounded-xl whitespace-nowrap border border-border data-[active=true]:bg-surface"
      >
        <span>Default</span>
      </button>
      {#each aspects as aspect}
        <button
          onclick={() => storage.updateSetting("aspect", aspect.value)}
          data-active={storage.settings.aspect === aspect.value}
          class="h-9 px-2.5 text-sm cursor-pointer rounded-xl whitespace-nowrap border border-border transition-colors data-[active=true]:bg-surface"
        >
          <span>{aspect.name}</span>
        </button>
      {/each}
    </div>
  </div>
  <div
    class="flex flex-col gap-4 bg-neutral-900 rounded-radius p-4 text-sm border border-border"
  >
    <div>
      <p>Overlay</p>
      <p class="text-sm text-text-placeholder">
        Change the Obsidian overlay style
      </p>
    </div>
    <div class="flex flex-wrap gap-2">
      <button
        onclick={() => storage.updateSetting("overlay", "default")}
        data-active={storage.settings.overlay === "default"}
        class="h-9 px-2.5 text-sm cursor-pointer rounded-xl whitespace-nowrap border border-border data-[active=true]:bg-surface"
      >
        <span>Default</span>
      </button>
      <button
        onclick={() => storage.updateSetting("overlay", "compact")}
        data-active={storage.settings.overlay === "compact"}
        class="h-9 px-2.5 text-sm cursor-pointer rounded-xl whitespace-nowrap border border-border transition-colors data-[active=true]:bg-surface"
      >
        <span>Compact</span>
      </button>
    </div>
  </div>
</div>
