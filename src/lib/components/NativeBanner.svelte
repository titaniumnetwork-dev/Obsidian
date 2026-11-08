<script>
  import { storage } from "#lib/storage.svelte.js";
  import { shouldShowAds } from "#lib/ads.js";

  let adWrapper = $state(null);

  const scriptSrc = import.meta.env.PUBLIC_ADSTERRA_NATIVE_SRC?.trim();
  const containerId =
    import.meta.env.PUBLIC_ADSTERRA_NATIVE_CONTAINER_ID?.trim();

  $effect(() => {
    if (!adWrapper || !scriptSrc || !containerId) return;

    if (shouldShowAds(storage.settings.ads)) {
      if (!adWrapper.querySelector("script")) {
        const script = document.createElement("script");
        script.src = scriptSrc;
        script.async = true;
        script.setAttribute("data-cfasync", "false");
        adWrapper.appendChild(script);
      }
    } else {
      adWrapper.innerHTML = "";
    }
  });
</script>

{#if shouldShowAds(storage.settings.ads) && containerId}
  <div bind:this={adWrapper}>
    <div id={containerId}></div>
  </div>
{/if}
