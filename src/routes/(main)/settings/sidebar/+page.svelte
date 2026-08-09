<script>
  import Card from "$lib/components/ui/Card.svelte";
  import Switch from "$lib/components/ui/Switch.svelte";
  import { storage } from "$lib/storage.svelte.js";
</script>

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
        Change the sort order of the library in the sidebar
      </p>
    </div>
    <p>todo</p>
  </Card>
</div>
