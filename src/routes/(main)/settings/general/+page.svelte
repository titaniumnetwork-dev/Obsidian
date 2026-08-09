<script>
  import { aspects } from "$lib/aspects";
  import Button from "$lib/components/ui/Button.svelte";
  import Card from "$lib/components/ui/Card.svelte";
  import Switch from "$lib/components/ui/Switch.svelte";
  import { storage } from "$lib/storage.svelte.js";
</script>

<div class="grid grid-cols-2 gap-4">
  <Card size="sm" class="flex-row justify-between">
    <div>
      <p>Library Mode</p>
      <p class="text-sm text-muted">Make the library page the home page</p>
    </div>
    <Switch
      aria-label="Library Mode"
      checked={storage.settings.libraryMode}
      onchange={(e) => storage.updateSetting("libraryMode", e.target.checked)}
    />
  </Card>
  <Card size="sm">
    <div>
      <p>Cards</p>
      <p class="text-sm text-muted">Change the card style to your liking</p>
    </div>
    <div class="flex flex-wrap gap-2">
      <button
        aria-label="Default Card Size"
        onclick={() => storage.updateSetting("cards", "default")}
        data-active={storage.settings.cards === "default"}
        class="p-2.5 text-sm cursor-pointer rounded-xl whitespace-nowrap border border-border data-[active=true]:bg-secondary"
      >
        <div class="bg-input aspect-2/3 w-8 rounded-lg"></div>
      </button>
      <button
        aria-label="Square Card Size"
        onclick={() => storage.updateSetting("cards", "square")}
        data-active={storage.settings.cards === "square"}
        class="p-2.5 text-sm cursor-pointer rounded-xl whitespace-nowrap border border-border transition-colors data-[active=true]:bg-secondary flex items-start"
      >
        <div class="bg-input aspect-square w-8 rounded-lg"></div>
      </button>
    </div>
  </Card>
  <Card size="sm">
    <div>
      <p>Aspect Ratio</p>
      <p class="text-sm text-muted">
        Change the size in which the iframe is rendered
      </p>
    </div>
    <div class="flex flex-wrap gap-2">
      <Button
        variant="outline"
        onclick={() => storage.updateSetting("aspect", "")}
        data-active={storage.settings.aspect.length === 0}
        class="data-[active=true]:bg-secondary"
      >
        <span>Default</span>
      </Button>
      {#each aspects as aspect}
        <Button
          variant="outline"
          onclick={() => storage.updateSetting("aspect", aspect.value)}
          data-active={storage.settings.aspect === aspect.value}
          class="data-[active=true]:bg-secondary"
        >
          <span>{aspect.name}</span>
        </Button>
      {/each}
    </div>
  </Card>
  <Card size="sm">
    <div>
      <p>Overlay</p>
      <p class="text-sm text-muted">Change the Obsidian overlay style</p>
    </div>
    <div class="flex flex-wrap gap-2">
      <Button
        variant="outline"
        onclick={() => storage.updateSetting("overlay", "default")}
        data-active={storage.settings.overlay === "default"}
        class="data-[active=true]:bg-secondary"
      >
        <span>Default</span>
      </Button>
      <Button
        variant="outline"
        onclick={() => storage.updateSetting("overlay", "compact")}
        data-active={storage.settings.overlay === "compact"}
        class="data-[active=true]:bg-secondary"
      >
        <span>Compact</span>
      </Button>
    </div>
  </Card>
</div>
