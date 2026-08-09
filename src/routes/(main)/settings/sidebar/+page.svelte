<script>
  import { storage } from "$lib/storage.svelte.js";
</script>

<div class="grid grid-cols-2 gap-4">
  <div
    class="flex flex-col gap-4 bg-card rounded-radius p-4 text-sm border border-border"
  >
    <div>
      <p>Collapsed</p>
      <p class="text-sm text-muted">
        Choose between the full sidebar or a compact layout
      </p>
    </div>
    <input
      aria-label="Collapsed Sidebar"
      checked={storage.settings.sidebarCollapsed}
      onchange={(e) =>
        storage.updateSetting("sidebarCollapsed", e.target.checked)}
      class="appearance-none cursor-pointer transition-colors bg-card checked:bg-secondary border border-border w-11 h-6 rounded-full flex items-center px-0.5 before:content-[''] before:h-4 before:w-4 before:rounded-full before:border before:border-border checked:before:border-border-primary before:bg-secondary checked:before:bg-primary before:block checked:before:translate-x-5.5 before:transition-[translate,background,border]"
      type="checkbox"
    />
  </div>
  <div
    class="flex flex-col gap-4 bg-card rounded-radius p-4 text-sm border border-border"
  >
    <div>
      <p>Sort</p>
      <p class="text-sm text-muted">
        Change the sort order of the library in the sidebar
      </p>
    </div>
    <p>todo</p>
  </div>
</div>
