<script>
  import Footer from "$lib/components/Footer.svelte";
  import Head from "$lib/components/Head.svelte";
  import Navbar from "$lib/components/Navbar.svelte";
  import { keyIcon } from "$lib/keyIcon";
  import { storage } from "$lib/storage.svelte";
  import {
    ChartPie,
    Check,
    ChevronDown,
    Clock,
    Download,
    Ellipsis,
    Play,
    Plus,
    RefreshCcw,
    Share,
    Sparkles,
    Tag,
    Trash,
    Upload,
    User,
    X,
  } from "@lucide/svelte";
  import JSZip from "jszip";
  import { onMount } from "svelte";

  let title = $state("");
  let developer = $state("");
  let description = $state("");
  let id = $state("");
  let version = $state("");
  let tags = $state([]);
  let hero = $state("");
  let cover = $state("");
  let icon = $state("");
  let type = $state("HTML");
  let path = $state("");
  let rom = $state("");
  let controls = $state([]);
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
    link.download = `${title} Assets.zip`;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(zipUrl);
  }

  function generateID() {
    id = self.crypto.randomUUID();
  }

  let tagsNode;
  let typeNode;

  function handleClickOutside(event) {
    if (tagsNode && !tagsNode.contains(event.target)) {
      tagsNode.removeAttribute("open");
    }
    if (typeNode && !typeNode.contains(event.target)) {
      typeNode.removeAttribute("open");
    }
  }

  let isComplete = $state();

  $effect(() => {
    if (
      !title ||
      !description ||
      !developer ||
      !id ||
      !hero ||
      !cover ||
      !icon ||
      tags.length === 0
    ) {
      isComplete = false;
      return;
    }

    switch (type) {
      case "HTML":
        if (!path) {
          isComplete = false;
          return;
        }
        break;
      case "Emulation":
        if (!rom) {
          isComplete = false;
          return;
        }
        break;
    }

    isComplete = true;
  });

  let generateData = $derived.by(() => {
    let data = {
      title,
      developer,
      description,
      id,
      type,
      controls,
      controllerSupport,
      tags: [...tags],
    };

    if (version) {
      data.version = version;
    } else {
      data.internalVersion = "1";
    }

    switch (type) {
      case "HTML":
        data.path = path;
        break;
      case "Emulation":
        data.rom = rom;
        break;
    }

    return data;
  });

  let availabilityPromise = $state(Promise.resolve("no"));
  let isGenerating = $state(false);

  onMount(() => {
    if (window?.LanguageModel) {
      availabilityPromise = window.LanguageModel.availability();
    }
  });

  const tagSchema = {
    type: "array",
    items: {
      type: "string",
    },
  };

  async function generateTags() {
    if (isGenerating) return;
    isGenerating = true;

    const session = await LanguageModel.create({
      initialPrompts: [
        {
          role: "system",
          content: `You are a video game categorization assistant generating tags for an online storefront.  You will be given a game's title, developer, and description.  Your job is to select between 4 to 6 relevant tags from the allowed tags list. Tags: ${[...storage.tags].join(", ")}`,
        },
      ],
      monitor(m) {
        m.addEventListener("downloadprogress", (e) => {
          console.log(`Downloaded ${e.loaded * 100}%`);
        });
      },
    });

    const rawResponse = await session.prompt(
      `Title: ${title}, Developer: ${developer}, Description: ${description}`,
      {
        responseConstraint: tagSchema,
      },
    );

    try {
      const parsedTags = JSON.parse(rawResponse.trim()).filter((tag) =>
        storage.tags.includes(tag),
      );
      tags = parsedTags;
    } catch (e) {
      console.error(e);
    }

    isGenerating = false;
  }

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

  function handleKeyDown(e) {
    e.preventDefault();

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
    title = "";
    developer = "";
    description = "";
    id = "";
    version = "";
    tags = [];
    hero = "";
    cover = "";
    icon = "";
    type = "HTML";
    path = "";
    rom = "";
    controls = [];
    controllerSupport = false;
  }
</script>

<svelte:window onclick={handleClickOutside} />

<Head title="Creator" />

