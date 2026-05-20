<script>
  import Head from "$lib/components/Head.svelte";

  let updated = new Date(1779298873266);
</script>

<Head title="Privacy Policy" />

<div class="p-4 pt-0 flex flex-col gap-4">
  <div class="flex flex-col">
    <p class="text-xl">Privacy Policy</p>
    <p class="text-text-placeholder">
      Last updated on {updated.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })}
    </p>
  </div>
  <p>
    Welcome to our site. We respect your privacy and are committed to protecting
    it. This Privacy Policy explains how we handle information when you visit
    and play games on our website.
  </p>
  <p class="text-xl">1. Information We Collect</p>
  <p>
    We collect minimal information to ensure the site runs smoothly. The types
    of data we may encounter include:
  </p>
  <ul class="list-disc pl-6 flex flex-col gap-2">
    <li>
      Log Data: Like most websites, our servers automatically record basic
      information that your browser sends. This may include your IP address,
      browser type, device type, and the pages you visit.
    </li>
    <li>
      Game Save Data: Many of the games hosted on our site (such as Slope, Duck
      Life, or emulated games) require a way to save your progress, unlocked
      levels, or high scores. This is done using your browser's Local Storage or
      session storage. This data is stored locally on your device, not on our
      servers.
    </li>
  </ul>
  <p class="text-xl">2. Cookies and Third-Party Services</p>
  <p>
    Our website hosts and embeds various third-party web games and emulators.
    Please be aware of the following:
  </p>
  <ul class="list-disc pl-6 flex flex-col gap-2">
    <li>
      Embedded Games: Because some games are embedded from other sources, the
      creators of those games may include their own tracking scripts, analytics,
      or cookies. We do not control these third-party trackers.
    </li>
    <li>
      Analytics and Advertising: We may use third-party analytics tools to
      understand site traffic or advertising networks to display ads. These
      services may use cookies to collect non-personal data about your
      interactions with our site.
    </li>
  </ul>
  <p class="text-xl">3. Children's Privacy</p>
  <p>
    Our website provides access to web games and is designed to be accessible to
    users of all ages. However, we do not knowingly collect, request, or store
    personally identifiable information (such as names, emails, or phone
    numbers) from anyone, including children under the age of 13. If you believe
    we have inadvertently collected personal information from a child, please
    contact us so we can delete it immediately.
  </p>
  <p class="text-xl">4. How to Manage Your Data</p>
  <p>
    If you wish to clear your game saves, high scores, or any cookies set by our
    site or third-party games, you can do so by clearing your web browser's
    cache and site data. Please note that doing this will permanently delete
    your game progress for games that rely on local storage.
  </p>
  <p class="text-xl">5. Changes to This Policy</p>
  <p>
    We may update this Privacy Policy from time to time as we add new games or
    features. Any changes will be reflected on this page with an updated date at
    the top. We encourage you to review this policy periodically.
  </p>

  <p class="text-xl">6. Contact Us</p>
  <p>
    If you have any questions, concerns, or requests regarding this Privacy
    Policy, please contact us at <a href="mailto:support@obsidian.com"
      >support@obsidian.com</a
    >.
  </p>
</div>
