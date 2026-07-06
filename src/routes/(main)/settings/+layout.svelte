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

<div class="flex flex-col gap-4 p-4 mx-auto w-full">
  <nav class="flex gap-2 w-56 shrink-0">
    {#each tabs as tab}
      {@const isActive = $page.url.pathname === tab.href}
      <a
        href={tab.href}
        data-active={isActive}
        class="flex items-center cursor-pointer text-sm rounded-xl h-8 px-2.5 gap-2 transition-colors hover:bg-neutral-800 data-[active=true]:bg-neutral-800"
      >
        <tab.icon size="16" />
        <span>{tab.name}</span>
      </a>
    {/each}
  </nav>
  <main class="flex-1 min-w-0">
    {@render children()}
  </main>
</div>
