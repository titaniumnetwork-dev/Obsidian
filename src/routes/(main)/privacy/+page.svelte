<script>
  import Head from "$lib/components/Head.svelte";
  import { links } from "$lib/links";

  let updated = new Date(1779901012831);
</script>

<Head title="Privacy Policy" />

<div class="p-4 flex flex-col gap-4 text-sm">
  <div class="flex flex-col">
    <p class="text-base">Privacy Policy</p>
    <p class="text-text-placeholder">
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
    our website and use our services, including creating an account and playing
    games.
  </p>
  <p class="text-base">1. Information We Collect</p>
  <p>
    We collect information to provide a better experience and to allow you to
    save your progress across devices.
  </p>
  <ul class="list-disc pl-6 flex flex-col gap-2">
    <li>
      <p>Account Information:</p>
      When you register for an account, we collect your email address, a username
      of your choice, and a password (which is securely hashed). This information
      is used to manage your account and identify you on the platform.
    </li>
    <li>
      <p>Synced Storage and Game Data:</p>
      If you are logged in, we store your game saves, high scores, and site settings
      (such as themes and preferences) on our servers so you can access them from
      any device. If you are not logged in, this data is stored locally in your browser.
    </li>
    <li>
      <p>Log Data:</p>
      Like most websites, our servers automatically record basic information that
      your browser sends. This may include your IP address, browser type, device type,
      and the pages you visit.
    </li>
    <li>
      <p>Avatars:</p>
      We generate a default avatar for your account upon registration. You may also
      have the option to update or change this later.
    </li>
  </ul>
  <p class="text-base">2. Cookies and Session Management</p>
  <p>We use cookies to keep you logged in and to remember your preferences.</p>
  <ul class="list-disc pl-6 flex flex-col gap-2">
    <li>
      <p>Session Cookies:</p>
      We use a session ID cookie to identify your logged-in session. This is essential
      for the functionality of your account.
    </li>
    <li>
      <p>Third-Party Content:</p>
      Our website hosts various third-party games and emulators. These third parties
      may use their own cookies or tracking scripts. We do not control these third-party
      trackers.
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
      <p>Account Settings:</p>
      You can update your username and avatar through your account settings page.
    </li>
    <li>
      <p>Clearing Local Data:</p>
      If you are not using an account, you can clear your game progress by clearing
      your browser's cache and site data.
    </li>
    <li>
      <p>Account Deletion:</p>
      If you wish to delete your account and all associated data, please contact us
      at the email address below.
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
    Policy, please contact us at <a class="hover:underline" href={links.email}
      >support@obsidian.com</a
    >.
  </p>
</div>