<div
  class="group bg-secondary h-[calc(100%-2rem)] w-64 flex flex-col gap-4 p-4 overflow-y-scroll m-4 mr-0 rounded-2xl border border-surface shrink-0"
>
  <div>
    <p>Creator</p>
    <p class="text-sm text-text-placeholder">Automate the creation process</p>
  </div>
  <div
    class="h-14 w-full rounded-2xl text-sm flex items-center justify-between p-2 gap-2 bg-surface whitespace-nowrap border border-border"
  >
    <div class="flex gap-2 items-center overflow-hidden">
      {#if icon}
        <img
          draggable="false"
          alt={title || "Title"}
          class="h-10 w-10 rounded-xl"
          src={icon}
        />
      {:else}
        <div class="h-10 w-10 rounded-xl border border-border"></div>
      {/if}
      <span
        class="group-data-[style=hidden]:opacity-0 group-data-[style=compact]:opacity-0 transition-opacity overflow-hidden text-ellipsis"
        >{title || "Title"}</span
      >
    </div>
  </div>
  <div
    class="focus-within:bg-surface bg-secondary rounded-xl items-center flex border border-border"
  >
    <input
      bind:value={title}
      placeholder="Title"
      class="h-9 w-full px-4 bg-transparent outline-none placeholder:text-text-placeholder"
    />
    {#if title.length > 0}
      <button
        class="mr-3 cursor-pointer shrink-0 text-text-placeholder"
        onclick={() => (title = "")}
      >
        <X size="20" />
      </button>
    {/if}
  </div>
  <div
    class="focus-within:bg-surface bg-secondary rounded-xl items-center flex border border-border"
  >
    <input
      bind:value={developer}
      placeholder="Developer"
      class="h-9 w-full px-4 bg-transparent outline-none placeholder:text-text-placeholder"
    />
    {#if developer.length > 0}
      <button
        class="mr-3 cursor-pointer shrink-0 text-text-placeholder"
        onclick={() => (developer = "")}
      >
        <X size="20" />
      </button>
    {/if}
  </div>
  <textarea
    bind:value={description}
    placeholder="Description"
    class="focus-within:bg-surface bg-secondary rounded-xl items-center flex border border-border h-48 w-full px-4 outline-none placeholder:text-text-placeholder py-2 resize-none shrink-0"
  ></textarea>
  <div class="flex gap-2">
    <div
      class="focus-within:bg-surface bg-secondary rounded-xl items-center flex border border-border"
    >
      <input
        bind:value={id}
        placeholder="ID"
        class="h-9 w-full px-4 bg-transparent outline-none placeholder:text-text-placeholder"
      />
      {#if id.length > 0}
        <button
          class="mr-3 cursor-pointer shrink-0 text-text-placeholder"
          onclick={() => (id = "")}
        >
          <X size="20" />
        </button>
      {/if}
    </div>
    <button
      onclick={generateID}
      class="px-4 py-2 bg-surface rounded-xl flex gap-2 items-center border border-border cursor-pointer text-sm"
      >Gen</button
    >
  </div>
  <div
    class="focus-within:bg-surface bg-secondary rounded-xl items-center flex border border-border"
  >
    <input
      bind:value={version}
      placeholder="Version (Optional)"
      class="h-9 w-full px-4 bg-transparent outline-none placeholder:text-text-placeholder"
    />
    {#if version.length > 0}
      <button
        class="mr-3 cursor-pointer shrink-0 text-text-placeholder"
        onclick={() => (version = "")}
      >
        <X size="20" />
      </button>
    {/if}
  </div>
  <details
    class="relative bg-surface rounded-xl border border-border"
    bind:this={tagsNode}
  >
    <summary
      class="rounded-xl flex px-4 py-2 cursor-pointer text-sm justify-between"
    >
      <span class="mr-2 select-none">
        {#if tags.length === 0}
          Select Tags
        {:else}
          {tags.length > 1 ? tags.length + " Tags" : tags[0]}
        {/if}
      </span>
      <ChevronDown size="20" />
    </summary>
    <div
      class="absolute mt-2 min-w-full w-max bg-secondary rounded-xl max-h-60 overflow-y-auto border border-surface scrollbar z-10"
    >
      <label
        class="flex items-center px-4 py-2 gap-2 cursor-pointer hover:bg-surface text-sm transition-colors"
      >
        <button
          class="select-none"
          onclick={(e) => {
            tags = [];
          }}
        >
          None</button
        >
      </label>
      {#each storage.tags as tag}
        <label
          class="flex items-center px-4 py-2 gap-2 cursor-pointer hover:bg-surface text-sm transition-colors"
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
              class="absolute hidden peer-checked:block text-text-inverse"
              size="14"
            />
          </div>
          <p class="select-none">{tag}</p>
        </label>
      {/each}
    </div>
  </details>
  {#await availabilityPromise then result}
    {#if result === "downloadable" || result === "downloading" || result === "available"}
      {#if title && developer && description}
        <button
          disabled={isGenerating}
          onclick={generateTags}
          class={"px-4 py-2 bg-surface rounded-xl flex gap-2 items-center border border-border text-sm" +
            (isGenerating ? " text-text-placeholder" : " cursor-pointer")}
        >
          <Sparkles size="20" />
          {#if isGenerating}
            <span>Generating Tags...</span>
          {:else}
            <span>Generate Tags</span>
          {/if}
        </button>
      {/if}
    {/if}
  {/await}
  <details
    class="relative bg-surface rounded-xl border border-border"
    bind:this={typeNode}
  >
    <summary
      class="rounded-xl flex px-4 py-2 cursor-pointer text-sm justify-between items-center h-full"
    >
      <span class="mr-2 select-none truncate">
        {type}
      </span>
      <ChevronDown size="20" class="shrink-0" />
    </summary>
    <div
      class="absolute mt-2 min-w-full w-max bg-secondary rounded-xl max-h-60 overflow-y-auto border border-surface scrollbar z-10 flex flex-col"
    >
      <button
        class="flex items-center px-4 py-2 gap-2 cursor-pointer hover:bg-surface text-sm transition-colors"
        onclick={(e) => {
          type = "HTML";
          e.currentTarget.closest("details").removeAttribute("open");
        }}
      >
        HTML
      </button>
      <button
        class="flex items-center px-4 py-2 gap-2 cursor-pointer hover:bg-surface text-sm transition-colors"
        onclick={(e) => {
          type = "Flash";
          e.currentTarget.closest("details").removeAttribute("open");
        }}
      >
        Flash
      </button>
      <button
        class="flex items-center px-4 py-2 gap-2 cursor-pointer hover:bg-surface text-sm transition-colors"
        onclick={(e) => {
          type = "Emulation";
          e.currentTarget.closest("details").removeAttribute("open");
        }}
      >
        Emulation
      </button>
    </div>
  </details>
  {#if type === "HTML"}
    <div
      class="focus-within:bg-surface bg-secondary rounded-xl items-center flex border border-border"
    >
      <input
        bind:value={path}
        placeholder="Path (/file.html)"
        class="h-9 w-full px-4 bg-transparent outline-none placeholder:text-text-placeholder"
      />
      {#if path.length > 0}
        <button
          class="mr-3 cursor-pointer shrink-0 text-text-placeholder"
          onclick={() => (path = "")}
        >
          <X size="20" />
        </button>
      {/if}
    </div>
  {:else if type === "Emulation"}
    <div
      class="focus-within:bg-surface bg-secondary rounded-xl items-center flex border border-border"
    >
      <input
        bind:value={rom}
        placeholder="Rom (/file.rom)"
        class="h-9 w-full px-4 bg-transparent outline-none placeholder:text-text-placeholder"
      />
      {#if rom.length > 0}
        <button
          class="mr-3 cursor-pointer shrink-0 text-text-placeholder"
          onclick={() => (rom = "")}
        >
          <X size="20" />
        </button>
      {/if}
    </div>
  {/if}
  <label
    class="px-4 py-2 bg-surface rounded-xl flex gap-2 items-center border border-border cursor-pointer text-sm"
  >
    <Upload size="20" />
    <span>Upload Hero Image</span>
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
  </label>
  <label
    class="px-4 py-2 bg-surface rounded-xl flex gap-2 items-center border border-border cursor-pointer text-sm"
  >
    <Upload size="20" />
    <span>Upload Cover Image</span>
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
  </label>
  <label
    class="px-4 py-2 bg-surface rounded-xl flex gap-2 items-center border border-border cursor-pointer text-sm"
  >
    <Upload size="20" />
    <span>Upload Icon Image</span>
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
  </label>
  <p>Controls</p>
  <div class="flex gap-2">
    <input
      class="h-9 w-full px-4 focus-within:bg-surface bg-secondary rounded-xl placeholder:text-text-placeholder border border-border outline-none"
      placeholder="Action"
      bind:value={newActionName}
      onkeydown={(e) => e.key === "Enter" && addAction()}
    />
    <button
      class="px-4 py-2 bg-surface rounded-xl flex gap-2 items-center border border-border cursor-pointer text-sm"
      onclick={addAction}
      disabled={!newActionName.trim()}>Add</button
    >
  </div>
  {#if controls.length > 0}
    <div class="flex flex-col gap-4">
      {#each controls as actionItem, actionIdx}
        <div class="flex flex-col gap-2 border border-border rounded-2xl p-2">
          <div class="flex gap-2">
            <input
              type="text"
              bind:value={actionItem.action}
              class="h-9 w-full px-4 focus-within:bg-surface bg-secondary rounded-xl placeholder:text-text-placeholder border border-border outline-none"
            />
            <button
              class="px-4 py-2 bg-surface rounded-xl flex gap-2 items-center border border-border cursor-pointer text-sm"
              onclick={() => removeAction(actionIdx)}
            >
              <Trash size="20" />
            </button>
          </div>
          <div class="flex flex-col gap-2">
            {#each actionItem.keys as keyItem, keyIdx}
              {@const isListening =
                activeListeningIndex.actionIdx === actionIdx &&
                activeListeningIndex.keyIdx === keyIdx}
              <div class="flex gap-2">
                <button
                  class="outline-none px-4 py-2 text-sm cursor-pointer rounded-xl whitespace-nowrap bg-surface border border-border w-full flex justify-center"
                  class:listening={isListening}
                  onclick={() => startListening(actionIdx, keyIdx)}
                >
                  {#if isListening}
                    <span>Waiting for key...</span>
                  {:else}
                    <div
                      class="flex items-center justify-center px-1.5 text-xs rounded-md bg-primary border border-border-primary text-text-inverse"
                    >
                      {keyIcon(keyItem.key)}
                    </div>
                  {/if}
                </button>
                <button
                  class="px-4 py-2 bg-surface rounded-xl flex gap-2 items-center border border-border cursor-pointer text-sm"
                  onclick={() => removeKey(actionIdx, keyIdx)}
                >
                  <X size="20" />
                </button>
              </div>
            {/each}

            <button
              class="px-4 py-2 bg-surface rounded-xl flex gap-2 items-center border border-border cursor-pointer text-sm outline-none"
              onclick={() => addKeySlot(actionIdx)}
            >
              <Plus size="20" />
              <span>Add Key</span>
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
  <p>Controller Support</p>
  <input
    aria-label="Controller Support"
    checked={controllerSupport}
    onchange={(e) => (controllerSupport = e.target.checked)}
    class="shrink-0 appearance-none cursor-pointer transition-colors bg-secondary checked:bg-surface border border-border w-11 h-6 rounded-full flex items-center px-0.5 before:content-[''] before:h-4 before:w-4 before:rounded-full before:border before:border-border checked:before:border-border-primary before:bg-surface checked:before:bg-primary before:block checked:before:translate-x-5.5 before:transition-[translate,background,border]"
    type="checkbox"
  />

  {#if isComplete}
    <textarea
      class="bg-surface rounded-xl items-center flex border border-border h-96 w-full px-4 outline-none placeholder:text-text-placeholder py-2 resize-none shrink-0"
      readonly
      value={JSON.stringify(generateData, null, 2)}
    ></textarea>
    <button
      onclick={downloadAssets}
      class="px-4 py-2 bg-surface rounded-xl flex gap-2 items-center border border-border cursor-pointer text-sm"
    >
      <Download size="20" />
      <span>Download Assets</span>
    </button>
  {/if}
  <button
    onclick={reset}
    class="px-4 py-2 bg-surface rounded-xl flex gap-2 items-center border border-border cursor-pointer text-sm"
  >
    <RefreshCcw size="20" />
    <span>Reset All</span>
  </button>
</div>
<div class="w-full overflow-auto flex flex-col scrollbar">
  <Navbar />
  <div class="p-4 pt-0 flex flex-col gap-4 item">
    <div
      style={"--hero: url('" + hero + "')"}
      class="relative [background:linear-gradient(to_bottom,var(--color-overlay)_0%,var(--theme-background)_100%)_padding-box,var(--hero)center/cover_padding-box,var(--color-surface)] w-full h-112 flex flex-col items-start justify-between p-8 pb-4 gap-4 rounded-t-2xl border-x border-t border-transparent"
    >
      <div
        class="pointer-events-none absolute -inset-x-px -top-px bottom-0 rounded-t-2xl border-x border-t border-background mask-[linear-gradient(to_bottom,transparent_50%,black_100%)]"
      ></div>
      <div
        class="pointer-events-none absolute -inset-x-px -top-px bottom-0 rounded-t-2xl border-x border-t border-border mask-[linear-gradient(to_bottom,black_50%,transparent_100%)]"
      ></div>
      <div class="flex flex-wrap gap-4 ml-auto">
        {#each tags as tag}
          <div
            class="px-4 py-1 text-sm rounded-full bg-surface border border-border flex items-center"
          >
            {tag}
          </div>
        {/each}
      </div>
      <div class="w-full">
        <h1 class="text-6xl font-bold mb-4 sm:w-2/3">
          {title || "Title"}
        </h1>
        <div class="flex gap-2 flex-col min-[1192px]:flex-row">
          <div class="flex gap-2">
            <div
              class="bg-primary px-14 py-2 rounded-full flex gap-2 items-center text-text-inverse border border-border-primary"
            >
              <Play size="20" />
              <span>Play</span>
            </div>
            <div
              class="bg-surface h-10 w-10 rounded-full flex items-center justify-center border border-border"
            >
              <Share size="20" />
            </div>
            <div
              class="bg-surface h-10 w-10 rounded-full flex items-center justify-center border border-border"
            >
              <Ellipsis size="20" />
            </div>
          </div>
          <div
            class="flex flex-wrap gap-4 min-[1192px]:ml-auto mt-2 min-[1192px]:mt-0"
          >
            <div
              class="flex items-center bg-surface rounded-xl px-4 py-2 gap-2 text-sm border border-border"
            >
              <Clock size="20" />
              <span>Last Played</span>
            </div>
            <div
              class="flex items-center bg-surface rounded-xl px-4 py-2 gap-2 text-sm border border-border"
            >
              <ChartPie size="20" />
              <span>Play Time</span>
            </div>
            <div
              class="flex items-center bg-surface rounded-xl px-4 py-2 gap-2 text-sm border border-border"
            >
              <User size="20" />
              <span>{developer || "Developer"}</span>
            </div>
            {#if version}
              <div
                class="flex items-center bg-surface rounded-xl px-4 py-2 gap-2 text-sm border border-border"
              >
                <Tag size="20" />
                <span>{version}</span>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
    <div class="sm:w-2/3 ml-8">
      <p>{description || "Description"}</p>
    </div>
  </div>
  <div
    class="p-4 pt-0 grid grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-4"
  >
    <div
      style={"--cover: url('" + cover + "')"}
      data-cards-style={storage.settings.cards}
      class="ml-8 outline-none group w-full data-[cards-style=default]:aspect-2/3 data-[cards-style=square]:aspect-square bg-cover bg-center flex flex-col gap-4"
    >
      <div
        class="group-data-[cards-style=default]:[background:var(--cover)center/cover_padding-box,var(--color-surface)] group-data-[cards-style=square]:[background:var(--cover)top/cover_padding-box,var(--color-surface)] w-full h-full rounded-2xl border border-border"
      ></div>
    </div>
  </div>
  <Footer />
</div>
