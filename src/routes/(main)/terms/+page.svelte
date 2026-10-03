<script>
  import Head from "#lib/components/Head.svelte";
  import Obfuscate from "#lib/components/Obfuscate.svelte";
  import { links } from "#lib/links";

  let updated = new Date(1788130714213);
</script>

<Head title="Terms of Service" />

<div class="p-4 flex flex-col gap-4 text-sm">
  <div class="flex flex-col">
    <p class="text-base">Terms of Service</p>
    <p class="text-muted">
      Last updated on {updated.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })}
    </p>
  </div>
  <p>
    Welcome to Obsidian. By accessing or using our website and playing <Obfuscate
      text="games"
    ></Obfuscate>, you agree to be bound by these Terms of Service. If you do
    not agree with any part of these terms, please do not use our site.
  </p>
  <p class="text-base">1. Local Use</p>
  <p>
    Obsidian is designed to run primarily in your browser with local device
    storage for preferences and saved <Obfuscate text="game"></Obfuscate> data.
  </p>
  <ul class="list-disc pl-6 flex flex-col gap-2">
    <li>
      <p>Data Responsibility:</p>
      You are responsible for the browser data stored on your device, including local
      settings and save data.
    </li>
    <li>
      <p>Prohibited Actions:</p>
      You may not use the site to violate laws, abuse platform security, or interfere
      with other users' experience.
    </li>
  </ul>
  <p class="text-base">2. Use of the Site and Conduct</p>
  <p>
    You agree to use the site only for lawful purposes. Prohibited behavior
    includes, but is not limited to:
  </p>
  <ul class="list-disc pl-6 flex flex-col gap-2">
    <li>Attempting to bypass site security or access unauthorized areas.</li>
    <li>Using automated systems (bots, scrapers) to access the site.</li>
    <li>Harassing or interfering with other users' enjoyment of the site.</li>
    <li>
      Exploiting bugs or vulnerabilities to gain an unfair advantage in <Obfuscate
        text="games"
      ></Obfuscate>.
    </li>
  </ul>
  <p class="text-base">3. Intellectual Property</p>
  <p>
    The <Obfuscate text="games"></Obfuscate>, software, and assets on this site
    are the property of their respective owners. Obsidian does not claim
    ownership over third-party <Obfuscate text="games"></Obfuscate>
    or characters. Your use of the site does not grant you any ownership rights.
  </p>
  <p class="text-base">4. Access and Availability</p>
  <p>
    We reserve the right to restrict or terminate access to the site at our sole
    discretion, without notice, for any reason, including breach of these Terms
    of Service.
  </p>
  <p class="text-base">5. Disclaimer of Warranties</p>
  <p>
    Obsidian is provided "as is". We make no warranties regarding the
    availability of the site, the accuracy of <Obfuscate text="game"
    ></Obfuscate> data, or the safety of synced storage. We are not responsible for
    any loss of data, including <Obfuscate text="game"></Obfuscate> saves or progress.
  </p>
  <p class="text-base">6. Limitation of Liability</p>
  <p>
    In no event shall Obsidian or its operators be liable for any damages
    arising out of your use or inability to use the site.
  </p>
  <p class="text-base">7. Contact Us</p>
  <p>
    If you have any questions, concerns, or requests regarding these Terms of
    Service, please contact us at <a
      class="hover:underline"
      href={"mailto:" + links.email}>{links.email}</a
    >.
  </p>
</div>
