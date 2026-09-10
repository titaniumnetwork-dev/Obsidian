<script>
  import Obfuscate from "$lib/components/Obfuscate.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Card from "$lib/components/ui/Card.svelte";
</script>

<div class="grid grid-cols-2 gap-4">
  <Card size="sm">
    <div>
      <p>Data (Coming Soon)</p>
      <p class="text-sm text-muted">Your entire libary and settings</p>
    </div>
    <div class="flex gap-2">
      <Button disabled variant="outline">Upload Data</Button>
      <Button disabled variant="outline">Download Data</Button>
    </div>
  </Card>
  <Card size="sm">
    <div>
      <p><Obfuscate text="Game"></Obfuscate> Data (Coming Soon)</p>
      <p class="text-sm text-muted">
        All save data from <Obfuscate text="games"></Obfuscate>
      </p>
    </div>
    <div class="flex gap-2">
      <Button disabled variant="outline">
        <span>Upload <Obfuscate text="Game"></Obfuscate> Data</span>
      </Button>
      <Button disabled variant="outline">
        <span>Download <Obfuscate text="Game"></Obfuscate> Data</span>
      </Button>
    </div>
  </Card>
</div>
