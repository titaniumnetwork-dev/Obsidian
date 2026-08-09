<script>
  import { goto } from "$app/navigation";
  import Head from "$lib/components/Head.svelte";
  import KenneyGamepadIcon from "$lib/components/KenneyGamepadIcon.svelte";
  import KenneyKeyboardIcon from "$lib/components/KenneyKeyboardIcon.svelte";
  import { storage } from "$lib/storage.svelte.js";
  import {
    ChevronDown,
    ChevronRight,
    Disc,
    Download,
    FolderOpen,
    Gamepad,
    Gamepad2,
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
  let activeControllerType = $state("xbox");
  let isGamepadConnected = $state(false);

  let framePath = $derived.by(() => {
    switch (data.currentData.type) {
      case "HTML":
        return (
          "/cdn/assets/html/" +
          data.currentData.id +
          "/" +
          (data.currentData.version || data.currentData.internalVersion) +
          data.currentData.path
        );
      case "Flash":
        return (
          "/flash/cdn/assets/flash/" +
          data.currentData.id +
          "/" +
          (data.currentData.version || data.currentData.internalVersion) +
          "/" +
          data.currentData.id +
          ".swf"
        );
      case "Emulation":
        return (
          "/emu/cdn/assets/emulation/" +
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
  let gamepadBinding = $state({});
  let shader = $state();

  let controlsTab = $derived(
    data.currentData.controls ? "keyboard" : "controller",
  );

  $effect(() => {
    if (data.currentData.type === "Emulation") {
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

  $effect(() => {
    const updateGamepadStatus = () => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      isGamepadConnected = Array.from(gamepads).some((gp) => gp !== null);

      if (
        !isGamepadConnected &&
        controlsTab === "controller" &&
        data.currentData.controls
      ) {
        controlsTab = "keyboard";
      }
    };

    window.addEventListener("gamepadconnected", updateGamepadStatus);
    window.addEventListener("gamepaddisconnected", updateGamepadStatus);
    updateGamepadStatus();

    return () => {
      window.removeEventListener("gamepadconnected", updateGamepadStatus);
      window.removeEventListener("gamepaddisconnected", updateGamepadStatus);
    };
  });

  const keybinds = $derived(storage.keybinds[data.currentData.id] || {});
  const gamepadBinds = $derived(
    storage.gamepadBinds[data.currentData.id] || {},
  );

  const resolvedGamepadControls = $derived.by(() => {
    const defaults = data.currentData.gamepadControls || [];
    return defaults.map((def) => {
      if (gamepadBinds[def.action]) {
        return { action: def.action, ...gamepadBinds[def.action] };
      }
      return def;
    });
  });

  function handleKeydown(e) {
    if (gamepadBinding.action) {
      if (e.code === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        storage.removeGamepadBind(data.currentData.id, gamepadBinding.action);
        gamepadBinding = {};
      }
      return;
    }

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

  function updateCloudSaveIndexedDB(dbName, storeName, key, value) {
    let indexedDBItems = data.currentData.cloudSave?.indexedDB;
    if (indexedDBItems) {
      for (let DBItem of Object.entries(indexedDBItems)) {
        if (DBItem[0] === dbName) {
          for (let storeItem of Object.entries(DBItem[1])) {
            if (storeItem[0] === storeName) {
              for (let item of storeItem[1]) {
                let realItem = item
                  .map((item) => {
                    if (item.type === "text") {
                      return item.value;
                    } else if (item.type === "id") {
                      return data.currentData.id;
                    } else if (item.type === "hostname") {
                      return window.location.hostname;
                    }
                  })
                  .join("");

                if (realItem === key) {
                  if (value === null) return;

                  let payload = value;

                  if (
                    value &&
                    value.buffer &&
                    typeof value.byteLength === "number"
                  ) {
                    let binaryStr = "";
                    const bytes = new Uint8Array(
                      value.buffer,
                      value.byteOffset,
                      value.byteLength,
                    );
                    const len = bytes.byteLength;

                    for (let i = 0; i < len; i++) {
                      binaryStr += String.fromCharCode(bytes[i]);
                    }

                    payload = { _idbType: "Uint8Array", b64: btoa(binaryStr) };
                  }

                  const safeDbName = encodeURIComponent(dbName);
                  const safeStoreName = encodeURIComponent(storeName);
                  const safeKey = encodeURIComponent(key);
                  const dbKey = `${safeDbName}|${safeStoreName}|${safeKey}`;

                  storage.updateCloudSave(
                    "indexeddb",
                    dbKey,
                    JSON.stringify(payload),
                  );
                }
              }
            }
          }
        }
      }
    }
  }

  function interceptIndexedDB() {
    if (!frame.contentWindow || !frame.contentWindow.IDBObjectStore) return;

    const originalPut = frame.contentWindow.IDBObjectStore.prototype.put;
    const originalAdd = frame.contentWindow.IDBObjectStore.prototype.add;
    const originalDelete = frame.contentWindow.IDBObjectStore.prototype.delete;

    frame.contentWindow.IDBObjectStore.prototype.put = function (value, key) {
      const dbName = this.transaction.db.name;
      const storeName = this.name;

      const request = originalPut.call(this, value, key);

      request.addEventListener("success", () => {
        updateCloudSaveIndexedDB(dbName, storeName, request.result, value);
      });

      return request;
    };

    frame.contentWindow.IDBObjectStore.prototype.add = function (value, key) {
      const dbName = this.transaction.db.name;
      const storeName = this.name;

      const request = originalAdd.call(this, value, key);

      request.addEventListener("success", () => {
        updateCloudSaveIndexedDB(dbName, storeName, request.result, value);
      });

      return request;
    };

    frame.contentWindow.IDBObjectStore.prototype.delete = function (key) {
      const dbName = this.transaction.db.name;
      const storeName = this.name;

      const request = originalDelete.call(this, key);

      request.addEventListener("success", () => {
        updateCloudSaveIndexedDB(dbName, storeName, key, null);
      });

      return request;
    };
  }

  function frameLoaded(e) {
    frame.contentWindow.addEventListener("click", () => {
      if (controlsMenu) {
        controlsMenu.hidePopover();
      }
      if (recordingMenu) {
        recordingMenu.hidePopover();
      }
      if (emulationMenu) {
        emulationMenu.hidePopover();
      }
    });

    function dispatchGameEvent(eventType, keyString, keyCodeNum) {
      const fakeEvent = new KeyboardEvent(eventType, {
        bubbles: true,
        cancelable: true,
        composed: true,
        key: keyString,
        code: keyCodeNum,
      });

      Object.defineProperty(fakeEvent, "keyCode", {
        get: () => keyCodeNum,
      });
      Object.defineProperty(fakeEvent, "which", {
        get: () => keyCodeNum,
      });

      const canvas = frame.contentWindow.document.querySelector("canvas");

      if (canvas) {
        canvas.dispatchEvent(fakeEvent);
      } else {
        frame.contentWindow.document.dispatchEvent(fakeEvent);
      }
    }

    function interceptKeybinds(event, eventType) {
      if (!event.isTrusted) return;

      const targetAction = Object.keys(keybinds).find(
        (action) => keybinds[action].key === event.code,
      );

      if (targetAction) {
        const targetKeyCode = keybinds[targetAction].keyCode;

        event.stopPropagation();
        event.stopImmediatePropagation();
        event.preventDefault();

        dispatchGameEvent(eventType, targetAction, targetKeyCode);
      }
    }

    frame.contentWindow.addEventListener("keydown", (event) =>
      interceptKeybinds(event, "keydown"),
    );
    frame.contentWindow.addEventListener("keyup", (event) =>
      interceptKeybinds(event, "keyup"),
    );

    let previousGamepadState = {};
    let previousAxisState = {};
    const DEADZONE = 0.4;
    let gamepadPollingActive = false;

    function startGamepadPolling() {
      if (gamepadPollingActive) return;
      gamepadPollingActive = true;

      const controlsConfig = data.currentData.controls || [];

      function triggerGamepadEvent(eventType, matchFn) {
        if (data.currentData.controllerSupport) {
          return;
        }

        const gamepadDef = resolvedGamepadControls.find(matchFn);
        if (!gamepadDef) return;

        const controlDef = controlsConfig.find(
          (c) => c.action === gamepadDef.action,
        );
        if (!controlDef || !controlDef.keys || controlDef.keys.length === 0)
          return;

        const targetKeyString = controlDef.keys[0].key;
        const targetKeyCode = controlDef.keys[0].keyCode;

        dispatchGameEvent(eventType, targetKeyString, targetKeyCode);
      }

      function poll() {
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];

        for (let i = 0; i < gamepads.length; i++) {
          const gp = gamepads[i];
          if (!gp) continue;

          const id = gp.id.toLowerCase();
          if (
            id.includes("playstation") ||
            id.includes("dualshock") ||
            id.includes("dualsense")
          ) {
            activeControllerType = "playstation";
          } else if (
            id.includes("nintendo") ||
            id.includes("joy-con") ||
            id.includes("pro controller")
          ) {
            activeControllerType = "nintendo";
          } else {
            activeControllerType = "xbox";
          }

          if (!previousGamepadState[i]) previousGamepadState[i] = [];
          if (!previousAxisState[i]) previousAxisState[i] = [];

          if (gamepadBinding.action) {
            let mapped = false;

            if (gp.buttons) {
              gp.buttons.forEach((button, btnIndex) => {
                if (button.pressed && !previousGamepadState[i][btnIndex]) {
                  storage.updateGamepadBind(
                    data.currentData.id,
                    gamepadBinding.action,
                    { buttons: [btnIndex] },
                  );
                  mapped = true;
                }
                previousGamepadState[i][btnIndex] = button.pressed;
              });
            }
            if (!mapped && gp.axes) {
              gp.axes.forEach((value, axisIndex) => {
                let dir = value > DEADZONE ? 1 : value < -DEADZONE ? -1 : 0;
                let prevDir = previousAxisState[i][axisIndex] || 0;

                if (dir !== 0 && dir !== prevDir) {
                  storage.updateGamepadBind(
                    data.currentData.id,
                    gamepadBinding.action,
                    { axes: [{ index: axisIndex, direction: dir }] },
                  );
                  mapped = true;
                }
                previousAxisState[i][axisIndex] = dir;
              });
            }

            if (mapped) gamepadBinding = {};
            continue;
          }

          if (gp.buttons) {
            gp.buttons.forEach((button, btnIndex) => {
              const wasPressed = previousGamepadState[i][btnIndex];
              const isPressed = button.pressed;

              if (isPressed && !wasPressed) {
                triggerGamepadEvent(
                  "keydown",
                  (c) => c.buttons && c.buttons.includes(btnIndex),
                );
              } else if (!isPressed && wasPressed) {
                triggerGamepadEvent(
                  "keyup",
                  (c) => c.buttons && c.buttons.includes(btnIndex),
                );
              }
              previousGamepadState[i][btnIndex] = isPressed;
            });
          }

          if (gp.axes) {
            gp.axes.forEach((value, axisIndex) => {
              let currentDirection = 0;
              if (value > DEADZONE) currentDirection = 1;
              else if (value < -DEADZONE) currentDirection = -1;

              const previousDirection = previousAxisState[i][axisIndex] || 0;

              if (currentDirection !== previousDirection) {
                if (previousDirection !== 0) {
                  triggerGamepadEvent(
                    "keyup",
                    (c) =>
                      c.axes &&
                      c.axes.some(
                        (a) =>
                          a.index === axisIndex &&
                          a.direction === previousDirection,
                      ),
                  );
                }
                if (currentDirection !== 0) {
                  triggerGamepadEvent(
                    "keydown",
                    (c) =>
                      c.axes &&
                      c.axes.some(
                        (a) =>
                          a.index === axisIndex &&
                          a.direction === currentDirection,
                      ),
                  );
                }
                previousAxisState[i][axisIndex] = currentDirection;
              }
            });
          }
        }

        requestAnimationFrame(poll);
      }

      requestAnimationFrame(poll);
    }

    if (
      data.currentData.gamepadControls &&
      data.currentData.gamepadControls.length > 0
    ) {
      startGamepadPolling();
    }

    window.addEventListener("storage", (e) => {
      if (!data.user) return;

      let localStorageItems = data.currentData.cloudSave?.localStorage;
      if (localStorageItems) {
        for (let storageItem of localStorageItems) {
          let realStorageItem = storageItem
            .map((item) => {
              if (item.type === "text") {
                return item.value;
              } else if (item.type === "id") {
                return data.currentData.id;
              } else if (item.type === "hostname") {
                return window.location.hostname;
              }
            })
            .join("");
          if (realStorageItem === e.key) {
            storage.updateCloudSave(
              "localstorage",
              realStorageItem,
              e.newValue,
            );
          }
        }
      }
    });

    interceptIndexedDB();
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
          types: [{ accept: { [mimeKey]: [`.${fileExtension}`] } }],
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
          EJS_emulator.gameManager.loadState(t);
          EJS_emulator.displayMessage(EJS_emulator.localization("Save loaded"));
        });
    }
  }

  function emulationSave() {
    const EJS_emulator = frame.contentWindow?.EJS_emulator;
    if (EJS_emulator) {
      EJS_emulator.storage.states.put(
        EJS_emulator.getBaseFileName() + ".state",
        EJS_emulator.gameManager.getState(),
      );
      EJS_emulator.displayMessage(EJS_emulator.localization("Saved"));
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
  forceTitle={data.currentData.title}
  icon={"/cdn/assets/assets/" + data.currentData.id + "/icon.webp"}
/>

<svelte:window onclick={handleClickOutside} onkeydown={handleKeydown} />

<div
  data-overlay-style={storage.settings.overlay}
  class="group bg-background fixed top-0 right-0 left-0 flex justify-between items-center border-b border-border h-17 px-4"
>
  <div class="flex items-center gap-2 text-sm">
    <img
      draggable="false"
      class="size-8 rounded-lg"
      src={"/cdn/assets/assets/" + data.currentData.id + "/icon.webp"}
      alt={data.currentData.title}
    />
    <p>{data.currentData.title}</p>
  </div>
  <div class="flex items-center gap-2">
    {#if data.currentData.type === "Emulation"}
      <button
        popovertarget="emulation"
        class="[anchor-name:--emulation-button] h-9 group-data-[overlay-style=compact]:w-9 group-data-[overlay-style=default]:px-2.5 bg-card rounded-lg flex gap-1.5 items-center justify-center cursor-pointer border border-input text-sm"
      >
        <Gamepad size="16" />
        <span class="group-data-[overlay-style=compact]:hidden">Emulation</span>
      </button>
      <div
        popover="auto"
        id="emulation"
        bind:this={emulationMenu}
        class="[&:popover-open]:flex flex-col bg-card rounded-xl text-foreground [position-anchor:--emulation-button]
              group-data-[overlay-style=default]:[position-area:bottom_span-right] group-data-[overlay-style=compact]:[position-area:bottom_span-left] mt-2 z-20 p-4 gap-4 overflow-visible border border-surface"
      >
        <button
          onclick={() => {
            emulationMenu.hidePopover();
            emulationSave();
          }}
          class="px-4 py-2 cursor-pointer text-sm bg-secondary border border-border rounded-xl flex gap-2 items-center"
        >
          <Save size="20" />
          <span>Save</span>
        </button>
        <button
          onclick={() => {
            emulationMenu.hidePopover();
            emulationLoadSave();
          }}
          class="px-4 py-2 cursor-pointer text-sm bg-secondary border border-border rounded-xl flex gap-2 items-center"
        >
          <FolderOpen size="20" />
          <span>Load Save</span>
        </button>
        <details
          class="relative bg-secondary rounded-xl border border-border"
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
            class="absolute mt-2 min-w-full w-max bg-card rounded-xl max-h-60 overflow-y-auto border border-surface z-10 flex flex-col"
          >
            <button
              class="flex items-center px-4 py-2 gap-2 cursor-pointer hover:bg-secondary text-sm transition-colors"
              onclick={(e) => {
                emulationShader("disabled");
                e.currentTarget.closest("details").removeAttribute("open");
              }}
            >
              No Shader
            </button>
            <button
              class="flex items-center px-4 py-2 gap-2 cursor-pointer hover:bg-secondary text-sm transition-colors"
              onclick={(e) => {
                emulationShader("4xScaleHQ.glslp");
                e.currentTarget.closest("details").removeAttribute("open");
              }}
            >
              Smooth
            </button>
            <button
              class="flex items-center px-4 py-2 gap-2 cursor-pointer hover:bg-secondary text-sm transition-colors"
              onclick={(e) => {
                emulationShader("crt-aperture.glslp");
                e.currentTarget.closest("details").removeAttribute("open");
              }}
            >
              CRT
            </button>
            <button
              class="flex items-center px-4 py-2 gap-2 cursor-pointer hover:bg-secondary text-sm transition-colors"
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
    {#if data.currentData.controls || (data.currentData.gamepadControls && isGamepadConnected)}
      <button
        popovertarget="controls"
        class="[anchor-name:--controls-button] h-9 group-data-[overlay-style=compact]:w-9 group-data-[overlay-style=default]:px-2.5 bg-card rounded-lg flex gap-1.5 items-center justify-center cursor-pointer border border-input text-sm outline-none"
      >
        <Keyboard size="16" />
        <span class="group-data-[overlay-style=compact]:hidden">Controls</span>
      </button>
      <div
        onbeforetoggle={(e) => {
          if (e.newState === "closed") {
            binding = {};
            gamepadBinding = {};
          }
        }}
        popover="auto"
        id="controls"
        bind:this={controlsMenu}
        class={"[&:popover-open]:flex flex-col bg-card rounded-xl text-foreground [position-anchor:--controls-button] group-data-[overlay-style=default]:[position-area:bottom_span-right] group-data-[overlay-style=compact]:[position-area:bottom_span-left] mt-2 z-20 p-4 border border-surface min-w-[299.117px]" +
          (binding.key || gamepadBinding.action ? " min-h-32" : "")}
      >
        {#if binding.key || gamepadBinding.action}
          <div
            class="bg-card h-full w-full absolute top-0 bottom-0 right-0 left-0 flex flex-col justify-center items-center gap-2 rounded-xl z-10"
          >
            {#if binding.key}
              <p class="text-muted">Waiting for input...</p>

              <div class="flex gap-2 items-center">
                <button
                  class="px-4 py-2 cursor-pointer text-sm bg-secondary border border-border rounded-xl"
                >
                  <KenneyKeyboardIcon key={binding.key} />
                </button>
                <ChevronRight size="20" />
                <button
                  aria-label="New keybind"
                  class="px-4 py-2 cursor-pointer text-sm bg-secondary border border-border rounded-xl"
                >
                  <div class="opacity-0 select-none">
                    <KenneyKeyboardIcon key={binding.key} />
                  </div>
                </button>
              </div>
            {:else}
              {@const activeBind =
                gamepadBinds[gamepadBinding.action] ||
                (data.currentData.gamepadControls || []).find(
                  (c) => c.action === gamepadBinding.action,
                ) ||
                {}}
              <p class="text-muted">Waiting for input...</p>
              <div class="flex gap-2 items-center">
                <button
                  class="px-4 py-2 cursor-pointer text-sm bg-secondary border border-border rounded-xl flex gap-1"
                >
                  {#if activeBind.buttons}
                    {#each activeBind.buttons as btn}
                      <KenneyGamepadIcon
                        button={btn}
                        type={activeControllerType}
                      />
                    {/each}
                  {/if}
                  {#if activeBind.axes}
                    {#each activeBind.axes as axis}
                      <KenneyGamepadIcon {axis} type={activeControllerType} />
                    {/each}
                  {/if}
                </button>
                <ChevronRight size="20" />
                <button
                  aria-label="New gamepad bind"
                  class="px-4 py-2 cursor-pointer text-sm bg-secondary border border-border rounded-xl flex gap-1"
                >
                  <div class="opacity-0 select-none flex gap-1">
                    {#if activeBind.buttons}
                      {#each activeBind.buttons as btn}
                        <KenneyGamepadIcon
                          button={btn}
                          type={activeControllerType}
                        />
                      {/each}
                    {/if}
                    {#if activeBind.axes}
                      {#each activeBind.axes as axis}
                        <KenneyGamepadIcon {axis} type={activeControllerType} />
                      {/each}
                    {/if}
                  </div>
                </button>
              </div>
            {/if}
            <p class="text-sm text-muted">(Press Esc to reset)</p>
          </div>
        {:else}
          <div class="flex gap-4 relative mb-2">
            {#if data.currentData.controls}
              <button
                onclick={() => (controlsTab = "keyboard")}
                data-active={controlsTab === "keyboard"}
                class="px-4 py-2 text-sm cursor-pointer rounded-xl whitespace-nowrap border border-border transition-colors data-[active=true]:bg-secondary flex gap-2 items-center"
              >
                <Keyboard size="20" />
                <span>Keyboard</span>
              </button>
            {/if}
            {#if data.currentData.gamepadControls && isGamepadConnected}
              <button
                onclick={() => (controlsTab = "controller")}
                data-active={controlsTab === "controller"}
                class="px-4 py-2 text-sm cursor-pointer rounded-xl whitespace-nowrap border border-border transition-colors data-[active=true]:bg-secondary flex gap-2 items-center"
              >
                <Gamepad2 size="20" />
                <span
                  >Controller{data.currentData.controllerSupport
                    ? " (Native)"
                    : ""}</span
                >
              </button>
            {/if}
          </div>

          {#if controlsTab === "keyboard"}
            {#each data.currentData.controls as control}
              <div class="flex gap-2 items-center my-1 justify-between">
                <span>{control.action}:</span>
                <div class="flex gap-2">
                  {#each control.keys as keys}
                    {#if keybinds[keys.key]}
                      <button
                        onclick={() =>
                          (binding = { key: keys.key, keyCode: keys.keyCode })}
                        class="flex items-center justify-center rounded-md cursor-pointer outline-none bg-secondary border border-border overflow-hidden hover:bg-secondary-hover transition-colors"
                      >
                        <div class="p-0.5 border-r border-border">
                          <KenneyKeyboardIcon key={keybinds[keys.key].key} />
                        </div>
                        <div class="p-0.5 opacity-50">
                          <KenneyKeyboardIcon key={keys.key} />
                        </div>
                      </button>
                    {:else}
                      <button
                        onclick={() =>
                          (binding = { key: keys.key, keyCode: keys.keyCode })}
                        class="flex items-center justify-center p-0.5 rounded-md cursor-pointer outline-none bg-secondary border border-border hover:bg-secondary-hover transition-colors"
                      >
                        <KenneyKeyboardIcon key={keys.key} />
                      </button>
                    {/if}
                  {/each}
                </div>
              </div>
            {/each}
          {:else if controlsTab === "controller" && isGamepadConnected}
            {#each data.currentData.gamepadControls as control}
              {@const activeBind = gamepadBinds[control.action] || control}
              <div class="flex gap-2 items-center my-1 justify-between">
                <span>{control.action}:</span>
                {#if gamepadBinds[control.action]}
                  <button
                    onclick={() =>
                      (gamepadBinding = { action: control.action })}
                    class="flex items-center justify-center rounded-md cursor-pointer outline-none bg-secondary border border-border overflow-hidden hover:bg-secondary-hover transition-colors"
                  >
                    <div class="p-0.5 border-r border-border flex gap-1">
                      {#if activeBind.buttons}
                        {#each activeBind.buttons as btn}
                          <KenneyGamepadIcon
                            button={btn}
                            type={activeControllerType}
                          />
                        {/each}
                      {/if}
                      {#if activeBind.axes}
                        {#each activeBind.axes as axis}
                          <KenneyGamepadIcon
                            {axis}
                            type={activeControllerType}
                          />
                        {/each}
                      {/if}
                    </div>
                    <div class="p-0.5 opacity-50 flex gap-1">
                      {#if control.buttons}
                        {#each control.buttons as btn}
                          <KenneyGamepadIcon
                            button={btn}
                            type={activeControllerType}
                          />
                        {/each}
                      {/if}
                      {#if control.axes}
                        {#each control.axes as axis}
                          <KenneyGamepadIcon
                            {axis}
                            type={activeControllerType}
                          />
                        {/each}
                      {/if}
                    </div>
                  </button>
                {:else}
                  <button
                    onclick={() =>
                      (gamepadBinding = { action: control.action })}
                    class="flex items-center justify-center p-0.5 gap-1 rounded-md cursor-pointer outline-none bg-secondary border border-border hover:bg-secondary-hover transition-colors"
                  >
                    {#if control.buttons}
                      {#each control.buttons as btn}
                        <KenneyGamepadIcon
                          button={btn}
                          type={activeControllerType}
                        />
                      {/each}
                    {/if}
                    {#if control.axes}
                      {#each control.axes as axis}
                        <KenneyGamepadIcon {axis} type={activeControllerType} />
                      {/each}
                    {/if}
                  </button>
                {/if}
              </div>
            {/each}
          {/if}
        {/if}
      </div>
    {/if}
    <button
      onclick={() => frame.requestFullscreen()}
      class="h-9 group-data-[overlay-style=compact]:w-9 group-data-[overlay-style=default]:px-2.5 bg-card rounded-lg flex gap-1.5 items-center justify-center cursor-pointer border border-input text-sm"
    >
      <Maximize size="16" />
      <span class="group-data-[overlay-style=compact]:hidden">Fullscreen</span>
    </button>
    <button
      popovertarget="recording"
      class="[anchor-name:--recording-button] h-9 group-data-[overlay-style=compact]:w-9 group-data-[overlay-style=default]:px-2.5 bg-card rounded-lg flex gap-1.5 items-center justify-center cursor-pointer border border-input text-sm"
    >
      <Video size="16" />
      <span class="group-data-[overlay-style=compact]:hidden">Record</span>
    </button>
    <div
      popover="auto"
      id="recording"
      bind:this={recordingMenu}
      class="[&:popover-open]:flex flex-col bg-card rounded-xl text-foreground [position-anchor:--recording-button]
            top-[calc(anchor(bottom)+0.5rem)] left-[calc(anchor(left))] z-20 p-4 gap-4 border border-surface"
    >
      {#if videoBlob}
        <button
          onclick={() => {
            recordingMenu.hidePopover();
            downloadVideo();
          }}
          class="px-4 py-2 cursor-pointer text-sm bg-secondary border border-border rounded-xl flex gap-2 items-center"
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
          class="px-4 py-2 cursor-pointer text-sm bg-secondary border border-border rounded-xl flex gap-2 items-center"
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
          class="px-4 py-2 cursor-pointer text-sm bg-secondary border border-border rounded-xl flex gap-2 items-center"
        >
          <Disc size="20" />
          <span>Start Recording</span>
        </button>
      {/if}
    </div>
    <button
      onclick={() => frame.contentWindow.location.reload()}
      class="h-9 group-data-[overlay-style=compact]:w-9 group-data-[overlay-style=default]:px-2.5 bg-card rounded-lg flex gap-1.5 items-center justify-center cursor-pointer border border-input text-sm"
    >
      <RotateCw size="16" />
      <span class="group-data-[overlay-style=compact]:hidden">Reload</span>
    </button>
    {#if window.opener}
      <button
        onclick={() => window.close()}
        class="h-9 group-data-[overlay-style=compact]:w-9 group-data-[overlay-style=default]:px-2.5 bg-card rounded-lg flex gap-1.5 items-center justify-center cursor-pointer border border-input text-sm"
      >
        <X size="16" />
        <span class="group-data-[overlay-style=compact]:hidden">Quit</span>
      </button>
    {/if}
  </div>
</div>
<div
  data-overlay-style={storage.settings.overlay}
  class="fixed data-[overlay-style=default]:top-17 bottom-0 right-0 left-0 h-[calc(100vh-4.25rem)] w-full flex items-center justify-center"
>
  <iframe
    bind:this={frame}
    onload={frameLoaded}
    title={data.currentData.title}
    class={"bg-background select-none max-h-full max-w-full " + aspectRatio}
    src={framePath}
    allow="display-capture; autoplay; gamepad"
    sandbox="allow-forms allow-scripts allow-same-origin allow-modals allow-pointer-lock allow-downloads"
    style="isolation: isolate; transform-style: flat;"
  ></iframe>
</div>
