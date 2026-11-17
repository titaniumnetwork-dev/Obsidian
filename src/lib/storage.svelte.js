import { tags as catalogTagOrder } from "#lib/tags";

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function sanitizeBindMap(map) {
  if (!map || typeof map !== "object") return {};
  for (const id in map) {
    if (!Array.isArray(map[id])) map[id] = [];
  }
  return map;
}

class StorageManager {
  tabID = crypto.randomUUID();
  active = $state({});
  installed = $state([]);
  library = $state([]);
  catalog = $state([]);
  tags = $state([]);
  keybinds = $state({});
  gamepadBinds = $state({});
  theme = $state("Dark");
  rounding = $state("Default");
  hiddenThemes = $state([]);
  settings = $state({
    sidebarCollapsed: false,
    sidebarSort: "alphabetical",
    sortBy: "alphabetical",
    maskTitle: "",
    maskIcon: "",
    autoMask: false,
    panicKey: "",
    panicURL: "",
    aspect: "",
    closePrevention: false,
    customCSS: "",
    cards: "default",
    overlay: "default",
    launch: "newTab",
    libraryMode: false,
    ads: true,
  });
  favorites = $state([]);
  isLoaded = $state(false);
  playTime = $state({});
  libraryModeDismissed = $state(false);

  constructor() {
    if (typeof BroadcastChannel !== "undefined") {
      this.storageChannel = new BroadcastChannel("storage-sync");
      this.storageChannel.onmessage = ({ data: msg }) => {
        switch (msg.type) {
          case "updateSetting":
            this.updateSetting(msg.settingKey, msg.value, false);
            break;
          case "setKeybind": {
            const { id, from, to, toKeyCode, toKey } = msg.entry;
            this.setKeybind(msg.ID, from, to, toKeyCode, toKey, id, false);
            break;
          }
          case "removeKeybind":
            this.removeKeybind(msg.ID, msg.bindId, false);
            break;
          case "setGamepadBind": {
            const { id, trigger, to, toKeyCode, toKey } = msg.entry;
            this.setGamepadBind(
              msg.ID,
              trigger,
              to,
              toKeyCode,
              toKey,
              id,
              false,
            );
            break;
          }
          case "removeGamepadBind":
            this.removeGamepadBind(msg.ID, msg.bindId, false);
            break;
          case "clearGameKeybinds":
            this.clearGameKeybinds(msg.ID, msg.bindType, false);
            break;
          case "updateTheme":
            this.updateTheme(msg.theme, false);
            break;
          case "updateRounding":
            this.updateRounding(msg.rounding, false);
            break;
          case "addFavorite":
            this.addFavorite(msg.ID, false);
            break;
          case "removeFavorite":
            this.removeFavorite(msg.ID, false);
            break;
          case "install":
            this.install(msg.ID, false);
            break;
          case "uninstall":
            this.uninstall(msg.ID, false);
            break;
          case "setActive":
            this.setActive(msg.ID, false);
            break;
          case "deleteActive":
            this.quitActive(msg.ID, false);
            break;
          case "resumeActiveRequest":
            if (msg.tabID === this.tabID) this.resumeActive(msg.ID, false);
            break;
          case "addHiddenTheme":
            this.addHiddenTheme(msg.theme, false);
            break;
          case "updatePlaytime":
            this.updatePlayTime(msg.ID, msg.start, msg.end, false);
            break;
          case "setLibraryModeDismissed":
            this.setLibraryModeDismissed(true, false);
            break;
        }
      };
    }
  }

  broadcast(share, payload) {
    if (share) this.storageChannel?.postMessage($state.snapshot(payload));
  }

  async loadStorage(catalogData) {
    this.tags = catalogTagOrder;

    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) this.theme = storedTheme;
    document.documentElement.dataset.theme = this.theme;

    this.rounding = localStorage.getItem("rounding") || "Default";
    document.documentElement.dataset.rounding = this.rounding;

    this.keybinds = sanitizeBindMap(readJSON("keybinds", {}));
    this.gamepadBinds = sanitizeBindMap(readJSON("gamepadBinds", {}));
    this.hiddenThemes = readJSON("hiddenThemes", []);
    this.playTime = readJSON("playTime", {});
    this.installed = readJSON("installed", []);
    this.favorites = readJSON("favorites", []);

    this.catalog = catalogData.filter(
      (item) => !item.hidden || this.installed.includes(item.id),
    );
    this.library = this.catalog.filter((item) =>
      this.installed.includes(item.id),
    );

