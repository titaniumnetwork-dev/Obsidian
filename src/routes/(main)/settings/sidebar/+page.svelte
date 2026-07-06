<script>
  import { storage } from "$lib/storage.svelte.js";
</script>

<div class="grid grid-cols-2 gap-4">
  <div
    class="flex flex-col gap-4 bg-neutral-900 rounded-radius p-4 text-sm border border-border"
  >
    <div>
      <p>Sidebar</p>
      <p class="text-sm text-text-placeholder">
        Choose between the full sidebar or a compact layout
      </p>
    </div>
    <div class="flex flex-wrap gap-2">
      <button
        onclick={() => storage.updateSetting("sidebarStyle", "default")}
        data-active={storage.settings.sidebarStyle === "default"}
        class="h-9 px-2.5 text-sm cursor-pointer rounded-xl whitespace-nowrap border border-border transition-colors data-[active=true]:bg-surface"
        >Default</button
      >
      <button
        onclick={() => storage.updateSetting("sidebarStyle", "compact")}
        data-active={storage.settings.sidebarStyle === "compact"}
        class="h-9 px-2.5 text-sm cursor-pointer rounded-xl whitespace-nowrap border border-border transition-colors data-[active=true]:bg-surface"
        >Compact</button
      >
    </div>
  </div>
  <div
    class="flex flex-col gap-4 bg-neutral-900 rounded-radius p-4 text-sm border border-border"
  >
    <div>
      <p>Sort</p>
      <p class="text-sm text-text-placeholder">
        Change the sort order of the library in the sidebar
      </p>
    </div>
    <p>todo</p>
  </div>
</div>
