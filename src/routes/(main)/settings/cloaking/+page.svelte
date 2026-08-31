<script>
  import KenneyKeyboardIcon from "$lib/components/KenneyKeyboardIcon.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Card from "$lib/components/ui/Card.svelte";
  import Switch from "$lib/components/ui/Switch.svelte";
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
  <Card size="sm">
    <div>
      <p>Tab Mask</p>
      <p class="text-sm text-muted">Disguise your tab</p>
    </div>
    <div class="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="icon"
        aria-label="No Mask"
        onclick={() => setMask("", "")}
        data-active={storage.settings.maskTitle === "" &&
          storage.settings.maskIcon === ""}
        class="rounded-full data-[active=true]:bg-secondary"
      >
        <X size="16" />
      </Button>
      {#each maskTemplates as mask}
        <Button
          variant="outline"
          size="icon"
          aria-label={mask.title}
          onclick={() => setMask(mask.title, mask.icon)}
          data-active={storage.settings.maskTitle === mask.title &&
            storage.settings.maskIcon === mask.icon}
          class="rounded-full p-2 data-[active=true]:bg-secondary"
        >
          <img draggable="false" alt={mask.title} src={mask.icon} size="16" />
        </Button>
      {/each}
    </div>
    <div class="flex flex-col gap-2">
      <div
        class="w-80 focus-within:bg-secondary bg-card border border-border rounded-lg items-center h-9 px-2.5"
      >
        <input
          value={storage.settings.maskTitle}
          oninput={(e) => storage.updateSetting("maskTitle", e.target.value)}
          placeholder="Title"
          class="h-full w-full bg-transparent outline-none placeholder:text-muted text-sm"
        />
      </div>
      <div
        class="w-80 focus-within:bg-secondary bg-card border border-border rounded-lg items-center h-9 px-2.5"
      >
        <input
          value={storage.settings.maskIcon}
          oninput={(e) => storage.updateSetting("maskIcon", e.target.value)}
          placeholder="Icon"
          class="h-full w-full bg-transparent outline-none placeholder:text-muted text-sm"
        />
      </div>
    </div>
  </Card>
  <Card size="sm">
    <div>
      <p>Panic Key</p>
      <p class="text-sm text-muted">Quickly redirect to another website</p>
    </div>
    <div class="flex gap-2">
      <Button
        variant="outline"
        onclick={() => (binding = true)}
        class="outline-none bg-secondary"
      >
        {#if binding}
          <span>Waiting for key...</span>
        {:else if storage.settings.panicKey.length > 0}
          <KenneyKeyboardIcon key={storage.settings.panicKey} />
        {:else}
          Choose Key
        {/if}
      </Button>
      <div
        class="w-80 focus-within:bg-secondary bg-card border border-border rounded-lg items-center h-9 px-2.5"
      >
        <input
          value={storage.settings.panicURL}
          oninput={(e) => storage.updateSetting("panicURL", e.target.value)}
          placeholder="URL"
          class="h-full w-full bg-transparent outline-none placeholder:text-muted text-sm"
        />
      </div>
    </div>
  </Card>
  <Card size="sm" class="flex-row justify-between">
    <div>
      <p>Close Prevention</p>
      <p class="text-sm text-muted">Prevent the tab from being closed</p>
    </div>
    <Switch
      aria-label="Close Prevention"
      checked={storage.settings.closePrevention}
      onchange={(e) =>
        storage.updateSetting("closePrevention", e.target.checked)}
    />
  </Card>
</div>
