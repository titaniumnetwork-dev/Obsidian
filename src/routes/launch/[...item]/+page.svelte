<script>
  import { goto } from "$app/navigation";
  import Head from "$lib/components/Head.svelte";
  import { keyIcon } from "$lib/keyIcon.js";
  import { storage } from "$lib/storage.svelte.js";
  import {
    ChevronDown,
    ChevronRight,
    Disc,
    Download,
    FolderOpen,
    Gamepad,
    Keyboard,
    Maximize,
    RotateCw,
    Save,
    Video,
    X,
  } from "@lucide/svelte";
  import { untrack } from "svelte";

  let { data } = $props();

  let frame = $state(null);

  let framePath = $derived.by(() => {
    switch (data.currentData.type) {
      case "HTML":
        return (
          "/cdn/html/" +
          data.currentData.id +
          "/" +
          (data.currentData.version || data.currentData.internalVersion) +
          data.currentData.path
        );
      case "Flash":
        return (
          "/flash/cdn/flash/" +
          data.currentData.id +
          "/" +
          (data.currentData.version || data.currentData.internalVersion) +
          "/" +
          data.currentData.id +
          ".swf"
        );
      case "Emulation":
        return (
          "/emulation.html?rom=/cdn/emulation/" +
          data.currentData.id +
          "/" +
          (data.currentData.version || data.currentData.internalVersion) +
          data.currentData.rom
        );
      default:
        return "";
    }
  });

  untrack(() => {
    if (data && !storage.installed.includes(data.currentData.id)) {
      goto("/store/" + data.currentData.id, {
        replaceState: true,
      });
    }
  });

  let controlsMenu = $state();
  let emulationMenu = $state();
  let recordingMenu = $state();
  let shaderNode = $state();
  let binding = $state({});
  let shader = $state();

  $effect(() => {
    if (data.currentData.type === "Emulation") {
      //Very hacky solution but it should hold up
      try {
        let emulationSettings = Object.entries(localStorage).filter((entry) =>
          entry[0].endsWith(
            `${data.currentData.rom.split(".").shift()}-settings`,
          ),
        )[0];
        if (emulationSettings) {
          shader =
            JSON.parse(emulationSettings[1]).settings.shader || "disabled";
        } else {
          shader = "disabled";
        }
      } catch (e) {
        console.log(e);
      }
    }
  });

  const keybinds = $derived(storage.keybinds[data.currentData.id] || {});

  function handleKeydown(e) {
    if (!binding.key || !keybinds) return;

    e.preventDefault();
    e.stopPropagation();

    if (e.code === "Escape" || e.code === binding.key) {
      storage.removeKeybind(data.currentData.id, binding.key);
      binding = {};
      return;
    }

    storage.updateKeybind(
      data.currentData.id,
      binding.key,
      binding.keyCode,
      e.code,
    );
    binding = {};
  }

  function handleClickOutside(event) {
    if (shaderNode && !shaderNode.contains(event.target)) {
      shaderNode.removeAttribute("open");
    }
  }

  function frameLoaded(e) {
    frame.contentWindow.addEventListener("click", () => {
      if (controlsMenu) {
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();
        controlsMenu.hidePopover();
      }
      if (recordingMenu) {
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();
        recordingMenu.hidePopover();
      }
      if (emulationMenu) {
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();
        emulationMenu.hidePopover();
      }
    });

    function interceptKeybinds(e, eventType) {
      if (!e.isTrusted) return;

      const targetAction = Object.keys(keybinds).find(
        (action) => keybinds[action].key === e.code,
      );

      if (targetAction) {
        const targetKeyCode = keybinds[targetAction].keyCode;

        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();

        const fakeEvent = new KeyboardEvent(eventType, {
          bubbles: true,
          cancelable: true,
          composed: true,
          key: targetAction,
          code: targetKeyCode,
        });

        Object.defineProperty(fakeEvent, "keyCode", {
          get: () => targetKeyCode,
        });
        Object.defineProperty(fakeEvent, "which", {
          get: () => targetKeyCode,
        });

        const canvas = frame.contentWindow.document.querySelector("canvas");

        if (canvas) {
          canvas.dispatchEvent(fakeEvent);
        } else {
          frame.contentWindow.document.dispatchEvent(fakeEvent);
        }
      }
    }

    frame.contentWindow.addEventListener("keydown", (e) =>
      interceptKeybinds(e, "keydown"),
    );
    frame.contentWindow.addEventListener("keyup", (e) =>
      interceptKeybinds(e, "keyup"),
    );
  }

  const aspectRatio = $derived(
    storage.settings.aspect ? storage.settings.aspect : "h-full w-full",
  );

  let mediaRecorder = $state(null);
  let videoBlob = $state(null);
  let recordedChunks = [];
  let fileExtension = $state("webm");
  let hiddenVideoElement = null;

  function generateFilename() {
    const now = new Date();
    const fmt = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
      .formatToParts(now)
      .reduce((acc, { type, value }) => ({ ...acc, [type]: value }), {});

    return `Screen Recording ${fmt.year}-${fmt.month}-${fmt.day} at ${fmt.hour}-${fmt.minute} ${fmt.dayPeriod}`;
  }

  function getSupportedMimeType() {
    if (MediaRecorder.isTypeSupported("video/webm; codecs=vp9"))
      return "video/webm; codecs=vp9";
    if (MediaRecorder.isTypeSupported("video/webm")) return "video/webm";
    if (MediaRecorder.isTypeSupported("video/mp4")) return "video/mp4";
    return "";
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "browser" },
        audio: true,
        preferCurrentTab: true,
      });

      //Fix safari
      hiddenVideoElement = document.createElement("video");
      hiddenVideoElement.style.position = "fixed";
      hiddenVideoElement.style.top = "0";
      hiddenVideoElement.style.left = "0";
      hiddenVideoElement.style.width = "1px";
      hiddenVideoElement.style.height = "1px";
      hiddenVideoElement.style.opacity = "0";
      hiddenVideoElement.style.pointerEvents = "none";
      hiddenVideoElement.muted = true;
      hiddenVideoElement.playsInline = true;
      hiddenVideoElement.autoplay = true;
      hiddenVideoElement.srcObject = stream;
      document.body.appendChild(hiddenVideoElement);

      await new Promise((resolve) => setTimeout(resolve, 500));

      const [videoTrack] = stream.getVideoTracks();

      if ("RestrictionTarget" in window) {
        const restrictionTarget = await RestrictionTarget.fromElement(frame);
        await videoTrack.restrictTo(restrictionTarget);
      }

      const mimeType = getSupportedMimeType();
      const options = mimeType ? { mimeType } : undefined;
      const recorder = new MediaRecorder(stream, options);

      const actualMimeType = recorder.mimeType || "video/mp4";
      fileExtension = actualMimeType.includes("webm") ? "webm" : "mp4";

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.push(e.data);
      };

      recorder.onstop = () => {
        videoBlob = new Blob(recordedChunks, { type: actualMimeType });

        recordedChunks = [];
        mediaRecorder = null;
        stream.getTracks().forEach((track) => track.stop());

        if (hiddenVideoElement) {
          hiddenVideoElement.pause();
          hiddenVideoElement.srcObject = null;
          hiddenVideoElement.remove();
          hiddenVideoElement = null;
        }

        recordingMenu.showPopover();
      };

      recorder.start();

      mediaRecorder = recorder;
      videoBlob = null;
    } catch (err) {
      console.error("Recording failed:", err);
    }
  }

  async function downloadVideo() {
    if (!videoBlob) return;

    const filename = `${generateFilename()}.${fileExtension}`;

    const fallbackDownload = () => {
      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = filename;

      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    };

    if ("showSaveFilePicker" in window) {
      try {
        const mimeKey = fileExtension === "mp4" ? "video/mp4" : "video/webm";

        const fileHandle = await window.showSaveFilePicker({
          startIn: "downloads",
          suggestedName: filename,
          types: [
            {
              accept: { [mimeKey]: [`.${fileExtension}`] },
            },
          ],
        });

        const writableStream = await fileHandle.createWritable();
        await writableStream.write(videoBlob);
        await writableStream.close();
      } catch (err) {
        if (err.name === "AbortError") {
          console.log("Download cancelled by user");
        } else {
          console.error("File Picker failed, using fallback. Error:", err);
          fallbackDownload();
        }
      }
    } else {
      fallbackDownload();
    }
  }

  function emulationLoadSave() {
    const EJS_emulator = frame.contentWindow?.EJS_emulator;
    if (EJS_emulator) {
      EJS_emulator.storage.states
        .get(EJS_emulator.getBaseFileName() + ".state")
        .then((t) => {
          (EJS_emulator.gameManager.loadState(t),
            EJS_emulator.displayMessage(
              EJS_emulator.localization("Save loaded"),
            ));
        });
    }
  }

  function emulationSave() {
    const EJS_emulator = frame.contentWindow?.EJS_emulator;

    if (EJS_emulator) {
      (EJS_emulator.storage.states.put(
        EJS_emulator.getBaseFileName() + ".state",
        EJS_emulator.gameManager.getState(),
      ),
        EJS_emulator.displayMessage(EJS_emulator.localization("Saved")));
    }
  }

  function emulationShader(newShader = "disabled") {
    const EJS_emulator = frame.contentWindow?.EJS_emulator;

    if (EJS_emulator) {
      EJS_emulator.changeSettingOption("shader", newShader);
    }

    shader = newShader;
  }
