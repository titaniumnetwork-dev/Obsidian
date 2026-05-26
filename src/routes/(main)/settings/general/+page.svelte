<script>
  import { aspects } from "$lib/aspects";
  import { storage } from "$lib/storage.svelte.js";
</script>

<p>Library Mode</p>
<p class="text-sm text-text-placeholder mb-4">
  Make the library page the home page
</p>
<input
  aria-label="Library Mode"
  checked={storage.settings.libraryMode}
  onchange={(e) => storage.updateSetting("libraryMode", e.target.checked)}
  class="appearance-none cursor-pointer transition-colors bg-secondary checked:bg-surface border border-border w-11 h-6 rounded-full flex items-center px-0.5 before:content-[''] before:h-4 before:w-4 before:rounded-full before:border before:border-border checked:before:border-border-primary before:bg-surface checked:before:bg-primary before:block checked:before:translate-x-5.5 before:transition-[translate,background,border] mb-4"
  type="checkbox"
/>
<p>Cards</p>
<p class="text-sm text-text-placeholder mb-4">
  Change the card style to your liking
</p>
<div class="flex gap-4">
  <button
    onclick={() => storage.updateSetting("cards", "default")}
    data-active={storage.settings.cards === "default"}
    class="px-4 py-2 text-sm cursor-pointer rounded-xl whitespace-nowrap border border-border data-[active=true]:bg-surface"
  >
    <span>Default</span>
  </button>
  <button
    onclick={() => storage.updateSetting("cards", "square")}
    data-active={storage.settings.cards === "square"}
    class="px-4 py-2 text-sm cursor-pointer rounded-xl whitespace-nowrap border border-border transition-colors data-[active=true]:bg-surface"
  >
    <span>Square</span>
  </button>
</div>
<p class="mt-4">Aspect Ratio</p>
<p class="text-sm text-text-placeholder mb-4">
  Change the size in which the iframe is rendered
</p>
<div class="flex gap-4">
  <button
    onclick={() => storage.updateSetting("aspect", "")}
    data-active={storage.settings.aspect.length === 0}
    class="px-4 py-2 text-sm cursor-pointer rounded-xl whitespace-nowrap border border-border data-[active=true]:bg-surface"
  >
    <span>Default</span>
  </button>
  {#each aspects as aspect}
    <button
      onclick={() => storage.updateSetting("aspect", aspect.value)}
      data-active={storage.settings.aspect === aspect.value}
      class="px-4 py-2 text-sm cursor-pointer rounded-xl whitespace-nowrap border border-border transition-colors data-[active=true]:bg-surface"
    >
      <span>{aspect.name}</span>
    </button>
  {/each}
</div>
<p class="mt-4">Overlay</p>
<p class="text-sm text-text-placeholder mb-4">
  Change the Obsidian overlay style
</p>
<div class="flex gap-4">
  <button
    onclick={() => storage.updateSetting("overlay", "default")}
    data-active={storage.settings.overlay === "default"}
    class="px-4 py-2 text-sm cursor-pointer rounded-xl whitespace-nowrap border border-border data-[active=true]:bg-surface"
  >
    <span>Default</span>
  </button>
  <button
    onclick={() => storage.updateSetting("overlay", "compact")}
    data-active={storage.settings.overlay === "compact"}
    class="px-4 py-2 text-sm cursor-pointer rounded-xl whitespace-nowrap border border-border transition-colors data-[active=true]:bg-surface"
  >
    <span>Compact</span>
  </button>
</div>
