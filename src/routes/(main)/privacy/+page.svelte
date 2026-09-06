<script>
  import Head from "$lib/components/Head.svelte";
  import Obfuscate from "$lib/components/Obfuscate.svelte";
  import { links } from "$lib/links";

  let updated = new Date(1788130714213);
</script>

<Head title="Privacy Policy" />

<div class="p-4 flex flex-col gap-4 text-sm">
  <div class="flex flex-col">
    <p class="text-base">Privacy Policy</p>
    <p class="text-muted">
      Last updated on {updated.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })}
    </p>
  </div>
  <p>
    Welcome to Obsidian. We respect your privacy and are committed to protecting
    it. This Privacy Policy explains how we handle information when you visit
    our website and use our services while playing <Obfuscate text="games"
    ></Obfuscate> locally in your browser.
  </p>
  <p class="text-base">1. Information We Collect</p>
  <p>
    We collect information to provide a better experience and to keep your
    preferences and local <Obfuscate text="game"></Obfuscate> data available when
    you use the site.
  </p>
  <ul class="list-disc pl-6 flex flex-col gap-2">
    <li>
      <p>Local Settings and <Obfuscate text="Game"></Obfuscate> Data:</p>
      We store browser-local preferences such as themes, favorites, keybinds, and
      <Obfuscate text="game"></Obfuscate> save metadata in your browser so the site
      can function smoothly without requiring an account.
    </li>
    <li>
      <p>Log Data:</p>
      Like most websites, our servers automatically record basic information that
      your browser sends. This may include your IP address, browser type, device type,
      and the pages you visit.
    </li>
    <li>
      <p>Third-Party Content:</p>
      Our website hosts various third-party <Obfuscate text="games"></Obfuscate> and
      emulators. These third parties may use their own cookies or tracking scripts.
      We do not control these third-party trackers.
    </li>
  </ul>
  <p class="text-base">2. Cookies and Local Storage</p>
  <p>
    We use browser storage and cookies to remember your preferences on this
    device.
  </p>
  <ul class="list-disc pl-6 flex flex-col gap-2">
    <li>
      <p>Local Storage:</p>
      We save your settings and <Obfuscate text="game"></Obfuscate>-related
      state in local browser storage so your customizations remain available
      without an account.
    </li>
    <li>
      <p>Third-Party Content:</p>
      Our website hosts various third-party <Obfuscate text="games"></Obfuscate> and
      emulators. These third parties may use their own cookies or tracking scripts.
      We do not control these third-party trackers.
    </li>
  </ul>
  <p class="text-base">3. Children's Privacy</p>
  <p>
    Obsidian is designed to be accessible to users of all ages. We do not
    knowingly collect personal information from children under the age of 13
    without parental consent. If you believe a child under 13 has provided us
    with personal information, please contact us immediately so we can take
    appropriate action.
  </p>
  <p class="text-base">4. How to Manage Your Data</p>
  <p>You have control over your information:</p>
  <ul class="list-disc pl-6 flex flex-col gap-2">
    <li>
      <p>Managing Local Data:</p>
      You can clear your browser storage to remove saved preferences and local <Obfuscate
        text="game"
      ></Obfuscate>
      data.
    </li>
    <li>
      <p>Contact:</p>
      If you have questions about local data or privacy, contact us using the address
      below.
    </li>
  </ul>
  <p class="text-base">5. Changes to This Policy</p>
  <p>
    We may update this Privacy Policy from time to time. Any changes will be
    reflected on this page with an updated date at the top.
  </p>

  <p class="text-base">6. Contact Us</p>
  <p>
    If you have any questions, concerns, or requests regarding this Privacy
    Policy, please contact us at <a class="hover:underline" href={"mailto:" + links.email}
      >{links.email}</a
    >.
  </p>
</div>
