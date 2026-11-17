<script>
  import Ruffle from "#lib/assets/emulation/Ruffle.svelte";
  import Head from "#lib/components/Head.svelte";
  import Button from "#lib/components/ui/Button.svelte";
  import InputGroup from "#lib/components/ui/InputGroup.svelte";
  import InputGroupAddon from "#lib/components/ui/InputGroupAddon.svelte";
  import InputGroupInput from "#lib/components/ui/InputGroupInput.svelte";
  import { tags } from "#lib/tags.js";
  import { removeURLParam, setURLParam } from "#lib/utils.js";
  import { page } from "$app/state";
  import { ChevronDown, Gamepad, Search, Store, Tag, X } from "@lucide/svelte";
  import { setContext } from "svelte";

  let { data, children } = $props();

  let tagsMenu = $state();

  let searchQuery = $state(page.data.search || "");

  setContext("searchQuery", () => searchQuery);
</script>

<Head title="Store" />

<div class="flex gap-2 p-4 bg-background sticky top-0 z-10">
  <InputGroup width="fixed">
    <InputGroupAddon>
      <Search size="16" class="text-muted" />
    </InputGroupAddon>
    <InputGroupInput
      oninput={(e) =>
        e.target.value
          ? setURLParam("search", e.target.value)
          : removeURLParam("search")}
      bind:value={searchQuery}
      placeholder="Search store"
    />
    {#if searchQuery.length > 0}
      <InputGroupAddon>
        <button
          class="cursor-pointer text-muted"
          onclick={() => ((searchQuery = ""), removeURLParam("search"))}
        >
          <X size="16" />
        </button>
      </InputGroupAddon>
    {/if}
  </InputGroup>
  <Button
    variant="outline"
    href="/store"
    data-active={page.url.pathname === "/store"}
    class="data-[active=true]:bg-secondary"
  >
    <Store size="16" />
    <span>Store</span>
  </Button>
  <Button
    variant="outline"
    href="/store/flash"
    data-active={page.url.pathname === "/store/flash"}
    class="data-[active=true]:bg-secondary"
  >
    <Ruffle class="size-4" />
    <span>Flash</span>
  </Button>
  <Button
    variant="outline"
    href="/store/retro"
    data-active={page.url.pathname === "/store/retro"}
    class="data-[active=true]:bg-secondary"
  >
    <Gamepad size="16" />
    <span>Retro</span>
  </Button>
  <Button
    variant="outline"
    popovertarget="tags"
    class="[anchor-name:--tags-button]"
  >
    <Tag size="16" />
    <span>Tags</span>
    <ChevronDown size="16" />
  </Button>
  <div
    popover="auto"
    id="tags"
    bind:this={tagsMenu}
    class="[&:popover-open]:grid grid-cols-3 bg-card rounded-lg text-foreground [position-anchor:--tags-button]
              [position-area:bottom] border border-input p-1 mt-2.5 gap-2 max-w-130 max-h-130 overflow-y-auto"
  >
    {#each tags as tag}
      <a
        onclick={(e) => {
          tagsMenu.hidePopover();
        }}
        href={"/store/tag/" + tag}
        class="rounded-md flex items-center px-2 py-1.5 gap-2 cursor-pointer hover:bg-secondary text-sm transition-colors justify-between"
      >
        {tag}
      </a>
    {/each}
  </div>
</div>
{@render children()}
