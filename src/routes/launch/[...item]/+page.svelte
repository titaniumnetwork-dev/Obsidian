<script>
  import Head from "#lib/components/Head.svelte";
  import KenneyGamepadIcon from "#lib/components/KenneyGamepadIcon.svelte";
  import KenneyKeyboardIcon from "#lib/components/KenneyKeyboardIcon.svelte";
  import Button from "#lib/components/ui/Button.svelte";
  import { emulators } from "#lib/emulators.js";
  import { storage } from "#lib/storage.svelte.js";
  import { goto } from "$app/navigation";
  import {
    Check,
    ChevronRight,
    Disc,
    Download,
    FolderOpen,
    Gamepad,
    Gamepad2,
    Keyboard,
    Maximize,
    Plus,
    RotateCw,
    Save,
    SwatchBook,
    Trash,
    Video,
    X,
  } from "@lucide/svelte";
  import { untrack } from "svelte";

  let { data } = $props();

  const game = $derived(data.currentData);
  const aspectRatio = $derived(storage.settings.aspect || "h-full w-full");

  const SHADERS = [
    ["disabled", "None"],
    ["4xScaleHQ.glslp", "Smooth"],
    ["crt-aperture.glslp", "CRT"],
    ["crt-geom.glslp", "CRT TV"],
  ];

  let frame = $state(null);
  let activeControllerType = $state("xbox");
  let isGamepadConnected = $state(false);

  let keybindsMenu = $state();
  let emulationMenu = $state();
  let shadersMenu = $state();
  let recordingMenu = $state();

  let isKeybindsOpen = $state(false);
  let isEmulationOpen = $state(false);
  let isShadersOpen = $state(false);
  let isRecordingOpen = $state(false);
  let shader = $state("disabled");

  let controlsTab = $state("keyboard");
  let bindingModal = $state(null);

  let framePath = $derived.by(() => {
    const { type, id, version, internalVersion, path, emulator, rom } = game;
    const ver = version || internalVersion;

    if (type === "HTML") return `/cdn/assets/html/${id}/${ver}${path}`;
    if (type === "Flash")
      return `/flash/cdn/assets/flash/${id}/${ver}/${id}.swf`;
    if (type === "Emulation") {
      const core = emulators.find((emu) => emu.id === emulator)?.core;
      return `/emu/${core}/cdn/assets/emulation/${id}/${ver}${rom}`;
    }
    return "";
  });

  untrack(() => {
    if (data && !storage.installed.includes(data.currentData.id)) {
      goto(`/store/${data.currentData.id}`);
    }
  });

  $effect(() => {
    if (game.type !== "Emulation") return;
    try {
      const suffix = `${game.rom.split(".")[0]}-settings`;
      const raw = Object.entries(localStorage).find(([k]) =>
        k.endsWith(suffix),
      )?.[1];
      shader = (raw && JSON.parse(raw).settings?.shader) || "disabled";
    } catch {
      shader = "disabled";
    }
  });

  const keybinds = $derived(storage.keybinds[game.id] ?? []);
  const gamepadBinds = $derived(storage.gamepadBinds[game.id] ?? []);
  const activeBinds = $derived(
    controlsTab === "keyboard" ? keybinds : gamepadBinds,
  );

  function startBinding(modal) {
    bindingModal = modal;
    document.activeElement?.blur();
    keybindsMenu?.focus();
  }

  function handleKeydown(e) {
    if (!bindingModal) return;

    e.preventDefault();
    e.stopPropagation();
    document.activeElement?.blur();

    if (e.code === "Escape") {
      bindingModal = null;
      return;
    }

    const { type, step, id, from, to, toKeyCode, toKey, trigger } =
      bindingModal;

    if (type === "keyboard" && step === "trigger") {
      if (id) {
        storage.setKeybind(game.id, e.code, to, toKeyCode, toKey, id);
        bindingModal = null;
      } else {
        bindingModal.from = e.code;
        bindingModal.step = "target";
      }
    } else if (step === "target") {
      bindingModal = null;
      if (type === "keyboard") {
        storage.setKeybind(game.id, from, e.code, e.keyCode, e.key, id);
      } else {
        storage.setGamepadBind(game.id, trigger, e.code, e.keyCode, e.key, id);
      }
    }
  }

  function handleGameKey(e) {
    if (!e.isTrusted) return;
    if (bindingModal) {
      if (e.type === "keydown") handleKeydown(e);
      return;
    }
    const bind = keybinds.find((b) => b.from === e.code);
    if (bind) {
      e.stopPropagation();
      e.stopImmediatePropagation();
      e.preventDefault();
      dispatchGameEvent(e.type, bind.to, bind.toKeyCode, bind.toKey);
    }
  }

  function dispatchGameEvent(type, code, keyCode = 0, keyName = "") {
    const doc = frame?.contentWindow?.document;
    if (!doc) return;

    const key =
      keyName ||
      (code.length === 1
        ? code
        : code.startsWith("Key")
          ? code.slice(3).toLowerCase()
          : code);

    const event = new KeyboardEvent(type, {
      bubbles: true,
      cancelable: true,
      composed: true,
      key,
      code,
    });

    Object.defineProperty(event, "keyCode", { get: () => keyCode });
    Object.defineProperty(event, "which", { get: () => keyCode });

    try {
      (doc.querySelector("canvas") || doc).dispatchEvent(event);
    } catch {}
  }

  const DEADZONE = 0.4;
  let previousTriggerState = {};
  let previousGamepadButtons = {};
  let previousGamepadAxes = {};

  function isTriggerActive(gp, trigger) {
    if (!trigger) return false;
    if (trigger.buttons) {
      return trigger.buttons.some((b) => gp.buttons?.[b]?.pressed);
    }
    if (trigger.axes) {
      return trigger.axes.some(({ index, direction }) => {
        const val = gp.axes?.[index];
        return (
          val !== undefined &&
          (direction > 0 ? val > DEADZONE : val < -DEADZONE)
        );
      });
    }
    return false;
  }

  function detectControllerType(id = "") {
    const lower = id.toLowerCase();
    if (
      lower.includes("playstation") ||
      lower.includes("dualshock") ||
      lower.includes("dualsense")
    ) {
      return "playstation";
    }
    if (
      lower.includes("nintendo") ||
      lower.includes("joy-con") ||
      lower.includes("pro controller")
    ) {
      return "nintendo";
    }
    return "xbox";
  }

  $effect(() => {
    let rafId;

    function poll() {
      const gamepads = navigator.getGamepads?.() ?? [];
      let connected = false;

      for (let i = 0; i < gamepads.length; i++) {
        const gp = gamepads[i];
        if (!gp) continue;

        connected = true;
        activeControllerType = detectControllerType(gp.id);

        const prevBtns = (previousGamepadButtons[i] ??= []);
        const prevAxes = (previousGamepadAxes[i] ??= []);

        if (
          bindingModal?.type === "controller" &&
          bindingModal.step === "trigger"
        ) {
          let detected = null;

          const btnIdx = gp.buttons?.findIndex(
            (btn, b) => btn?.pressed && !prevBtns[b],
          );
          if (btnIdx !== undefined && btnIdx >= 0) {
            detected = { buttons: [btnIdx] };
          } else if (gp.axes) {
            for (let a = 0; a < gp.axes.length; a++) {
              const val = gp.axes[a];
              const dir = val > DEADZONE ? 1 : val < -DEADZONE ? -1 : 0;
              if (dir !== 0 && dir !== (prevAxes[a] || 0)) {
                detected = { axes: [{ index: a, direction: dir }] };
                break;
              }
            }
          }

          if (detected) {
            if (bindingModal.id) {
              const { id, to, toKeyCode, toKey } = bindingModal;
              previousTriggerState[id] = true;
              bindingModal = null;
              storage.setGamepadBind(
                game.id,
                detected,
                to,
                toKeyCode,
                toKey,
                id,
              );
            } else {
              bindingModal.trigger = detected;
              bindingModal.step = "target";
            }
          }
        } else if (!bindingModal && gamepadBinds.length > 0) {
          for (const bind of gamepadBinds) {
            const active = isTriggerActive(gp, bind.trigger);
            const wasActive = previousTriggerState[bind.id] || false;

            if (active !== wasActive) {
              dispatchGameEvent(
                active ? "keydown" : "keyup",
                bind.to,
                bind.toKeyCode,
                bind.toKey,
              );
              previousTriggerState[bind.id] = active;
            }
          }
        }

        gp.buttons?.forEach((btn, b) => (prevBtns[b] = btn?.pressed || false));
        gp.axes?.forEach(
          (val, a) =>
            (prevAxes[a] = val > DEADZONE ? 1 : val < -DEADZONE ? -1 : 0),
        );
      }

      isGamepadConnected = connected;
      rafId = requestAnimationFrame(poll);
    }

    rafId = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(rafId);
  });

  function frameLoaded() {
    const win = frame?.contentWindow;
    if (!win) return;

    try {
      win.addEventListener("click", () => {
        if (isKeybindsOpen) keybindsMenu?.hidePopover();
        if (isRecordingOpen) recordingMenu?.hidePopover();
        if (isEmulationOpen) emulationMenu?.hidePopover();
        if (isShadersOpen) shadersMenu?.hidePopover();
        win.focus();
      });

      for (const type of ["keydown", "keyup"]) {
        win.addEventListener(type, handleGameKey, true);
      }
    } catch {}
  }

  let mediaRecorder = $state(null);
  let videoBlob = $state(null);
  let recordedChunks = [];
  let fileExtension = $state("webm");

  function generateFilename() {
    const fmt = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
      .formatToParts(new Date())
      .reduce((acc, { type, value }) => ({ ...acc, [type]: value }), {});

    return `Screen Recording ${fmt.year}-${fmt.month}-${fmt.day} at ${fmt.hour}-${fmt.minute} ${fmt.dayPeriod}`;
  }

  function getSupportedMimeType() {
    return (
      ["video/webm; codecs=vp9", "video/webm", "video/mp4"].find((t) =>
        MediaRecorder.isTypeSupported(t),
      ) || ""
    );
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "browser" },
        audio: true,
        preferCurrentTab: true,
      });

      const [videoTrack] = stream.getVideoTracks();
      if ("RestrictionTarget" in window && videoTrack?.restrictTo) {
        const target = await RestrictionTarget.fromElement(frame);
        await videoTrack.restrictTo(target);
      }

      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );
      const actualMimeType = recorder.mimeType || "video/mp4";
      fileExtension = actualMimeType.includes("webm") ? "webm" : "mp4";

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.push(e.data);
      };

      recorder.onstop = () => {
        videoBlob = new Blob(recordedChunks, { type: actualMimeType });
        recordedChunks = [];
        mediaRecorder = null;
        stream.getTracks().forEach((t) => t.stop());
        recordingMenu?.showPopover();
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
      const a = Object.assign(document.createElement("a"), {
        style: "display:none",
        href: url,
        download: filename,
      });
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        a.remove();
        URL.revokeObjectURL(url);
      }, 100);
    };

    if ("showSaveFilePicker" in window) {
      try {
        const mimeKey = fileExtension === "mp4" ? "video/mp4" : "video/webm";
        const handle = await window.showSaveFilePicker({
          startIn: "downloads",
          suggestedName: filename,
          types: [{ accept: { [mimeKey]: [`.${fileExtension}`] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(videoBlob);
        await writable.close();
      } catch (err) {
        if (err.name !== "AbortError") fallbackDownload();
      }
    } else {
      fallbackDownload();
    }
  }

  function emulationLoadSave() {
    const emu = frame?.contentWindow?.EJS_emulator;
    if (!emu) return;
    emu.storage.states.get(`${emu.getBaseFileName()}.state`).then((state) => {
      emu.gameManager.loadState(state);
      emu.displayMessage(emu.localization("Save loaded"));
    });
  }

  function emulationSave() {
    const emu = frame?.contentWindow?.EJS_emulator;
    if (!emu) return;
    emu.storage.states.put(
      `${emu.getBaseFileName()}.state`,
      emu.gameManager.getState(),
    );
    emu.displayMessage(emu.localization("Saved"));
  }

  function emulationShader(newShader = "disabled") {
    frame?.contentWindow?.EJS_emulator?.changeSettingOption(
      "shader",
      newShader,
    );
    shader = newShader;
  }

  function quitCurrent() {
    storage.quitActive(game.id);
    window.location = `/library/${game.id}`;
  }
</script>

{#snippet gamepadIcons(trigger)}
  {#if trigger?.buttons}
    {#each trigger.buttons as btn}
      <KenneyGamepadIcon button={btn} type={activeControllerType} />
    {/each}
  {/if}
  {#if trigger?.axes}
    {#each trigger.axes as axis}
      <KenneyGamepadIcon {axis} type={activeControllerType} />
    {/each}
  {/if}
{/snippet}

<Head
  forceTitle={game.title}
  icon={`/cdn/assets/assets/${game.id}/icon.webp`}
  ads={false}
/>

<svelte:window onkeydown={handleGameKey} onkeyup={handleGameKey} />

<div
  data-overlay-style={storage.settings.overlay}
  class="group fixed z-20 flex items-center transition-all data-[overlay-style=default]:top-0 data-[overlay-style=default]:right-0 data-[overlay-style=default]:left-0 data-[overlay-style=default]:h-17 data-[overlay-style=default]:px-4 data-[overlay-style=default]:bg-background data-[overlay-style=default]:border-b data-[overlay-style=default]:border-border data-[overlay-style=default]:justify-between data-[overlay-style=compact]:top-3 data-[overlay-style=compact]:right-3 data-[overlay-style=compact]:p-1.5 data-[overlay-style=compact]:bg-card/90 data-[overlay-style=compact]:backdrop-blur-md data-[overlay-style=compact]:border data-[overlay-style=compact]:border-border data-[overlay-style=compact]:rounded-xl data-[overlay-style=compact]:shadow-lg data-[overlay-style=compact]:justify-end"
>
  <div
    class="group-data-[overlay-style=compact]:hidden flex items-center gap-2 text-sm"
  >
    <img
      draggable="false"
      class="size-8 rounded-lg"
      src={`/cdn/assets/assets/${game.id}/icon.webp`}
      alt={game.title}
    />
    <p>{game.title}</p>
  </div>
  <div class="flex items-center gap-1.5 sm:gap-2">
    {#if game.type === "Emulation"}
      <button
        popovertarget="emulation"
        title="Emulation"
        aria-label="Emulation"
        data-active={isEmulationOpen}
        class="[anchor-name:--emulation-button] h-9 group-data-[overlay-style=compact]:w-9 group-data-[overlay-style=default]:px-2.5 bg-card rounded-lg flex gap-1.5 items-center justify-center cursor-pointer border border-input text-sm hover:bg-secondary data-[active=true]:bg-secondary transition-colors"
      >
        <Gamepad size="16" />
        <span class="group-data-[overlay-style=compact]:hidden">Emulation</span>
      </button>
      <div
        popover="auto"
        id="emulation"
        bind:this={emulationMenu}
        ontoggle={(e) => (isEmulationOpen = e.newState === "open")}
        class="[&:popover-open]:flex flex-col bg-card rounded-lg text-inherit [position-anchor:--emulation-button] group-data-[overlay-style=default]:[position-area:bottom_span-right] group-data-[overlay-style=compact]:[position-area:bottom_span-left] mt-2.5 z-20 p-1 overflow-visible border border-input"
      >
        <button
          onclick={() => {
            emulationMenu.hidePopover();
            emulationSave();
          }}
          class="px-2 py-1.5 gap-2 rounded-md cursor-pointer transition-colors bg-card hover:bg-secondary flex items-center text-sm"
        >
          <Save size="16" />
          <span>Save</span>
        </button>
        <button
          onclick={() => {
            emulationMenu.hidePopover();
            emulationLoadSave();
          }}
          class="px-2 py-1.5 gap-2 rounded-md cursor-pointer transition-colors bg-card hover:bg-secondary flex items-center text-sm"
        >
          <FolderOpen size="16" />
          <span>Load Save</span>
        </button>
        <button
          popovertarget="shaders"
          data-active={isShadersOpen}
          class="[anchor-name:--shaders-button] px-2 py-1.5 gap-2 rounded-md cursor-pointer transition-colors bg-card hover:bg-secondary data-[active=true]:bg-secondary flex items-center text-sm justify-between"
        >
          <div class="flex items-center gap-2">
            <SwatchBook size="16" />
            <span>Shaders</span>
          </div>
          <ChevronRight size="16" />
        </button>
        <div
          popover="auto"
          id="shaders"
          bind:this={shadersMenu}
          ontoggle={(e) => (isShadersOpen = e.newState === "open")}
          class="[&:popover-open]:flex flex-col bg-card rounded-lg text-inherit [position-anchor:--shaders-button] group-data-[overlay-style=default]:[position-area:right_span-bottom] group-data-[overlay-style=compact]:[position-area:left_span-bottom] z-20 p-1 overflow-visible border border-input min-w-36"
        >
          {#each SHADERS as [id, label]}
            <button
              onclick={() => {
                emulationShader(id);
                shadersMenu.hidePopover();
              }}
              class="px-2 py-1.5 gap-2 rounded-md cursor-pointer transition-colors bg-card hover:bg-secondary flex items-center text-sm justify-between"
            >
              <span>{label}</span>
              {#if shader === id}
                <Check size="16" />
              {/if}
            </button>
          {/each}
        </div>
      </div>
    {/if}
    <button
      popovertarget="keybinds"
      title="Keybinds"
      aria-label="Keybinds"
      data-active={isKeybindsOpen}
      class="[anchor-name:--keybinds-button] h-9 {isGamepadConnected
        ? 'group-data-[overlay-style=compact]:px-2'
        : 'group-data-[overlay-style=compact]:w-9'} group-data-[overlay-style=default]:px-2.5 bg-card rounded-lg flex gap-1.5 items-center justify-center cursor-pointer border border-input text-sm outline-none hover:bg-secondary data-[active=true]:bg-secondary transition-colors"
    >
      <Keyboard size="16" />
      {#if isGamepadConnected}
        <Gamepad2 size="16" />
      {/if}
      <span class="group-data-[overlay-style=compact]:hidden">Keybinds</span>
    </button>
    <div
      ontoggle={(e) => {
        isKeybindsOpen = e.newState === "open";
        if (e.newState === "closed") {
          bindingModal = null;
          frame?.contentWindow?.focus();
        }
      }}
      popover="auto"
      id="keybinds"
      tabindex="-1"
      bind:this={keybindsMenu}
      class="[&:popover-open]:flex flex-col bg-card rounded-xl text-foreground [position-anchor:--keybinds-button] group-data-[overlay-style=default]:[position-area:bottom_span-right] group-data-[overlay-style=compact]:[position-area:bottom_span-left] mt-2.5 z-20 p-3 border border-input min-w-80 gap-2 max-h-[calc(100vh-5rem)] overflow-y-auto outline-none"
    >
      {#if bindingModal}
        <div class="flex flex-col items-center justify-center gap-2.5 py-3">
          <p class="text-sm font-medium">
            {#if bindingModal.step === "trigger"}
              {bindingModal.type === "keyboard"
                ? "Press key"
                : "Press controller input"}
            {:else}
              Press target key
            {/if}
          </p>
          <div class="flex items-center gap-2.5">
            <div
              data-listening={bindingModal.step === "trigger"}
              class="flex size-10 shrink-0 items-center justify-center rounded-lg border border-input bg-secondary/40 transition-colors data-[listening=true]:border-foreground/50 data-[listening=true]:bg-secondary"
            >
              {#if bindingModal.step === "trigger"}
                {#if bindingModal.type === "keyboard"}
                  <Keyboard size="18" />
                {:else}
                  <Gamepad2 size="18" />
                {/if}
              {:else if bindingModal.type === "keyboard"}
                <KenneyKeyboardIcon key={bindingModal.from} />
              {:else}
                {@render gamepadIcons(bindingModal.trigger)}
              {/if}
            </div>
            <ChevronRight size="16" class="text-muted shrink-0" />
            <div
              data-listening={bindingModal.step === "target"}
              class="flex size-10 shrink-0 items-center justify-center rounded-lg border border-input bg-secondary/40 transition-colors data-[listening=true]:border-foreground/50 data-[listening=true]:bg-secondary"
            >
              {#if bindingModal.step === "trigger" && bindingModal.to}
                <KenneyKeyboardIcon key={bindingModal.to} />
              {:else}
                <Keyboard
                  size="18"
                  class={bindingModal.step === "target" ? "" : "text-muted"}
                />
              {/if}
            </div>
          </div>
          <p class="text-xs text-muted">Press Esc to cancel</p>
        </div>
      {:else}
        <div class="flex gap-2">
          <Button
            variant="ghost"
            onclick={() => (controlsTab = "keyboard")}
            data-active={controlsTab === "keyboard"}
            class="flex-1 justify-center data-[active=true]:bg-secondary border border-border"
          >
            <Keyboard size="16" />
            <span>Keyboard</span>
            {#if keybinds.length > 0}
              <span
                class="text-xs size-5 flex items-center justify-center rounded-full bg-input/30 text-muted"
              >
                {keybinds.length}
              </span>
            {/if}
          </Button>
          <Button
            variant="ghost"
            onclick={() => (controlsTab = "controller")}
            data-active={controlsTab === "controller"}
            class="flex-1 justify-center data-[active=true]:bg-secondary border border-border"
          >
            <Gamepad2 size="16" />
            <span>Controller</span>
            {#if gamepadBinds.length > 0}
              <span
                class="text-xs size-5 flex items-center justify-center rounded-full bg-input/30 text-muted"
              >
                {gamepadBinds.length}
              </span>
            {/if}
          </Button>
        </div>
        {#if controlsTab === "controller" && !isGamepadConnected}
          <div
            class="flex flex-col items-center justify-center p-4 text-center gap-1.5"
          >
            <Gamepad2 size="24" />
            <p class="text-sm">No controller detected</p>
          </div>
        {:else if activeBinds.length === 0}
          <div
            class="flex flex-col items-center justify-center p-4 text-center gap-1.5"
          >
            {#if controlsTab === "keyboard"}
              <Keyboard size="24" />
              <p class="text-sm">No custom keybinds</p>
            {:else}
              <Gamepad2 size="24" />
              <p class="text-sm">No controller keybinds</p>
            {/if}
          </div>
        {:else}
          <div class="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-0.5">
            {#each activeBinds as bind (bind.id)}
              <div
                class="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-secondary/50 border border-border"
              >
                <div class="flex items-center gap-1.5">
                  <button
                    onclick={() =>
                      startBinding({
                        ...bind,
                        type: controlsTab,
                        step: "trigger",
                      })}
                    class="flex items-center justify-center p-0.5 rounded-md cursor-pointer outline-none bg-card border border-input hover:bg-secondary transition-colors"
                    title="Click to rebind trigger input"
                  >
                    {#if controlsTab === "keyboard"}
                      <KenneyKeyboardIcon key={bind.from} />
                    {:else}
                      {@render gamepadIcons(bind.trigger)}
                    {/if}
                  </button>
                  <ChevronRight size="14" class="text-muted shrink-0" />
                  <button
                    onclick={() =>
                      startBinding({
                        ...bind,
                        type: controlsTab,
                        step: "target",
                      })}
                    class="flex items-center justify-center p-0.5 rounded-md cursor-pointer outline-none bg-card border border-input hover:bg-secondary transition-colors"
                    title="Click to rebind target game key"
                  >
                    <KenneyKeyboardIcon key={bind.to} />
                  </button>
                </div>
                <Button
                  variant="outline"
                  size="icon-sm"
                  class="shrink-0"
                  onclick={() =>
                    controlsTab === "keyboard"
                      ? storage.removeKeybind(game.id, bind.id)
                      : storage.removeGamepadBind(game.id, bind.id)}
                  title="Delete keybind"
                  aria-label="Delete keybind"
                >
                  <Trash size="14" />
                </Button>
              </div>
            {/each}
          </div>
        {/if}
        <div class="flex gap-2">
          <Button
            variant="outline"
            disabled={controlsTab === "controller" && !isGamepadConnected}
            class="flex-1 justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            onclick={() => startBinding({ type: controlsTab, step: "trigger" })}
          >
            <Plus size="16" />
            <span>Add Keybind</span>
          </Button>
          {#if activeBinds.length > 0}
            <Button
              variant="outline"
              onclick={() => storage.clearGameKeybinds(game.id, controlsTab)}
              title="Clear all {controlsTab} keybinds for this game"
            >
              <span>Clear</span>
            </Button>
          {/if}
        </div>
      {/if}
    </div>
    <button
      onclick={() => frame.requestFullscreen()}
      title="Fullscreen"
      aria-label="Fullscreen"
      class="h-9 group-data-[overlay-style=compact]:w-9 group-data-[overlay-style=default]:px-2.5 bg-card rounded-lg flex gap-1.5 items-center justify-center cursor-pointer border border-input text-sm hover:bg-secondary transition-colors"
    >
      <Maximize size="16" />
      <span class="group-data-[overlay-style=compact]:hidden">Fullscreen</span>
    </button>
    <button
      popovertarget="recording"
      title={mediaRecorder ? "Recording" : "Record"}
      aria-label={mediaRecorder ? "Recording" : "Record"}
      data-active={isRecordingOpen}
      class="[anchor-name:--recording-button] h-9 group-data-[overlay-style=compact]:w-9 group-data-[overlay-style=default]:px-2.5 bg-card rounded-lg flex gap-1.5 items-center justify-center cursor-pointer border border-input text-sm hover:bg-secondary data-[active=true]:bg-secondary transition-colors"
    >
      {#if mediaRecorder}
        <span class="size-4 flex items-center justify-center shrink-0">
          <span class="size-2 rounded-full bg-red-500 animate-pulse"></span>
        </span>
      {:else}
        <Video size="16" />
      {/if}
      <span class="group-data-[overlay-style=compact]:hidden">
        {mediaRecorder ? "Recording" : "Record"}
      </span>
    </button>
    <div
      popover="auto"
      id="recording"
      bind:this={recordingMenu}
      ontoggle={(e) => (isRecordingOpen = e.newState === "open")}
      class="[&:popover-open]:flex flex-col bg-card rounded-lg text-inherit [position-anchor:--recording-button] group-data-[overlay-style=default]:[position-area:bottom_span-right] group-data-[overlay-style=compact]:[position-area:bottom_span-left] mt-2.5 z-20 p-1 border border-input min-w-36"
    >
      {#if videoBlob}
        <button
          onclick={() => {
            recordingMenu.hidePopover();
            downloadVideo();
          }}
          class="px-2 py-1.5 gap-2 rounded-md cursor-pointer transition-colors bg-card hover:bg-secondary flex items-center text-sm"
        >
          <Download size="16" />
          <span>Download Recording</span>
        </button>
      {/if}
      {#if mediaRecorder}
        <button
          onclick={() => mediaRecorder.stop()}
          class="px-2 py-1.5 gap-2 rounded-md cursor-pointer transition-colors bg-card hover:bg-secondary flex items-center text-sm"
        >
          <X size="16" />
          <span>Stop Recording</span>
        </button>
      {:else}
        <button
          onclick={() => {
            recordingMenu.hidePopover();
            startRecording();
          }}
          class="px-2 py-1.5 gap-2 rounded-md cursor-pointer transition-colors bg-card hover:bg-secondary flex items-center text-sm"
        >
          <Disc size="16" />
          <span>Start Recording</span>
        </button>
      {/if}
    </div>
    <button
      onclick={() => frame.contentWindow.location.reload()}
      title="Reload"
      aria-label="Reload"
      class="h-9 group-data-[overlay-style=compact]:w-9 group-data-[overlay-style=default]:px-2.5 bg-card rounded-lg flex gap-1.5 items-center justify-center cursor-pointer border border-input text-sm hover:bg-secondary transition-colors"
    >
      <RotateCw size="16" />
      <span class="group-data-[overlay-style=compact]:hidden">Reload</span>
    </button>
    {#if window.opener || storage.settings.launch === "currentTab"}
      <button
        onclick={() => (window.opener ? window.close() : quitCurrent())}
        title="Quit"
        aria-label="Quit"
        class="h-9 group-data-[overlay-style=compact]:w-9 group-data-[overlay-style=default]:px-2.5 bg-card rounded-lg flex gap-1.5 items-center justify-center cursor-pointer border border-input text-sm hover:bg-secondary transition-colors"
      >
        <X size="16" />
        <span class="group-data-[overlay-style=compact]:hidden">Quit</span>
      </button>
    {/if}
  </div>
</div>

<div
  data-overlay-style={storage.settings.overlay}
  class="fixed data-[overlay-style=default]:top-17 data-[overlay-style=default]:h-[calc(100vh-4.25rem)] data-[overlay-style=compact]:top-0 data-[overlay-style=compact]:h-full bottom-0 right-0 left-0 w-full flex items-center justify-center"
>
  <iframe
    bind:this={frame}
    onload={frameLoaded}
    title={game.title}
    class="bg-background select-none max-h-full max-w-full {aspectRatio}"
    src={framePath}
    allow="display-capture; autoplay; gamepad"
    sandbox="allow-forms allow-scripts allow-same-origin allow-modals allow-pointer-lock allow-downloads"
    style="isolation: isolate; transform-style: flat;"
  ></iframe>
</div>
