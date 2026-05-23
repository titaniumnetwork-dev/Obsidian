<script>
  import { keyIcon } from "$lib/keyIcon";
  import { storage } from "$lib/storage.svelte";
  import { X } from "@lucide/svelte";

  function setMask(title, icon) {
    storage.updateSetting("maskTitle", title);
    storage.updateSetting("maskIcon", icon);
  }

  const maskTemplates = [
    {
      title: "Google",
      icon: "https://www.google.com/favicon.ico",
    },
    {
      title: "Wikipedia",
      icon: "https://www.wikipedia.org/static/favicon/wikipedia.ico",
    },
    {
      title: "Canvas",
      icon: "https://du11hjcvx0uqb.cloudfront.net/dist/images/favicon-e10d657a73.ico",
    },
    {
      title: "Google Classroom",
      icon: "https://ssl.gstatic.com/classroom/ic_product_classroom_144.png",
    },
    {
      title: "Khan Academy",
      icon: "https://www.khanacademy.org/favicon.ico",
    },
  ];

  let binding = $state(false);

  function handleKeydown(e) {
    if (!binding) return;

    e.preventDefault();
    e.stopPropagation();

    if (e.key === "Escape") {
      storage.updateSetting("panicKey", "");
      binding = false;
      return;
    }

    storage.updateSetting("panicKey", e.code);
    binding = false;
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<p>Tab Mask</p>
<p class="text-sm text-text-placeholder mb-4">Disguise your tab</p>
<div class="flex gap-4">
  <button
    aria-label="No Mask"
    onclick={() => setMask("", "")}
    data-active={storage.settings.maskTitle === "" &&
      storage.settings.maskIcon === ""}
    class="w-10 h-10 cursor-pointer rounded-full border border-border transition-colors data-[active=true]:bg-surface flex justify-center items-center"
  >
    <X size="20" />
  </button>
  {#each maskTemplates as mask}
    <button
      aria-label={mask.title}
      onclick={() => setMask(mask.title, mask.icon)}
      data-active={storage.settings.maskTitle === mask.title &&
        storage.settings.maskIcon === mask.icon}
      class="w-10 h-10 cursor-pointer rounded-full border border-border transition-colors data-[active=true]:bg-surface flex justify-center items-center p-2"
    >
      <img draggable="false" alt={mask.title} src={mask.icon} size="20" />
    </button>
  {/each}
</div>
<div
  class="w-80 focus-within:bg-surface bg-secondary border border-border rounded-xl items-center pl-3 my-4"
>
  <input
    value={storage.settings.maskTitle}
    oninput={(e) => storage.updateSetting("maskTitle", e.target.value)}
    placeholder="Title"
    class="h-10 w-full pl-2 pr-4 bg-transparent outline-none placeholder:text-text-placeholder"
  />
</div>
<div
  class="w-80 focus-within:bg-surface bg-secondary border border-border rounded-xl items-center pl-3"
>
  <input
    value={storage.settings.maskIcon}
    oninput={(e) => storage.updateSetting("maskIcon", e.target.value)}
    placeholder="Icon"
    class="h-10 w-full pl-2 pr-4 bg-transparent outline-none placeholder:text-text-placeholder"
  />
</div>
<p class="mt-4">Panic Key</p>
<p class="text-sm text-text-placeholder mb-4">
  Quickly redirect to another website
</p>
<div class="flex gap-2">
  <button
    onclick={() => (binding = true)}
    class="outline-none px-4 py-2 text-sm cursor-pointer rounded-xl whitespace-nowrap bg-surface border border-border"
  >
    {#if binding}
      <span>Waiting for key...</span>
    {:else if storage.settings.panicKey.length > 0}
      <div
        class="flex items-center justify-center px-1.5 py-0.5 my-0.5 text-xs rounded-md bg-primary border border-border-primary text-text-inverse"
      >
        {keyIcon(storage.settings.panicKey)}
      </div>
    {:else}
      Choose Key
    {/if}
  </button>
  <div
    class="w-80 focus-within:bg-surface bg-secondary border border-border rounded-xl items-center pl-3"
  >
    <input
      value={storage.settings.panicURL}
      oninput={(e) => storage.updateSetting("panicURL", e.target.value)}
      placeholder="URL"
      class="h-10 w-full pl-2 pr-4 bg-transparent outline-none placeholder:text-text-placeholder"
    />
  </div>
</div>
<p class="mt-4">Close Prevention</p>
<p class="text-sm text-text-placeholder mb-4">
  Prevent the tab from being closed
</p>
<input
  aria-label="Close Prevention"
  checked={storage.settings.closePrevention}
  onchange={(e) => storage.updateSetting("closePrevention", e.target.checked)}
  class="appearance-none cursor-pointer transition-colors bg-secondary checked:bg-surface border border-border w-11 h-6 rounded-full flex items-center px-0.5 before:content-[''] before:h-4 before:w-4 before:rounded-full before:border before:border-border checked:before:border-border-primary before:bg-surface checked:before:bg-primary before:block checked:before:translate-x-5.5 before:transition-[translate,background,border]"
  type="checkbox"
/>