    this.settings = { ...this.settings, ...readJSON("settings", {}) };
    localStorage.setItem("settings", JSON.stringify(this.settings));

    const dismissed = localStorage.getItem("libraryModeDismissed");
    if (dismissed) this.libraryModeDismissed = Boolean(dismissed);

    this.isLoaded = true;

    if (
      window.location.pathname.startsWith("/launch/") &&
      this.settings.launch === "currentTab"
    ) {
      const id = window.location.pathname.split("/launch/")[1]?.split("/")[0];
      if (id) this.startPlayTimeTicker(id, Date.now());
    }
  }

  startPlayTimeTicker(ID, now) {
    this.active[ID] = {
      ...this.active[ID],
      lastTick: now,
      startTime: now,
      intervalId: setInterval(() => {
        if (this.active[ID]) {
          const tickNow = Date.now();
          this.updatePlayTime(ID, this.active[ID].lastTick, tickNow);
          this.active[ID].lastTick = tickNow;
        }
      }, 1000),
    };
  }

  updateSetting(settingKey, value, share = true) {
    this.settings = { ...this.settings, [settingKey]: value };
    localStorage.setItem("settings", JSON.stringify(this.settings));
    this.broadcast(share, { type: "updateSetting", settingKey, value });
  }

  setKeybind(ID, from, to, toKeyCode, toKey = "", bindId = null, share = true) {
    this.keybinds[ID] ??= [];
    const list = this.keybinds[ID];
    const idx = list.findIndex(
      (b) => b.id === bindId || (!bindId && b.from === from),
    );
    const entry = {
      id: idx >= 0 ? list[idx].id : bindId || crypto.randomUUID(),
      from,
      to,
      toKeyCode,
      toKey,
    };

    if (idx >= 0) list[idx] = entry;
    else list.push(entry);

    localStorage.setItem("keybinds", JSON.stringify(this.keybinds));
    this.broadcast(share, { type: "setKeybind", ID, entry });
  }

  removeKeybind(ID, bindId, share = true) {
    if (!Array.isArray(this.keybinds[ID])) return;
    this.keybinds[ID] = this.keybinds[ID].filter((b) => b.id !== bindId);
    localStorage.setItem("keybinds", JSON.stringify(this.keybinds));
    this.broadcast(share, { type: "removeKeybind", ID, bindId });
  }

  setGamepadBind(
    ID,
    trigger,
    to,
    toKeyCode,
    toKey = "",
    bindId = null,
    share = true,
  ) {
    this.gamepadBinds[ID] ??= [];
    const list = this.gamepadBinds[ID];
    const idx = list.findIndex((b) => b.id === bindId);
    const entry = {
      id: idx >= 0 ? list[idx].id : bindId || crypto.randomUUID(),
      trigger,
      to,
      toKeyCode,
      toKey,
    };

    if (idx >= 0) list[idx] = entry;
    else list.push(entry);

    localStorage.setItem("gamepadBinds", JSON.stringify(this.gamepadBinds));
    this.broadcast(share, { type: "setGamepadBind", ID, entry });
  }

  removeGamepadBind(ID, bindId, share = true) {
    if (!Array.isArray(this.gamepadBinds[ID])) return;
    this.gamepadBinds[ID] = this.gamepadBinds[ID].filter(
      (b) => b.id !== bindId,
    );
    localStorage.setItem("gamepadBinds", JSON.stringify(this.gamepadBinds));
    this.broadcast(share, { type: "removeGamepadBind", ID, bindId });
  }

  clearGameKeybinds(ID, bindType = "all", share = true) {
    if (bindType === "all" || bindType === "keyboard") {
      this.keybinds[ID] = [];
      localStorage.setItem("keybinds", JSON.stringify(this.keybinds));
    }
    if (bindType === "all" || bindType === "controller") {
      this.gamepadBinds[ID] = [];
      localStorage.setItem("gamepadBinds", JSON.stringify(this.gamepadBinds));
    }
    this.broadcast(share, { type: "clearGameKeybinds", ID, bindType });
  }

  executeThemeSwap(theme, share) {
    this.theme = theme;
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
    this.broadcast(share, { type: "updateTheme", theme });
  }

  updateTheme(theme, share = true) {
    if (!document.startViewTransition) {
      this.executeThemeSwap(theme, share);
      return;
    }
    document.startViewTransition(() => this.executeThemeSwap(theme, share));
  }

  executeRoundingSwap(rounding, share) {
    this.rounding = rounding;
    document.documentElement.dataset.rounding = rounding;
    localStorage.setItem("rounding", rounding);
    this.broadcast(share, { type: "updateRounding", rounding });
  }

  updateRounding(rounding, share = true) {
    if (!document.startViewTransition) {
      this.executeRoundingSwap(rounding, share);
      return;
    }
    document.startViewTransition(() =>
      this.executeRoundingSwap(rounding, share),
    );
  }

  addFavorite(ID, share = true) {
    if (this.favorites.includes(ID)) return;
    this.favorites.push(ID);
    localStorage.setItem("favorites", JSON.stringify(this.favorites));
    this.broadcast(share, { type: "addFavorite", ID });
  }

  removeFavorite(ID, share = true) {
    this.favorites = this.favorites.filter((item) => item !== ID);
    localStorage.setItem("favorites", JSON.stringify(this.favorites));
    this.broadcast(share, { type: "removeFavorite", ID });
  }

  install(ID, share = true) {
    if (this.installed.includes(ID)) return;
    this.installed.push(ID);
    localStorage.setItem("installed", JSON.stringify(this.installed));
    this.library = this.catalog.filter((item) =>
      this.installed.includes(item.id),
    );
    this.broadcast(share, { type: "install", ID });
  }

  uninstall(ID, share = true) {
    this.installed = this.installed.filter((item) => item !== ID);
    localStorage.setItem("installed", JSON.stringify(this.installed));
    this.library = this.catalog.filter((item) =>
      this.installed.includes(item.id),
    );

    if (this.keybinds[ID]) {
      delete this.keybinds[ID];
      localStorage.setItem("keybinds", JSON.stringify(this.keybinds));
    }
    if (this.gamepadBinds[ID]) {
      delete this.gamepadBinds[ID];
      localStorage.setItem("gamepadBinds", JSON.stringify(this.gamepadBinds));
    }
    if (this.favorites.includes(ID)) {
      this.removeFavorite(ID, false);
    }

    this.broadcast(share, { type: "uninstall", ID });
  }

  setActive(ID, share = false) {
    const now = Date.now();
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    const { width, height } = window.screen;
    const launchMode = this.settings.launch === "newTab" ? "_blank" : "_self";

    this.active[ID] = {
      win: window.open(
        `/launch/${ID}`,
        launchMode,
        standalone ? `width=${width},height=${height},left=0,top=0` : null,
      ),
      tabID: this.tabID,
      initialPath: `/launch/${ID}`,
      time: now,
    };

    this.updatePlayTime(ID, now, now);
    this.startPlayTimeTicker(ID, now);
    this.broadcast(share, { type: "setActive", ID });
  }

  resumeActive(ID, share = false) {
    const entry = this.active[ID];
    entry?.win?.focus();
    if (entry?.tabID) {
      this.broadcast(share, {
        type: "resumeActiveRequest",
        ID,
        tabID: entry.tabID,
      });
    }
  }

  quitActive(ID, share = false) {
    const entry = this.active[ID];
    if (entry) {
      clearInterval(entry.intervalId);
      if (this.settings.launch === "newTab") entry.win?.close();
      this.updatePlayTime(ID, entry.lastTick, Date.now());
      delete this.active[ID];
    }
    this.broadcast(share, { type: "deleteActive", ID });
  }

  addHiddenTheme(theme, share = true) {
    this.hiddenThemes.push(theme);
    localStorage.setItem("hiddenThemes", JSON.stringify(this.hiddenThemes));
    this.broadcast(share, { type: "addHiddenTheme", theme });
  }

  updatePlayTime(ID, start, end, share = true) {
    const existingTime = this.playTime[ID]?.playTime || 0;
    this.playTime[ID] = {
      playTime: existingTime + (end - start),
      lastPlayed: end,
    };
    localStorage.setItem("playTime", JSON.stringify(this.playTime));
    this.broadcast(share, { type: "updatePlaytime", ID, start, end });
  }

  setLibraryModeDismissed(dismissed, share = true) {
    this.libraryModeDismissed = dismissed;
    localStorage.setItem("libraryModeDismissed", String(dismissed));
    this.broadcast(share, { type: "setLibraryModeDismissed" });
  }
}

export const storage = new StorageManager();
