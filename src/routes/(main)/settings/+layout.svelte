<script>
  import { page } from "$app/stores";
  import Head from "$lib/components/Head.svelte";
  import {
    HatGlasses,
    Palette,
    PanelLeft,
    SlidersHorizontal,
  } from "@lucide/svelte";
  const tabs = [
    { name: "General", href: "/settings", icon: SlidersHorizontal },
    { name: "Appearance", href: "/settings/appearance", icon: Palette },
    { name: "Sidebar", href: "/settings/sidebar", icon: PanelLeft },
    { name: "Cloaking", href: "/settings/cloaking", icon: HatGlasses },
  ];

  let { children } = $props();
</script>

<Head title="Settings" />

<div class="settings p-4 pt-0">
  <div class="flex gap-4 relative z-10">
    {#each tabs as tab}
      {@const isActive = $page.url.pathname === tab.href}
      <a
        href={tab.href}
        data-active={isActive}
        class="px-4 py-2 text-sm cursor-pointer rounded-xl whitespace-nowrap border border-border transition-colors data-[active=true]:bg-surface flex gap-2 items-center"
      >
        <tab.icon size="20" />
        <span>{tab.name}</span>
      </a>
    {/each}
  </div>
  {@render children()}
</div>
