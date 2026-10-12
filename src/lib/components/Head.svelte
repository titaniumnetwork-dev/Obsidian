<script>
  import logo from "#lib/assets/logo.svg";
  import { storage } from "#lib/storage.svelte";
  import { themes } from "#lib/themes";
  import { hiddenClass } from "#lib/utils";

  const adsensePubId = import.meta.env.PUBLIC_ADSENSE_PUB_ID;

  let { title, forceTitle, icon } = $props();

  let favicon = $state();
  let pageTitle = $state();

  let isLocalVisible = $state(true);
  let isRemoteVisible = $state(false);

  const themeData = $derived(
    themes.filter((theme) => theme.name === storage.theme)[0],
  );

  $effect(() => {
    pageTitle = forceTitle
      ? forceTitle
      : title
        ? `${title} | Obsidian`
        : "Obsidian";

    favicon = icon ? icon : logo;
  });

  $effect(() => {
    if (typeof BroadcastChannel === "undefined") return;

    const channel = new BroadcastChannel("visibility");
    let hideTimeout;

    const updateVisibility = () => {
      isLocalVisible = !document.hidden;

      if (isLocalVisible) {
        isRemoteVisible = false;
        channel.postMessage("visible");
      } else {
        channel.postMessage("hidden");
        channel.postMessage("query");
      }
    };

    channel.onmessage = (event) => {
      if (event.data === "visible") {
        clearTimeout(hideTimeout);
        isRemoteVisible = true;
      } else if (event.data === "hidden") {
        clearTimeout(hideTimeout);
        hideTimeout = setTimeout(() => {
          isRemoteVisible = false;
        }, 100);
      } else if (event.data === "query") {
        if (!document.hidden) {
          channel.postMessage("visible");
        }
      }
    };

    updateVisibility();

    document.addEventListener("visibilitychange", updateVisibility);

    return () => {
      document.removeEventListener("visibilitychange", updateVisibility);
      channel.close();
      clearTimeout(hideTimeout);
    };
  });

  let themeCustomCSS = $state("");

  function generateProperties(items) {
    return Object.entries(items)
      .map((prop) => {
        return prop[0] + ": " + prop[1] + ";";
      })
      .join("");
  }

  $effect(() => {
    if (themeData.css) {
      themeCustomCSS = Object.entries(themeData.css)
        .map((item) => {
          return `${item[0]} {${generateProperties(item[1])}}`;
        })
        .join(" ");
    } else {
      themeCustomCSS = "";
    }
  });

  const shouldMask = $derived(
    !storage.settings.autoMask || (!isLocalVisible && !isRemoteVisible),
  );

  const activeTitle = $derived(
    shouldMask && storage.settings.maskTitle
      ? storage.settings.maskTitle
      : pageTitle,
  );
  const activeIcon = $derived(
    shouldMask && storage.settings.maskIcon
      ? storage.settings.maskIcon
      : favicon,
  );
</script>

<svelte:head>
  <title>{activeTitle}</title>
  <link crossorigin="anonymous" rel="icon" href={activeIcon} />
  <meta name="description" content="Play instantly. No downloads." />
  {@html `<style>${themeCustomCSS}</style>`}
  {@html `<style>${storage.settings.customCSS}</style>`}
  {@html `<style>.${hiddenClass} {position: absolute;z-index: -10;opacity: 0;}</style>`}
  {#if adsensePubId}
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsensePubId}`}
      crossorigin="anonymous"
    ></script>
  {/if}
</svelte:head>
