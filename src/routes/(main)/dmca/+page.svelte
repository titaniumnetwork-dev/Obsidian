<script>
  import Head from "$lib/components/Head.svelte";

  let updated = new Date(1779298873266);
</script>

<Head title="DMCA Takedown" />

<div class="p-4 pt-0 flex flex-col gap-4">
  <div class="flex flex-col">
    <p class="text-xl">DMCA Takedown</p>
    <p class="text-text-placeholder">
      Last updated on {updated.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })}
    </p>
  </div>
  <p>
    We respect the intellectual property rights of others and expect our users
    to do the same. In accordance with the Digital Millennium Copyright Act
    (DMCA), we will respond promptly to notices of alleged infringement that are
    reported to our designated copyright agent.
  </p>
  <p class="text-xl">1. Filing a DMCA Notice of Infringement</p>
  <p>
    If you are a copyright owner or an agent thereof, and you believe that any
    content hosted on our site (such as web games or emulated files) infringes
    your copyrights, you may submit a notification pursuant to the DMCA by
    providing us with the following information in writing:
  </p>
  <ul class="list-disc pl-6 flex flex-col gap-2">
    <li>
      A physical or electronic signature of a person authorized to act on behalf
      of the owner of an exclusive right that is allegedly infringed.
    </li>
    <li>
      Identification of the copyrighted work claimed to have been infringed, or,
      if multiple copyrighted works on the site are covered by a single
      notification, a representative list of such works.
    </li>
    <li>
      Identification of the material that is claimed to be infringing or to be
      the subject of infringing activity and that is to be removed or access to
      which is to be disabled, and information reasonably sufficient to permit
      us to locate the material (such as the specific URL of the game page).
    </li>
    <li>
      Information reasonably sufficient to permit us to contact you, such as an
      address, telephone number, and, if available, an electronic mail address.
    </li>
    <li>
      A statement that you have a good faith belief that use of the material in
      the manner complained of is not authorized by the copyright owner, its
      agent, or the law.
    </li>
    <li>
      A statement that the information in the notification is accurate, and
      under penalty of perjury, that you are authorized to act on behalf of the
      owner of an exclusive right that is allegedly infringed.
    </li>
  </ul>
  <p class="text-xl">2. Submitting a Counter-Notice</p>
  <p>
    If you believe that your content was removed (or to which access was
    disabled) by mistake or misidentification, you may send a counter-notice
    containing the following information to our copyright agent:
  </p>
  <ul class="list-disc pl-6 flex flex-col gap-2">
    <li>Your physical or electronic signature.</li>
    <li>
      Identification of the content that has been removed or to which access has
      been disabled and the location at which the content appeared before it was
      removed or disabled.
    </li>
    <li>
      A statement that you have a good faith belief that the content was removed
      or disabled as a result of mistake or a misidentification of the content.
    </li>
    <li>Your name, address, telephone number, and email address.</li>
  </ul>
  <p class="text-xl">3. Repeat Infringer Policy</p>
  <p>
    In accordance with the DMCA and other applicable law, we have adopted a
    policy of terminating, in appropriate circumstances and at our sole
    discretion, users or content providers who are deemed to be repeat
    infringers.
  </p>
  <p class="text-xl">4. Contact Our Designated Agent</p>
  <p>
    To submit a DMCA notice or counter-notice, please send the required
    information to our designated copyright agent at <a
      href="mailto:support@obsidian.com">support@obsidian.com</a
    >.
  </p>
</div>
