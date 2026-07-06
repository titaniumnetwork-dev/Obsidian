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

<div class="grid grid-cols-2 gap-4">
  <div
    class="flex flex-col gap-4 bg-neutral-900 rounded-radius p-4 text-sm border border-border"
  >
    <div>
      <p>Tab Mask</p>
      <p class="text-sm text-text-placeholder">Disguise your tab</p>
    </div>
    <div class="flex flex-wrap gap-2">
      <button
        aria-label="No Mask"
        onclick={() => setMask("", "")}
        data-active={storage.settings.maskTitle === "" &&
          storage.settings.maskIcon === ""}
        class="w-9 h-9 cursor-pointer rounded-full border border-border transition-colors data-[active=true]:bg-surface flex justify-center items-center"
      >
        <X size="16" />
      </button>
      {#each maskTemplates as mask}
        <button
          aria-label={mask.title}
          onclick={() => setMask(mask.title, mask.icon)}
          data-active={storage.settings.maskTitle === mask.title &&
            storage.settings.maskIcon === mask.icon}
          class="w-9 h-9 cursor-pointer rounded-full border border-border transition-colors data-[active=true]:bg-surface flex justify-center items-center p-2"
        >
          <img draggable="false" alt={mask.title} src={mask.icon} size="16" />
        </button>
      {/each}
    </div>
    <div class="flex flex-col gap-2">
      <div
        class="w-80 focus-within:bg-surface bg-secondary border border-border rounded-xl items-center h-9 px-2.5"
      >
        <input
          value={storage.settings.maskTitle}
          oninput={(e) => storage.updateSetting("maskTitle", e.target.value)}
          placeholder="Title"
          class="h-full w-full bg-transparent outline-none placeholder:text-text-placeholder text-sm"
        />
      </div>
      <div
        class="w-80 focus-within:bg-surface bg-secondary border border-border rounded-xl items-center h-9 px-2.5"
      >
        <input
          value={storage.settings.maskIcon}
          oninput={(e) => storage.updateSetting("maskIcon", e.target.value)}
          placeholder="Icon"
          class="h-full w-full bg-transparent outline-none placeholder:text-text-placeholder text-sm"
        />
      </div>
    </div>
  </div>
  <div
    class="flex flex-col gap-4 bg-neutral-900 rounded-radius p-4 text-sm border border-border"
  >
    <div>
      <p>Panic Key</p>
      <p class="text-sm text-text-placeholder">
        Quickly redirect to another website
      </p>
    </div>
    <div class="flex gap-2">
      <button
        onclick={() => (binding = true)}
        class="outline-none h-9 px-2.5 text-sm cursor-pointer rounded-xl whitespace-nowrap bg-surface border border-border"
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
        class="w-80 focus-within:bg-surface bg-secondary border border-border rounded-xl items-center h-9 px-2.5"
      >
        <input
          value={storage.settings.panicURL}
          oninput={(e) => storage.updateSetting("panicURL", e.target.value)}
          placeholder="URL"
          class="h-full w-full bg-transparent outline-none placeholder:text-text-placeholder text-sm"
        />
      </div>
    </div>
  </div>
  <div
    class="flex flex-col gap-4 bg-neutral-900 rounded-radius p-4 text-sm border border-border"
  >
    <div>
      <p>Close Prevention</p>
      <p class="text-sm text-text-placeholder">
        Prevent the tab from being closed
      </p>
    </div>
    <input
      aria-label="Close Prevention"
      checked={storage.settings.closePrevention}
      onchange={(e) =>
        storage.updateSetting("closePrevention", e.target.checked)}
      class="appearance-none cursor-pointer transition-colors bg-secondary checked:bg-surface border border-border w-11 h-6 rounded-full flex items-center px-0.5 before:content-[''] before:h-4 before:w-4 before:rounded-full before:border before:border-border checked:before:border-border-primary before:bg-surface checked:before:bg-primary before:block checked:before:translate-x-5.5 before:transition-[translate,background,border]"
      type="checkbox"
    />
  </div>
</div>