</script>

<Head
  title={data.currentData.title}
  icon={'/cdn/assets/" + data.currentData.id + "/icon.webp'}
/>

<svelte:window onclick={handleClickOutside} onkeydown={handleKeydown} />

<div
  class="bg-background fixed top-0 right-0 left-0 flex gap-4 p-4 z-10 justify-between items-center border-b border-surface"
>
  <div class="flex items-center gap-4">
    <img
      draggable="false"
      class="h-10 w-10 rounded-xl"
      src={"/cdn/assets/" + data.currentData.id + "/icon.webp"}
      alt={data.currentData.title}
    />
    <p>{data.currentData.title}</p>
  </div>
  <div class="flex items-center gap-4">
    {#if data.currentData.type === "Emulation"}
      <button
        popovertarget="emulation"
        class="[anchor-name:--emulation-button] px-4 py-2 text-sm bg-surface border border-border rounded-xl flex gap-2 cursor-pointer"
      >
        <Gamepad size="20" />
        <span>Emulation</span>
      </button>
      <div
        popover="auto"
        id="emulation"
        bind:this={emulationMenu}
        class="[&:popover-open]:flex flex-col bg-secondary rounded-xl text-text [position-anchor:--emulation-button]
              top-[calc(anchor(bottom)+0.5rem)] left-[calc(anchor(left))] z-20 p-4 gap-4 overflow-visible border border-surface"
      >
        <button
          onclick={() => {
            emulationMenu.hidePopover();
            emulationSave();
          }}
          class="px-4 py-2 cursor-pointer text-sm bg-surface border border-border rounded-xl flex gap-2 items-center"
        >
          <Save size="20" />
          <span>Save</span>
        </button>
        <button
          onclick={() => {
            emulationMenu.hidePopover();
            emulationLoadSave();
          }}
          class="px-4 py-2 cursor-pointer text-sm bg-surface border border-border rounded-xl flex gap-2 items-center"
        >
          <FolderOpen size="20" />
          <span>Load Save</span>
        </button>
        <details
          class="relative bg-surface rounded-xl border border-border"
          bind:this={shaderNode}
        >
          <summary
            class="rounded-xl flex px-4 py-2 cursor-pointer text-sm justify-between items-center h-full"
          >
            <span class="mr-2 select-none truncate">
              {#if shader === "disabled"}
                No Shader
              {:else if shader === "4xScaleHQ.glslp"}
                Smooth
              {:else if shader === "crt-aperture.glslp"}
                CRT
              {:else if shader === "crt-geom.glslp"}
                CRT TV
              {/if}
            </span>
            <ChevronDown size="20" class="shrink-0" />
          </summary>
          <div
            class="absolute mt-2 min-w-full w-max bg-secondary rounded-xl max-h-60 overflow-y-auto border border-surface scrollbar z-10 flex flex-col"
          >
            <button
              class="flex items-center px-4 py-2 gap-2 cursor-pointer hover:bg-surface text-sm transition-colors"
              onclick={(e) => {
                emulationShader("disabled");
                e.currentTarget.closest("details").removeAttribute("open");
              }}
            >
              No Shader
            </button>
            <button
              class="flex items-center px-4 py-2 gap-2 cursor-pointer hover:bg-surface text-sm transition-colors"
              onclick={(e) => {
                emulationShader("4xScaleHQ.glslp");
                e.currentTarget.closest("details").removeAttribute("open");
              }}
            >
              Smooth
            </button>
            <button
              class="flex items-center px-4 py-2 gap-2 cursor-pointer hover:bg-surface text-sm transition-colors"
              onclick={(e) => {
                emulationShader("crt-aperture.glslp");
                e.currentTarget.closest("details").removeAttribute("open");
              }}
            >
              CRT
            </button>
            <button
              class="flex items-center px-4 py-2 gap-2 cursor-pointer hover:bg-surface text-sm transition-colors"
              onclick={(e) => {
                emulationShader("crt-geom.glslp");
                e.currentTarget.closest("details").removeAttribute("open");
              }}
            >
              CRT TV
            </button>
          </div>
        </details>
      </div>
    {/if}
    {#if data.currentData.controls.length > 0}
      <button
        popovertarget="controls"
        class="[anchor-name:--controls-button] px-4 py-2 cursor-pointer text-sm bg-surface border border-border rounded-xl flex gap-2"
      >
        <Keyboard size="20" />
        <span>Controls</span>
      </button>
      <div
        onbeforetoggle={(e) => {
          if (e.newState === "closed") {
            binding = {};
          }
        }}
        popover="auto"
        id="controls"
        bind:this={controlsMenu}
        class={"[&:popover-open]:flex flex-col bg-secondary rounded-xl text-text [position-anchor:--controls-button] top-[calc(anchor(bottom)+0.5rem)] left-[calc(anchor(left))] z-20 p-4 w-72 border border-surface" +
          (binding.key ? " min-h-26" : "")}
      >
        {#if binding.key}
          <div
            class="bg-secondary h-full w-full absolute top-0 bottom-0 right-0 left-0 flex flex-col justify-center items-center gap-2"
          >
            <div class="flex gap-2 items-center">
              <button
                class="px-4 py-2 cursor-pointer text-sm bg-surface border border-border rounded-xl"
              >
                <span>{keyIcon(binding.key)}</span>
              </button>
              <ChevronRight size="20" />
              <button
                aria-label="New keybind"
                class="px-4 py-2 cursor-pointer text-sm bg-surface border border-border rounded-xl"
              >
                <div class="text-surface select-none">
                  {keyIcon(binding.key)}
                </div>
              </button>
            </div>
            <p class="text-sm text-text-placeholder">Press Esc to reset</p>
          </div>
        {/if}
        {#each data.currentData.controls as control}
          <div class="flex gap-2">
            {control.action}: {#each control.keys as keys}
              {#if keybinds[keys.key]}
                <button
                  onclick={() =>
                    (binding = { key: keys.key, keyCode: keys.keyCode })}
                  class="flex items-center justify-center my-0.5 text-xs rounded-md cursor-pointer outline-none bg-surface border border-border overflow-hidden"
                >
                  <div class="px-1.5 py-0.5 bg-primary text-text-inverse">
                    {keyIcon(keybinds[keys.key].key)}
                  </div>
                  <div class="px-1.5 py-0.5">{keyIcon(keys.key)}</div>
                </button>
              {:else}
                <button
                  onclick={() =>
                    (binding = { key: keys.key, keyCode: keys.keyCode })}
                  class="flex items-center justify-center px-1.5 py-0.5 my-0.5 text-xs rounded-md cursor-pointer outline-none bg-surface border border-border"
                  >{keyIcon(keys.key)}</button
                >
              {/if}
            {/each}
          </div>
        {/each}
      </div>
    {/if}
    <button
      onclick={() => frame.requestFullscreen()}
      class="px-4 py-2 cursor-pointer text-sm bg-surface border border-border rounded-xl flex gap-2"
    >
      <Maximize size="20" />
      <span>Fullscreen</span>
    </button>
    <button
      popovertarget="recording"
      class="[anchor-name:--recording-button] px-4 py-2 cursor-pointer text-sm bg-surface border border-border rounded-xl flex gap-2"
    >
      <Video size="20" />
      <span>Record</span>
    </button>
    <div
      popover="auto"
      id="recording"
      bind:this={recordingMenu}
      class="[&:popover-open]:flex flex-col bg-secondary rounded-xl text-text [position-anchor:--recording-button]
              top-[calc(anchor(bottom)+0.5rem)] left-[calc(anchor(left))] z-20 p-4 gap-4 border border-surface"
    >
      {#if videoBlob}
        <button
          onclick={() => {
            recordingMenu.hidePopover();
            downloadVideo();
          }}
          class="px-4 py-2 cursor-pointer text-sm bg-surface border border-border rounded-xl flex gap-2 items-center"
        >
          <Download size="20" />
          <span>Download Recording</span>
        </button>
      {/if}
      {#if mediaRecorder}
        <button
          onclick={() => {
            mediaRecorder.stop();
          }}
          class="px-4 py-2 cursor-pointer text-sm bg-surface border border-border rounded-xl flex gap-2 items-center"
        >
          <X size="20" />
          <span>Stop Recording</span>
        </button>
      {:else}
        <button
          onclick={() => {
            recordingMenu.hidePopover();
            startRecording();
          }}
          class="px-4 py-2 cursor-pointer text-sm bg-surface border border-border rounded-xl flex gap-2 items-center"
        >
          <Disc size="20" />
          <span>Start Recording</span>
        </button>
      {/if}
    </div>
    <button
      onclick={() => frame.contentWindow.location.reload()}
      class="px-4 py-2 cursor-pointer text-sm bg-surface border border-border rounded-xl flex gap-2"
    >
      <RotateCw size="20" />
      <span>Reload</span>
    </button>
    {#if window.opener}
      <button
        onclick={() => window.close()}
        class="px-4 py-2 cursor-pointer text-sm bg-surface border border-border rounded-xl flex gap-2"
      >
        <X size="20" />
        <span>Quit</span>
      </button>
    {/if}
  </div>
</div>
<div
  class="fixed top-17 bottom-0 right-0 left-0 h-[calc(100vh-4.25rem)] w-full flex items-center justify-center"
>
  <iframe
    bind:this={frame}
    onload={frameLoaded}
    title={data.currentData.title}
    class={"bg-background select-none max-h-full max-w-full " + aspectRatio}
    src={framePath}
    allow="display-capture; autoplay; gamepad"
    sandbox="allow-forms allow-scripts allow-same-origin allow-modals"
    style="isolation: isolate; transform-style: flat;"
  ></iframe>
</div>
