<script>
  import Head from "$lib/components/Head.svelte";

  let updated = new Date(1779298873266);
</script>

<Head title="Terms of Service" />

<div class="p-4 pt-0 flex flex-col gap-4">
  <div class="flex flex-col">
    <p class="text-xl">Terms of Service</p>
    <p class="text-text-placeholder">
      Last updated on {updated.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })}
    </p>
  </div>
  <p>
    Welcome to our site. By accessing or using our website to play games, you
    agree to be bound by these Terms of Service. If you do not agree with any
    part of these terms, please do not use our site.
  </p>
  <p class="text-xl">1. Use of the Site</p>
  <p>
    Our website provides access to a collection of web games and emulators for
    personal, non-commercial entertainment. You agree to use the site only for
    lawful purposes and in a way that does not infringe on the rights of,
    restrict, or inhibit anyone else's use and enjoyment of the site.
  </p>
  <p class="text-xl">2. Intellectual Property and Third-Party Content</p>
  <p>
    The games hosted on this site, including but not limited to web games and
    emulated titles, are the property of their respective creators and copyright
    holders. We do not claim ownership over any third-party games, characters,
    or assets embedded or hosted on this platform.
  </p>
  <p class="text-xl">3. Disclaimer of Warranties</p>
  <p>
    The website and all games on it are provided on an "as is" and "as
    available" basis. We make no warranties, expressed or implied, regarding the
    operation of the site or the reliability of the embedded content.
  </p>
  <ul class="list-disc pl-6 flex flex-col gap-2">
    <li>
      Game Saves: As noted in our Privacy Policy, game progress is often stored
      locally in your browser. We are not responsible for lost save data, high
      scores, or progress due to cleared caches, browser updates, or site
      errors.
    </li>
    <li>
      Availability: We do not guarantee that the site will be available at all
      times or that it will be completely free from errors, downtime, or
      interruptions.
    </li>
  </ul>
  <p class="text-xl">4. Limitation of Liability</p>
  <p>
    In no event shall we be liable for any direct, indirect, incidental,
    consequential, or punitive damages arising out of your access to, or use of,
    the site and its games. This includes any loss of data or disruptions to
    your device resulting from playing embedded games.
  </p>
  <p class="text-xl">5. Modifications to the Terms</p>
  <p>
    We reserve the right to modify these Terms of Service at any time. Any
    changes will be posted on this page with an updated modification date at the
    top. Your continued use of the site after any changes indicates your
    acceptance of the new terms.
  </p>
  <p class="text-xl">6. Contact Us</p>
  <p>
    If you have any questions, concerns, or requests regarding these Terms of
    Service, please contact us at <a href="mailto:support@obsidian.com"
      >support@obsidian.com</a
    >.
  </p>
</div>
