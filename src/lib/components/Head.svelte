<script>
  import logo from "$lib/assets/logo.svg";
  import { storage } from "$lib/storage.svelte";
  import { themes } from "$lib/themes";

  let { title, forceTitle, icon } = $props();

  let favicon = $state();
  let pageTitle = $state();

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
</script>

<svelte:head>
  <title
    >{storage.settings.maskTitle
      ? storage.settings.maskTitle
      : pageTitle}</title
  >
  <link
    crossorigin="anonymous"
    rel="icon"
    href={storage.settings.maskIcon ? storage.settings.maskIcon : favicon}
  />
  <meta name="description" content="Play instantly. No downloads." />
  {@html `<style>${themeCustomCSS}</style>`}
  {@html `<style>${storage.settings.customCSS}</style>`}
</svelte:head>
