<script>
  import Logo from "$lib/assets/logo.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import Head from "$lib/components/Head.svelte";
  import KenneyGamepadIcon from "$lib/components/KenneyGamepadIcon.svelte";
  import KenneyKeyboardIcon from "$lib/components/KenneyKeyboardIcon.svelte";
  import Obfuscate from "$lib/components/Obfuscate.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Input from "$lib/components/ui/Input.svelte";
  import Switch from "$lib/components/ui/Switch.svelte";
  import Textarea from "$lib/components/ui/Textarea.svelte";
  import { emulators } from "$lib/emulators";
  import { storage } from "$lib/storage.svelte";
  import {
    ChartPie,
    Check,
    ChevronDown,
    Clock,
    Download,
    Ellipsis,
    ExternalLink,
    Gamepad,
    Gamepad2,
    Keyboard,
    Play,
    Plus,
    RefreshCcw,
    Share,
    Tag,
    Tags,
    Trash,
    Upload,
    User,
    X,
  } from "@lucide/svelte";
  import JSZip from "jszip";

  let title = $state("");
  let developer = $state("");
  let description = $state("");
  let id = $state(self.crypto.randomUUID());
  let dateAdded = $state(Date.now());
  let version = $state("");
  let tags = $state([]);
  let hero = $state("");
  let cover = $state("");
  let icon = $state("");
  let type = $state("HTML");
  let emulator = $state("");
  let path = $state("/index.html");
  let rom = $state("");
  let controls = $state([]);
  let gamepadControls = $state([]);
  let controllerSupport = $state(false);

  async function formatImage(file, sizeWidth, sizeHeight) {
    if (!file) return null;

    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise((r) => (img.onload = r));

    const canvas = document.createElement("canvas");
    canvas.width = sizeWidth;
    canvas.height = sizeHeight;

    const scale = Math.max(sizeWidth / img.width, sizeHeight / img.height);
    const scaledW = img.width * scale;
    const scaledH = img.height * scale;
    const x = (sizeWidth - scaledW) / 2;
    const y = (sizeHeight - scaledH) / 2;

    canvas.getContext("2d").drawImage(img, x, y, scaledW, scaledH);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(img.src);
        resolve(blob);
      }, "image/webp");
    });
  }

  async function downloadAssets() {
    const images = [
      { name: "hero", url: hero },
      { name: "cover", url: cover },
      { name: "icon", url: icon },
    ];

    const zip = new JSZip();
    const folder = zip.folder(id);

    const promises = images.map(async (image) => {
      const response = await fetch(image.url);
      const blob = await response.blob();

      folder.file(`${image.name}.webp`, blob);
    });

    await Promise.all(promises);

    const content = await zip.generateAsync({ type: "blob" });
    const zipUrl = URL.createObjectURL(content);

    const link = document.createElement("a");
    link.href = zipUrl;
    link.download = title ? `${title} Assets.zip` : `${id} Assets.zip`;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(zipUrl);
  }

  let tagsNode = $state();
  let emulatorNode = $state();

  function handleClickOutside(event) {
    if (tagsNode && !tagsNode.contains(event.target)) {
      tagsNode.removeAttribute("open");
    }
    if (emulatorNode && !emulatorNode.contains(event.target)) {
      emulatorNode.removeAttribute("open");
    }
  }

  let generateData = $derived.by(() => {
    let data = {
      id,
      dateAdded,
      type,
      controllerSupport,
    };

    if (tags.length) {
      data.tags = [...tags];
    }

    if (title) {
      data.title = title;
    }

    if (developer) {
      data.developer = developer;
    }

    if (description) {
      data.description = description;
    }

    if (controls.length > 0) data.controls = controls;
    if (gamepadControls.length > 0) data.gamepadControls = gamepadControls;

    if (version) {
      data.version = version;
    } else {
      data.internalVersion = "1";
    }

    switch (type) {
      case "HTML":
        if (path) {
          data.path = path;
        }
        break;
      case "Emulation":
        if (rom) {
          data.rom = rom;
        }
        if (emulator) {
          data.emulator = emulator;
        }
        break;
    }

    return data;
  });

  let activeListeningIndex = $state({ actionIdx: null, keyIdx: null });
  let newActionName = $state("");

  function addAction() {
    if (!newActionName.trim()) return;
    controls.push({
      action: newActionName.trim(),
      keys: [],
    });
    newActionName = "";
  }

  function removeAction(actionIdx) {
    controls.splice(actionIdx, 1);
  }

  function addKeySlot(actionIdx) {
    controls[actionIdx].keys.push({ key: "Press a key...", keyCode: 0 });
    startListening(actionIdx, controls[actionIdx].keys.length - 1);
  }

  function removeKey(actionIdx, keyIdx) {
    controls[actionIdx].keys.splice(keyIdx, 1);
    if (
      activeListeningIndex.actionIdx === actionIdx &&
      activeListeningIndex.keyIdx === keyIdx
    ) {
      stopListening();
    }
  }

  function startListening(actionIdx, keyIdx) {
    activeListeningIndex = { actionIdx, keyIdx };
    window.addEventListener("keydown", handleKeyDown);
  }

  function stopListening() {
    activeListeningIndex = { actionIdx: null, keyIdx: null };
    window.removeEventListener("keydown", handleKeyDown);
  }

  let activeGamepadListeningIndex = $state(null);
  let newGamepadActionName = $state("");
  let gamepadPollingFrame = null;

  function addGamepadAction() {
    if (!newGamepadActionName.trim()) return;
    gamepadControls.push({
      action: newGamepadActionName.trim(),
    });
    newGamepadActionName = "";
  }

  function removeGamepadAction(actionIdx) {
    gamepadControls.splice(actionIdx, 1);
  }

  function startGamepadListening(actionIdx) {
    activeGamepadListeningIndex = actionIdx;

    setTimeout(() => {
      if (activeGamepadListeningIndex === actionIdx) {
        pollForGamepadInput();
      }
    }, 200);
  }

  function stopGamepadListening() {
    activeGamepadListeningIndex = null;
    if (gamepadPollingFrame) cancelAnimationFrame(gamepadPollingFrame);
  }

  function pollForGamepadInput() {
    if (activeGamepadListeningIndex === null) return;

    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    let mapped = false;
    const DEADZONE = 0.5;

    for (let gp of gamepads) {
      if (!gp) continue;

      for (let i = 0; i < gp.buttons.length; i++) {
        if (gp.buttons[i].pressed) {
          const action = gamepadControls[activeGamepadListeningIndex];
          if (!action.buttons) action.buttons = [];
          if (!action.buttons.includes(i)) action.buttons.push(i);
          mapped = true;
        }
      }

      if (!mapped && gp.axes) {
        for (let i = 0; i < gp.axes.length; i++) {
          const val = gp.axes[i];
          if (Math.abs(val) > DEADZONE) {
            const dir = val > 0 ? 1 : -1;
            const action = gamepadControls[activeGamepadListeningIndex];
            if (!action.axes) action.axes = [];
            if (
              !action.axes.some((a) => a.index === i && a.direction === dir)
            ) {
              action.axes.push({ index: i, direction: dir });
            }
            mapped = true;
          }
        }
      }

      if (mapped) break;
    }

    if (mapped) {
      stopGamepadListening();
    } else {
      gamepadPollingFrame = requestAnimationFrame(pollForGamepadInput);
    }
  }

  function handleKeyDown(e) {
    e.preventDefault();

    if (activeGamepadListeningIndex !== null) {
      if (e.code === "Escape") {
        stopGamepadListening();
      }
      return;
    }

    const { actionIdx, keyIdx } = activeListeningIndex;
    if (actionIdx !== null && keyIdx !== null) {
      controls[actionIdx].keys[keyIdx] = {
        key: e.code === "Space" ? "Space" : e.code,
        keyCode: e.keyCode,
      };
    }
    stopListening();
  }

  function reset() {
    id = self.crypto.randomUUID();
    dateAdded = Date.now();

    title = "";
    developer = "";
    description = "";
    version = "";
    tags = [];
    hero = "";
    cover = "";
    icon = "";
    type = "HTML";
    path = "/index.html";
    rom = "";
    controls = [];
    gamepadControls = [];
    controllerSupport = false;
  }

  let allTagsSelected = $derived(tags.length === storage.tags.length);
