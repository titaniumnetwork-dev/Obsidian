<script>
  import { goto } from "$app/navigation";
  import Logo from "$lib/assets/logo.svelte";
  import { links } from "$lib/links";
  import { storage } from "$lib/storage.svelte";
  import {
    SiDiscord,
    SiPatreon,
    SiTiktok,
    SiYoutube,
  } from "@icons-pack/svelte-simple-icons";
  import { Sparkles } from "@lucide/svelte";
  import { toast } from "svelte-sonner";

  function logoPressed() {
    if (!storage.hiddenThemes.includes("Lime")) {
      storage.addHiddenTheme("Lime");
      storage.updateTheme("Lime");
      toast("Theme Unlocked", {
        description: "You unlocked the Lime theme!",
        position: "bottom-center",
        icon: Sparkles,
        action: {
          label: "Settings",
          onClick: () => goto("/settings/appearance"),
        },
      });
    }
  }
</script>

<footer
  class="footer mb-4 mx-4 mt-auto flex gap-4 justify-between pt-16 text-sm"
>
  <div class="flex items-center gap-2">
    <Logo onpointerdown={logoPressed} class="h-6 w-6" />
    <p>Obsidian {new Date().getFullYear()}</p>
  </div>

  <div class="flex items-center gap-4">
    <a class="text-muted hover:underline" href={"mailto:" + links.email}
      >Contact</a
    >
    <a class="text-muted hover:underline" href="/terms"
      >Terms of Service</a
    >
    <a class="text-muted hover:underline" href="/privacy"
      >Privacy Policy</a
    >
    <a class="text-muted hover:underline" href="/dmca">DMCA</a>
    <div class="flex items-center gap-6 mx-2">
      <!--
      <a
        class="text-muted hover:underline"
        href="https://github.com"
      >
        <SiGithub title="Github" size="16" />
      </a>
      -->
      <a class="text-muted hover:underline" href={links.discord}>
        <SiDiscord title="Discord" size="16" />
      </a>
      <a class="text-muted hover:underline" href={links.youtube}>
        <SiYoutube title="YouTube" size="16" />
      </a>
      <a class="text-muted hover:underline" href={links.tiktok}>
        <SiTiktok title="TikTok" size="16" />
      </a>
      <a class="text-muted hover:underline" href={links.patreon}>
        <SiPatreon title="Patreon" size="16" />
      </a>
    </div>
  </div>
</footer>
