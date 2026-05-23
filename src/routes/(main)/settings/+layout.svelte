<script>
  import { page } from "$app/stores";
  import Head from "$lib/components/Head.svelte";
  import {
    HatGlasses,
    Palette,
    PanelLeft,
    SlidersHorizontal,
    User,
  } from "@lucide/svelte";

  const tabs = [
    { name: "Account", href: "/settings/account", icon: User },
    { name: "General", href: "/settings/general", icon: SlidersHorizontal },
    { name: "Appearance", href: "/settings/appearance", icon: Palette },
    { name: "Sidebar", href: "/settings/sidebar", icon: PanelLeft },
    { name: "Cloaking", href: "/settings/cloaking", icon: HatGlasses },
  ];

  let { children } = $props();
</script>

<Head title="Settings" />

<div class="flex gap-4 p-4 pt-0 mx-auto w-full">
  <nav class="flex flex-col gap-4 w-56 shrink-0">
    {#each tabs as tab}
      {@const isActive = $page.url.pathname === tab.href}
      <a
        href={tab.href}
        data-active={isActive}
        class="px-4 py-2 transition-colors bg-transparent data-[active=true]:bg-surface rounded-xl flex gap-2 items-center border border-border"
      >
        <tab.icon size="20" />
        <span>{tab.name}</span>
      </a>
    {/each}
  </nav>
  <main class="flex-1 min-w-0">
    {@render children()}
  </main>
</div>
