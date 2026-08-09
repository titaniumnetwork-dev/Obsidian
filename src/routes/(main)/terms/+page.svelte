<script>
  import Head from "$lib/components/Head.svelte";
  import { links } from "$lib/links";

  let updated = new Date(1779901012831);
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
    Welcome to Obsidian. By accessing or using our website, creating an account,
    or playing games, you agree to be bound by these Terms of Service. If you do
    not agree with any part of these terms, please do not use our site.
  </p>
  <p class="text-base">1. Account Registration</p>
  <p>
    To access certain features of the site, you may be required to register for
    an account.
  </p>
  <ul class="list-disc pl-6 flex flex-col gap-2">
    <li>
      <p>Eligibility:</p>
      You must provide accurate and complete information during registration.
    </li>
    <li>
      <p>Security:</p>
      You are responsible for maintaining the confidentiality of your account credentials
      and for all activities that occur under your account.
    </li>
    <li>
      <p>Prohibited Actions:</p>
      You may not use a username that is offensive, vulgar, or infringes on the rights
      of others.
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
      Exploiting bugs or vulnerabilities to gain an unfair advantage in games.
    </li>
  </ul>
  <p class="text-base">3. Intellectual Property</p>
  <p>
    The games, software, and assets on this site are the property of their
    respective owners. Obsidian does not claim ownership over third-party games
    or characters. Your use of the site does not grant you any ownership rights.
  </p>
  <p class="text-base">4. Termination</p>
  <p>
    We reserve the right to suspend or terminate your account or access to the
    site at our sole discretion, without notice, for any reason, including
    breach of these Terms of Service.
  </p>
  <p class="text-base">5. Disclaimer of Warranties</p>
  <p>
    Obsidian is provided "as is". We make no warranties regarding the
    availability of the site, the accuracy of game data, or the safety of synced
    storage. We are not responsible for any loss of data, including game saves
    or progress.
  </p>
  <p class="text-base">6. Limitation of Liability</p>
  <p>
    In no event shall Obsidian or its operators be liable for any damages
    arising out of your use or inability to use the site.
  </p>
  <p class="text-base">7. Contact Us</p>
  <p>
    If you have any questions, concerns, or requests regarding these Terms of
    Service, please contact us at <a class="hover:underline" href={links.email}
      >support@obsidian.com</a
    >.
  </p>
</div>
