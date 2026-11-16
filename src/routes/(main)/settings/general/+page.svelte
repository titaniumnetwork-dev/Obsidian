<script>
  import { isAdDomain } from "#lib/ads.js";
  import { aspects } from "#lib/aspects";
  import Obfuscate from "#lib/components/Obfuscate.svelte";
  import Button from "#lib/components/ui/Button.svelte";
  import Card from "#lib/components/ui/Card.svelte";
  import Switch from "#lib/components/ui/Switch.svelte";
  import { storage } from "#lib/storage.svelte.js";

  function updateAdsToggle(e) {
    storage.updateSetting("ads", e.target.checked);

    window.location.reload();
  }
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
    <div class="grid grid-cols-3 gap-2">
      <Button
        variant="ghost"
        aria-label="Compact Cards"
        onclick={() => storage.updateSetting("cards", "compact")}
        data-active={storage.settings.cards === "compact"}
        class="data-[active=true]:bg-secondary border border-border h-auto py-3 px-2 flex flex-col items-center justify-between gap-2.5"
      >
        <div class="h-16 flex items-center justify-center">
          <div class="size-11 rounded-lg bg-input/30 border border-input"></div>
        </div>
        <span class="text-xs">Compact</span>
      </Button>
      <Button
        variant="ghost"
        aria-label="Default Cards"
        onclick={() => storage.updateSetting("cards", "default")}
        data-active={storage.settings.cards === "default"}
        class="data-[active=true]:bg-secondary border border-border h-auto py-3 px-2 flex flex-col items-center justify-between gap-2.5"
      >
        <div class="h-16 flex flex-col items-center justify-center gap-1.5">
          <div class="w-8 aspect-2/3 rounded-md bg-input/30 border border-input"></div>
          <div class="w-8 h-1.5 rounded-full bg-input"></div>
        </div>
        <span class="text-xs">Default</span>
      </Button>
      <Button
        variant="ghost"
        aria-label="Showcase Cards"
        onclick={() => storage.updateSetting("cards", "showcase")}
        data-active={storage.settings.cards === "showcase"}
        class="data-[active=true]:bg-secondary border border-border h-auto py-3 px-2 flex flex-col items-center justify-between gap-2.5"
      >
        <div class="h-16 flex items-center justify-center">
          <div class="rounded-xl border border-input bg-card p-1.5 flex flex-col items-center gap-1">
            <div class="w-7 aspect-2/3 rounded-sm bg-input/30 border border-input"></div>
            <div class="w-7 h-1 rounded-full bg-input"></div>
          </div>
        </div>
        <span class="text-xs">Showcase</span>
      </Button>
    </div>
  </Card>
  <Card size="sm">
    <div>
      <p>Aspect Ratio</p>
      <p class="text-sm text-muted">
        Change the size in which the <Obfuscate text="game"></Obfuscate> is rendered
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
          variant="ghost"
          onclick={() => storage.updateSetting("aspect", aspect.value)}
          data-active={storage.settings.aspect === aspect.value}
          class="data-[active=true]:bg-secondary border border-border"
        >
          <span>{aspect.name}</span>
        </Button>
      {/each}
    </div>
  </Card>
  <Card size="sm">
    <div>
      <p><Obfuscate text="Game"></Obfuscate> Options</p>
      <p class="text-sm text-muted">
        Change the in <Obfuscate text="game"></Obfuscate> options style
      </p>
    </div>
    <div class="flex flex-wrap gap-2">
      <Button
        variant="ghost"
        onclick={() => storage.updateSetting("overlay", "default")}
        data-active={storage.settings.overlay === "default"}
        class="data-[active=true]:bg-secondary border border-border"
      >
        <span>Default</span>
      </Button>
      <Button
        variant="ghost"
        onclick={() => storage.updateSetting("overlay", "compact")}
        data-active={storage.settings.overlay === "compact"}
        class="data-[active=true]:bg-secondary border border-border"
      >
        <span>Compact</span>
      </Button>
      <Button
        disabled
        variant="ghost"
        onclick={() => storage.updateSetting("overlay", "overlay")}
        data-active={storage.settings.overlay === "overlay"}
        class="data-[active=true]:bg-secondary border border-border"
      >
        <span>Overlay (Coming Soon)</span>
      </Button>
    </div>
  </Card>
  <Card size="sm">
    <div>
      <p>Launch Mode</p>
      <p class="text-sm text-muted">
        Open <Obfuscate text="games"></Obfuscate> in a new tab or stay in the current
        tab. Useful for <Obfuscate text="proxying"></Obfuscate> Obsidian.
      </p>
    </div>
    <div class="flex flex-wrap gap-2">
      <Button
        variant="ghost"
        onclick={() => storage.updateSetting("launch", "newTab")}
        data-active={storage.settings.launch === "newTab"}
        class="data-[active=true]:bg-secondary border border-border"
      >
        <span>New Tab</span>
      </Button>
      <Button
        variant="ghost"
        onclick={() => storage.updateSetting("launch", "currentTab")}
        data-active={storage.settings.launch === "currentTab"}
        class="data-[active=true]:bg-secondary border border-border"
      >
        <span>Current Tab</span>
      </Button>
    </div>
  </Card>
  {#if isAdDomain()}
    <Card size="sm" class="flex-row justify-between">
      <div>
        <p>Show Ads</p>
        <p class="text-sm text-muted">Support Obsidian by showing ads</p>
      </div>
      <Switch
        aria-label="Show Ads"
        checked={storage.settings.ads}
        onchange={updateAdsToggle}
      />
    </Card>
  {/if}
</div>
