<script>
  import { page } from "$app/stores";
  import { User } from "@lucide/svelte";
  import { cubicInOut } from "svelte/easing";
  import { crossfade } from "svelte/transition";

  let user = $derived($page.data.user);

  const [send, receive] = crossfade({
    duration: 300,
    easing: cubicInOut,
  });

  const tabs = [
    { name: "Home", href: "/" },
    { name: "Library", href: "/library" },
    { name: "Store", href: "/store" },
    { name: "Settings", href: "/settings/account" },
  ];
</script>

<div
  class="nav flex items-center p-4 justify-between sticky top-0 z-10 bg-background"
>
  <div
    class="slider-nav relative flex p-2 gap-2 bg-secondary rounded-full z-10 border border-surface"
  >
    {#each tabs as tab}
      {@const isActive =
        $page.url.pathname === tab.href ||
        ($page.url.pathname.startsWith(tab.href + "/") &&
          $page.url.pathname !== tab.href + "/")}

      <a
        href={tab.href}
        data-active={isActive}
        class="relative rounded-full px-6 py-2 cursor-pointer transition-colors z-10 data-[active=true]:text-text"
      >
        {tab.name}
        {#if isActive}
          <div
            in:receive={{ key: "slider" }}
            out:send={{ key: "slider" }}
            class="absolute inset-0 bg-surface border border-border rounded-full -z-10"
          ></div>
        {/if}
      </a>
    {/each}
  </div>
  <a
    data-active-settings={$page.url.pathname.startsWith("/account")}
    href="/account"
    aria-label="Account"
    class={"h-14 data-[active-settings=false]:bg-secondary data-[active-settings=true]:bg-surface cursor-pointer z-10 flex items-center justify-center border border-border" +
      (user ? " rounded-full px-4 gap-2" : " w-14 rounded-full")}
  >
    {#if user}
      <img
        class="rounded-full w-8 h-8 border border-border"
        src={"/cdn/avatars/" + user.avatar_url}
        alt="Profile"
        draggable="false"
      />
      <p>@{user.name}</p>
    {:else}
      <User />
    {/if}
  </a>
</div>
