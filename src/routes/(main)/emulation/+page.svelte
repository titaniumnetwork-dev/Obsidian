<script>
  import Head from "$lib/components/Head.svelte";
  import { emulators, flashEmulators } from "$lib/emulators";
</script>

<Head title="Emulation" />

<p class="text-xl m-4 mt-0">Emulators</p>
<div class="p-4 pt-0 flex flex-wrap gap-4">
  {#each emulators as item (item.id)}
    <a
      class="cursor-pointer h-14 rounded-2xl text-sm flex items-center justify-between p-2 gap-2 bg-surface whitespace-nowrap border border-border"
      href={"/emulation/" + item.id}
    >
      <div class="flex gap-2 items-center">
        <item.icon class="w-8 h-8 text-text" />
        <span>{item.title}</span>
      </div>
    </a>
  {/each}
</div>
<p class="text-xl m-4">Flash</p>
<div class="p-4 pt-0 flex flex-wrap gap-4">
  {#each flashEmulators as item (item.id)}
    <a
      class="cursor-pointer h-14 rounded-2xl text-sm flex items-center justify-between p-2 gap-2 bg-surface whitespace-nowrap border border-border"
      href="/emulation/ruffle/"
    >
      <div class="flex gap-2 items-center">
        <item.icon class="w-8 h-8 text-text" />
        <span>{item.title}</span>
      </div>
    </a>
  {/each}
</div>
