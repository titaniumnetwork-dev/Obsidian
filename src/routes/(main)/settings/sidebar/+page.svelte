<script>
  import { storage } from "$lib/storage.svelte.js";
</script>

<p class="mt-4">Sidebar</p>
<p class="text-sm text-text-placeholder mb-4">
  Shrink the sidebar or remove it entirely
</p>
<div class="flex gap-4">
  <button
    onclick={() => storage.updateSetting("sidebarStyle", "default")}
    data-active={storage.settings.sidebarStyle === "default"}
    class="px-4 py-2 text-sm cursor-pointer rounded-xl whitespace-nowrap border border-border transition-colors data-[active=true]:bg-surface"
    >Default</button
  >
  <button
    onclick={() => storage.updateSetting("sidebarStyle", "compact")}
    data-active={storage.settings.sidebarStyle === "compact"}
    class="px-4 py-2 text-sm cursor-pointer rounded-xl whitespace-nowrap border border-border transition-colors data-[active=true]:bg-surface"
    >Compact</button
  >
  <button
    onclick={() => storage.updateSetting("sidebarStyle", "hidden")}
    data-active={storage.settings.sidebarStyle === "hidden"}
    class="px-4 py-2 text-sm cursor-pointer rounded-xl whitespace-nowrap border border-border transition-colors data-[active=true]:bg-surface"
    >Hidden</button
  >
</div>
<p class="mt-4">Search</p>
<p class="text-sm text-text-placeholder mb-4">
  Show a search bar in the sidebar
</p>
<input
  aria-label="Sidebar Search"
  disabled={storage.settings.sidebarStyle !== "default"}
  checked={storage.settings.sidebarSearch}
  onchange={(e) => storage.updateSetting("sidebarSearch", e.target.checked)}
  class={"appearance-none transition-colors bg-secondary checked:bg-surface border border-border w-11 h-6 rounded-full flex items-center px-0.5 before:content-[''] before:h-4 before:w-4 before:rounded-full before:border before:border-border checked:before:border-border-primary before:bg-surface before:block checked:before:translate-x-5.5 before:transition-[translate,background,border]" +
    (storage.settings.sidebarStyle !== "default"
      ? " checked:before:bg-surface"
      : " checked:before:bg-primary cursor-pointer")}
  type="checkbox"
/>
<p class="mt-4">Playing First</p>
<p class="text-sm text-text-placeholder mb-4">
  Show currently playing games at the top of the sidebar
</p>
<input
  aria-label="Playing FIrst"
  checked={storage.settings.playingFirst}
  onchange={(e) => storage.updateSetting("playingFirst", e.target.checked)}
  class="appearance-none cursor-pointer transition-colors bg-secondary checked:bg-surface border border-border w-11 h-6 rounded-full flex items-center px-0.5 before:content-[''] before:h-4 before:w-4 before:rounded-full before:border before:border-border checked:before:border-border-primary before:bg-surface checked:before:bg-primary before:block checked:before:translate-x-5.5 before:transition-[translate,background,border]"
  type="checkbox"
/>