</script>

<svelte:window onclick={handleClickOutside} />

<Head title="Creator" />

<div
  class="group bg-card w-64 flex flex-col gap-2 shrink-0 m-2 mr-0 rounded-lg border border-border box-content h-[calc(100%-18px)"
>
  <div class="bg-card sticky top-0 py-2 z-10">
    <div class="flex items-center mx-2 gap-1 justify-between overflow-hidden">
      <div class="flex gap-2 items-center">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Home Logo"
          href={storage.settings.libraryMode ? "/library" : "/"}
        >
          <Logo class="size-5" />
        </Button>
        <p class="text-sm">
          <Obfuscate text="Game"></Obfuscate> Creator
        </p>
      </div>
    </div>
  </div>
  <div class="flex flex-col gap-2 overflow-y-auto p-2 pt-0 *:shrink-0">
    <Input bind:value={title} placeholder="Title" />
    <Input bind:value={developer} placeholder="Developer" />
    <Textarea bind:value={description} placeholder="Description"></Textarea>
    <Input bind:value={version} placeholder="Version (Optional)" />
    <details
      class="relative bg-input/30 rounded-lg border border-input h-9"
      bind:this={tagsNode}
    >
      <summary
        class="flex gap-1.5 cursor-pointer text-sm justify-center items-center h-full select-none px-2"
      >
        {#if tags.length === 0}
          <Tags size="16" />
          <span>Select Tags</span>
          <ChevronDown size="16" />
        {:else if allTagsSelected}
          <Tags size="16" />
        {:else}
          <Tags size="16" />
          <span> {tags.length > 1 ? tags.length + " Tags" : tags[0]}</span>
          <ChevronDown size="16" />
        {/if}
      </summary>
      <div
        class="absolute -left-px -right-px min-w-[calc(100%+2px)] w-max mt-2.5 bg-card rounded-lg max-h-60 overflow-y-auto border border-input z-10 flex flex-col p-1"
      >
        <button
          onclick={(e) => (tags = [])}
          class="rounded-md flex items-center px-2 py-1.5 gap-1.5 cursor-pointer hover:bg-secondary text-sm transition-colors"
        >
          <p class="select-none">None</p>
        </button>
        {#each storage.tags as tag}
          <label
            class="rounded-md flex items-center px-2 py-1.5 gap-1.5 cursor-pointer hover:bg-secondary text-sm transition-colors"
          >
            <div class="relative flex items-center justify-center">
              <input
                type="checkbox"
                class="peer w-4 h-4 cursor-pointer appearance-none border border-border checked:bg-primary rounded"
                value={tag}
                checked={tags.includes(tag)}
                onchange={(e) => {
                  const isChecked = e.target.checked;

                  const newTags = isChecked
                    ? [...tags, tag]
                    : tags.filter((t) => t !== tag);

                  tags = newTags;
                }}
              />
              <Check
                class="absolute hidden peer-checked:block text-card"
                size="14"
              />
            </div>
            <p class="select-none">{tag}</p>
          </label>
        {/each}
      </div>
    </details>
    <div
      class="bg-card grid grid-cols-3 items-center p-1 h-9 rounded-lg text-sm border border-input gap-1 shrink-0"
    >
      <button
        onclick={() => (type = "HTML")}
        data-active={type === "HTML"}
        class="h-full flex items-center justify-center data-[active=true]:bg-input transition-colors rounded-md px-2 cursor-pointer"
        >HTML</button
      >
      <button
        onclick={() => (type = "Flash")}
        data-active={type === "Flash"}
        class="h-full flex items-center justify-center data-[active=true]:bg-input transition-colors rounded-md px-2 cursor-pointer"
        >Flash</button
      >
      <button
        onclick={() => (type = "Emulation")}
        data-active={type === "Emulation"}
        class="h-full flex items-center justify-center data-[active=true]:bg-input transition-colors rounded-md px-2 cursor-pointer"
        >Emulation</button
      >
    </div>
    {#if type === "HTML"}
      <Input bind:value={path} placeholder="Index file path" />
    {:else if type === "Emulation"}
      <Input bind:value={rom} placeholder="Rom file path" />
      <details
        class="relative bg-input/30 rounded-lg border border-input h-9"
        bind:this={emulatorNode}
      >
        <summary
          class="flex gap-1.5 cursor-pointer text-sm justify-center items-center h-full select-none px-2"
        >
          <Gamepad size="16" />
          {#if emulator}
            {emulators.filter((emu) => emu.id === emulator)[0].title}
          {:else}
            Select Emulator
          {/if}
          <ChevronDown size="16" />
        </summary>
        <div
          class="absolute mt-2.5 bg-card rounded-lg max-h-60 overflow-y-auto border border-input z-10 flex flex-col p-1"
        >
          <button
            onclick={(e) => (emulator = "")}
            class="rounded-md flex items-center px-2 py-1.5 gap-1.5 cursor-pointer hover:bg-secondary text-sm transition-colors"
          >
            <p class="select-none">Clear</p>
          </button>
          {#each emulators as eachEmulator}
            <label
              class="rounded-md flex items-center px-2 py-1.5 gap-1.5 cursor-pointer hover:bg-secondary text-sm transition-colors"
            >
              <div class="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  class="peer w-4 h-4 cursor-pointer appearance-none border border-border checked:bg-primary rounded"
                  value={eachEmulator.id}
                  checked={emulator === eachEmulator.id}
                  onchange={(e) => {
                    emulator = eachEmulator.id;
                  }}
                />
                <Check
                  class="absolute hidden peer-checked:block text-card"
                  size="14"
                />
              </div>
              <p class="select-none">{eachEmulator.title}</p>
            </label>
          {/each}
        </div>
      </details>
    {/if}
    {#if title}
      <Button
        target="_blank"
        class="justify-center"
        href={"https://www.steamgriddb.com/search/grids?term=" + title}
        variant="outline"
      >
        <ExternalLink size="16" />
        <span>SteamGridDB</span>
      </Button>
    {/if}
    <div>
      <Button
        variant="outline"
        class="w-full justify-center"
        onclick={(e) => e.target.nextElementSibling.click()}
      >
        <Upload class="pointer-events-none" size="16" />
        <span class="pointer-events-none">Upload Hero</span>
      </Button>
      <input
        class="hidden"
        type="file"
        accept="image/*"
        onchange={async (e) => {
          const file = e.target.files[0];
          if (file) {
            const heroImage = await formatImage(file, 1400, 448);
            if (heroImage) {
              hero = URL.createObjectURL(heroImage);
            }
          }
        }}
      />
    </div>
    <div>
      <Button
        variant="outline"
        class="w-full justify-center"
        onclick={(e) => e.target.nextElementSibling.click()}
      >
        <Upload class="pointer-events-none" size="16" />
        <span class="pointer-events-none">Upload Cover</span>
      </Button>
      <input
        class="hidden"
        type="file"
        accept="image/*"
        onchange={async (e) => {
          const file = e.target.files[0];
          if (file) {
            const coverImage = await formatImage(file, 432, 648);
            if (coverImage) {
              cover = URL.createObjectURL(coverImage);
            }
          }
        }}
      />
    </div>
    <div>
      <Button
        variant="outline"
        class="w-full justify-center"
        onclick={(e) => e.target.nextElementSibling.click()}
      >
        <Upload class="pointer-events-none" size="16" />
        <span class="pointer-events-none">Upload Icon</span>
      </Button>
      <input
        class="hidden"
        type="file"
        accept="image/*"
        onchange={async (e) => {
          const file = e.target.files[0];
          if (file) {
            const iconImage = await formatImage(file, 80, 80);
            if (iconImage) {
              icon = URL.createObjectURL(iconImage);
            }
          }
        }}
      />
    </div>
    <p class="text-sm">Keyboard Controls</p>
    <div class="flex gap-2">
      <Input
        placeholder="Action"
        bind:value={newActionName}
        onkeydown={(e) => e.key === "Enter" && addAction()}
      />
      <Button
        size="icon"
        variant="outline"
        onclick={addAction}
        disabled={!newActionName.trim()}
        class="shrink-0"
      >
        <Plus size="16" />
      </Button>
    </div>
    {#if controls.length > 0}
      <div class="flex flex-col gap-4">
        {#each controls as actionItem, actionIdx}
          <div
            class="flex flex-col gap-2 bg-secondary border border-input rounded-xl p-2"
          >
            <div class="flex gap-2">
              <Input
                type="text"
                bind:value={actionItem.action}
                class="w-auto"
              />
              <Button
                size="icon"
                variant="outline"
                class="shrink-0"
                onclick={() => removeAction(actionIdx)}
              >
                <Trash size="16" />
              </Button>
            </div>
            <div class="flex flex-col gap-2">
              {#each actionItem.keys as keyItem, keyIdx}
                {@const isListening =
                  activeListeningIndex.actionIdx === actionIdx &&
                  activeListeningIndex.keyIdx === keyIdx}
                <div class="flex gap-2">
                  <Button
                    variant="outline"
                    class="w-full justify-center outline-none"
                    onclick={() => startListening(actionIdx, keyIdx)}
                  >
                    {#if isListening}
                      <span>Waiting for key...</span>
                    {:else}
                      <KenneyKeyboardIcon key={keyItem.key} />
                    {/if}
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    class="shrink-0"
                    onclick={() => removeKey(actionIdx, keyIdx)}
                  >
                    <X size="16" />
                  </Button>
                </div>
              {/each}
              <Button
                class="justify-center outline-none"
                variant="outline"
                onclick={() => addKeySlot(actionIdx)}
              >
                <Plus size="16" />
                <span>Add Key</span>
              </Button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
    <p class="text-sm">Gamepad Controls</p>
    <div class="flex gap-2">
      <Input
        placeholder="Action"
        bind:value={newGamepadActionName}
        onkeydown={(e) => e.key === "Enter" && addGamepadAction()}
      />
      <Button
        size="icon"
        variant="outline"
        onclick={addGamepadAction}
        disabled={!newGamepadActionName.trim()}
        class="shrink-0"
      >
        <Plus size="16" />
      </Button>
    </div>
    {#if gamepadControls.length > 0}
      <div class="flex flex-col gap-4">
        {#each gamepadControls as actionItem, actionIdx}
          <div
            class="flex flex-col gap-2 bg-secondary border border-input rounded-xl p-2"
          >
            <div class="flex gap-2">
              <Input type="text" bind:value={actionItem.action} />
              <Button
                size="icon"
                variant="outline"
                class="shrink-0"
                onclick={() => removeGamepadAction(actionIdx)}
              >
                <Trash size="16" />
              </Button>
            </div>
            {#if actionItem.buttons && actionItem.buttons.length > 0}
              <div class="flex flex-col gap-2">
                {#each actionItem.buttons as btn, btnIdx}
                  <div class="flex gap-2">
                    <Button
                      variant="outline"
                      class="w-full justify-center outline-none"
                    >
                      <KenneyGamepadIcon button={btn} type="xbox" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onclick={() => actionItem.buttons.splice(btnIdx, 1)}
                      class="shrink-0"
                    >
                      <X size="16" />
                    </Button>
                  </div>
                {/each}
              </div>
            {/if}
            {#if actionItem.axes && actionItem.axes.length > 0}
              <div class="flex flex-col gap-2">
                {#each actionItem.axes as axis, axisIdx}
                  <div class="flex gap-2">
                    <Button
                      variant="outline"
                      class="w-full justify-center outline-none"
                    >
                      <KenneyGamepadIcon {axis} type="xbox" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onclick={() => actionItem.axes.splice(axisIdx, 1)}
                      class="shrink-0"
                    >
                      <X size="16" />
                    </Button>
                  </div>
                {/each}
              </div>
            {/if}
            <Button
              variant="outline"
              class="justify-center"
              onclick={() => startGamepadListening(actionIdx)}
            >
              {#if activeGamepadListeningIndex === actionIdx}
                <span>Waiting for input...</span>
              {:else}
                <Plus size="16" />
                <span>Add Bind</span>
              {/if}
            </Button>
          </div>
        {/each}
      </div>
    {/if}
    <p class="text-sm">Controller Support</p>
    <Switch
      aria-label="Controller Support"
      checked={controllerSupport}
      onchange={(e) => (controllerSupport = e.target.checked)}
    />
    <p class="text-sm">JSON Data</p>
    <Textarea readonly value={JSON.stringify(generateData, null, 2)}></Textarea>
    {#if hero && cover && icon}
      <Button variant="outline" onclick={downloadAssets} class="justify-center">
        <Download size="16" />
        <span>Download Image Assets</span>
      </Button>
    {/if}
    <Button variant="outline" onclick={reset} class="justify-center">
      <RefreshCcw size="16" />
      <span>Reset All</span>
    </Button>
  </div>
</div>
<div class="flex flex-col w-full">
  <div class="w-full overflow-auto flex items-start p-4 gap-4">
    <div class="flex flex-col gap-4">
      <div
        class="h-12 w-64 rounded-md text-sm flex items-center justify-between p-2 gap-2 bg-card whitespace-nowrap border border-border"
        data-current="true"
      >
        <div class="flex gap-2 items-center overflow-hidden">
          <div
            class="[background:var(--icon)center/cover_padding-box,var(--color-secondary)] size-8 rounded-sm"
            alt="Icon"
            style={"--icon: url('" + icon + "')"}
          ></div>
          <span class="overflow-hidden text-ellipsis">{title || "Title"}</span>
        </div>
      </div>
      <div
        class="group/card w-full aspect-2/3 bg-cover bg-center flex flex-col relative"
      >
        <div class="h-full w-full rounded-lg border border-input">
          <div
            alt="Cover"
            class="[background:var(--cover)center/cover_padding-box,var(--color-card)] w-full h-full object-cover object-center rounded-lg"
            style={"--cover: url('" + cover + "')"}
          ></div>
        </div>
        <div class="flex">
          <div
            class="text-nowrap overflow-hidden text-ellipsis text-sm cursor-pointer pt-2 pr-2 flex-1"
          >
            {title || "Title"}
          </div>
        </div>
      </div>
    </div>
    <div class="w-full overflow-auto flex flex-col">
      <div class="flex flex-col gap-4 item">
        <div
          style={"--hero: url('" + hero + "')"}
          class="relative [background:linear-gradient(to_bottom,var(--color-overlay)_0%,var(--theme-background)_100%)_padding-box,var(--hero)center/cover_padding-box,var(--color-card)] w-full h-112 flex flex-col items-start justify-between p-4 gap-4 rounded-t-lg border-x border-t border-transparent"
        >
          <div
            class="pointer-events-none absolute -inset-x-px -top-px bottom-0 rounded-t-lg border-x border-t border-background mask-[linear-gradient(to_bottom,transparent_50%,black_100%)]"
          ></div>
          <div
            class="pointer-events-none absolute -inset-x-px -top-px bottom-0 rounded-t-lg border-x border-t border-border mask-[linear-gradient(to_bottom,black_50%,transparent_100%)]"
          ></div>
          <div class="flex flex-wrap gap-2 ml-auto">
            {#each tags as tag}
              <button
                class="h-6 px-2 py-0.5 text-xs rounded-full bg-secondary flex items-center"
              >
                {tag}
              </button>
            {/each}
          </div>
          <div class="w-full">
            <h1 class="text-6xl font-bold mb-4 sm:w-2/3">{title || "Title"}</h1>
            <div class="flex gap-2">
              <div class="flex gap-2">
                <Button class="w-42 justify-center rounded-full cursor-default">
                  <Play size="16" />
                  <span>Play</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Share"
                  class="rounded-full cursor-default"
                >
                  <Share size="16" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Options"
                  class="rounded-full cursor-default"
                >
                  <Ellipsis size="16" />
                </Button>
              </div>
              <div class="flex gap-2 ml-auto overflow-scroll">
                <Button
                  variant="outline"
                  class="whitespace-nowrap cursor-default"
                >
                  <Clock size="16" />
                  <span>Last Played</span>
                </Button>
                <Button
                  variant="outline"
                  class="whitespace-nowrap cursor-default"
                >
                  <ChartPie size="16" />
                  <span>Playtime</span>
                </Button>
                <Button
                  variant="outline"
                  class="whitespace-nowrap cursor-default"
                >
                  <User size="16" />
                  <span>{developer || "Developer"}</span>
                </Button>
                {#if version}
                  <Button
                    variant="outline"
                    class="whitespace-nowrap cursor-default"
                  >
                    <Tag size="16" />
                    <span>{version}</span>
                  </Button>
                {/if}
                {#if controls.length > 0 || gamepadControls.length > 0}
                  <Button
                    variant="outline"
                    class="whitespace-nowrap cursor-default"
                  >
                    {#if controls.length > 0}
                      <Keyboard size="16" />
                    {/if}
                    {#if gamepadControls.length > 0}
                      <Gamepad2 size="16" />
                    {/if}
                    {#if controls.length > 0}
                      <span>Keyboard</span>
                    {/if}
                    {#if controls.length > 0 && gamepadControls.length > 0}
                      <span> + </span>
                    {/if}
                    {#if gamepadControls.length > 0}
                      <span>Controller</span>
                    {/if}
                  </Button>
                {/if}
                {#if emulator}
                  <Button
                    variant="outline"
                    class="whitespace-nowrap cursor-default"
                  >
                    <Gamepad size="16" />
                    <span
                      >{emulators.filter((emu) => emu.id === emulator)[0]
                        .title}</span
                    >
                  </Button>
                {/if}
              </div>
            </div>
          </div>
        </div>
        <div class="w-2/3 ml-4">
          <p>{description || "Description"}</p>
        </div>
      </div>
    </div>
  </div>
  <Footer />
</div>
