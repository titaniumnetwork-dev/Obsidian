<script>
  import Logo from "$lib/assets/logo.svelte";
  import {
    SiDiscord,
    SiPatreon,
    SiTiktok,
    SiYoutube,
  } from "@icons-pack/svelte-simple-icons";
</script>

<footer class="footer mb-4 mx-4 mt-auto flex gap-4 justify-between pt-12">
  <div class="flex items-center gap-2">
    <Logo class="h-6 w-6" />
    <p>Obsidian {new Date().getFullYear()}</p>
  </div>

  <div class="flex items-center gap-4">
    <a
      class="transition-colors text-text-placeholder hover:text-text"
      href="/contact">Contact</a
    >
    <a
      class="transition-colors text-text-placeholder hover:text-text"
      href="/contact">DMCA</a
    >
    <a
      class="transition-colors text-text-placeholder hover:text-text"
      href="/terms">Terms of Service</a
    >
    <a
      class="transition-colors text-text-placeholder hover:text-text"
      href="/privacy">Privacy Policy</a
    >
    <div class="flex items-center gap-6 mx-2">
      <!--
      <a
        class="transition-colors text-text-placeholder hover:text-text"
        href="https://github.com"
      >
        <SiGithub size="20" />
      </a>
      -->
      <a
        class="transition-colors text-text-placeholder hover:text-text"
        href="https://discord.com"
      >
        <SiDiscord size="20" />
      </a>
      <a
        class="transition-colors text-text-placeholder hover:text-text"
        href="https://youtube.com"
      >
        <SiYoutube size="20" />
      </a>
      <a
        class="transition-colors text-text-placeholder hover:text-text"
        href="https://tiktok.com"
      >
        <SiTiktok size="20" />
      </a>
      <a
        class="transition-colors text-text-placeholder hover:text-text"
        href="https://patreon.com"
      >
        <SiPatreon size="20" />
      </a>
    </div>
  </div>
</footer>
