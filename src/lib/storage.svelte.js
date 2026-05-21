import { tags as catalogTagOrder } from "$lib/tags";

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
  hiddenThemes = $state([]);
  settings = $state({
    sidebarStyle: "default",
    sidebarSearch: false,
    category: "all",
    sortBy: "alphabetical",
    tagFilter: "all",
    playingFirst: false,
    maskTitle: "",
    maskIcon: "",
    panicKey: "",
    panicURL: "",
    aspect: "",
    closePrevention: false,
    customCSS: "",
    cards: "default",
  });
  favorites = $state([]);
  isLoaded = $state(false);
  playTime = $state({});

  constructor() {
    if (
      typeof window !== "undefined" &&
      typeof BroadcastChannel !== "undefined"
    ) {
      this.storageChannel = new BroadcastChannel("storage-sync");
      this.storageChannel.onmessage = (e) => {
        switch (e.data.type) {
          case "updateSetting":
            this.updateSetting(e.data.settingKey, e.data.value, false);
            break;
          case "updateKeybind":
            this.updateKeybind(
              e.data.ID,
              e.data.key,
              e.data.keyCode,
              e.data.replaceKey,
              false,
            );
            break;
          case "removeKeybind":
            this.removeKeybind(e.data.ID, e.data.key, false);
            break;
          case "updateGamepadBind":
            this.updateGamepadBind(
              e.data.ID,
              e.data.action,
              e.data.bindData,
              false,
            );
            break;
          case "removeGamepadBind":
            this.removeGamepadBind(e.data.ID, e.data.action, false);
            break;
          case "updateTheme":
            this.updateTheme(e.data.theme, false);
            break;
          case "addFavorite":
            this.addFavorite(e.data.ID, false);
            break;
          case "removeFavorite":
            this.removeFavorite(e.data.ID, false);
            break;
          case "install":
            this.install(e.data.ID, false);
            break;
          case "uninstall":
            this.uninstall(e.data.ID, false);
            break;
          case "setActive":
            this.setActive(e.data.ID, false);
            break;
          case "deleteActive":
            this.quitActive(e.data.ID, false);
            break;
          case "resumeActiveRequest":
            if (e.data.tabID === this.tabID) {
              this.resumeActive(e.data.ID, false);
            }
            break;
          case "addHiddenTheme":
            this.addHiddenTheme(e.data.theme, false);
            break;
          case "updatePlaytime":
            this.updatePlayTime(e.data.ID, e.data.start, e.data.end, false);
            break;
        }
      };
    }
  }
  loadStorage(catalogData) {
    this.catalog = catalogData;
    this.tags = catalogTagOrder;

    const storedInstalled = localStorage.getItem("installed");
    const storedSettings = localStorage.getItem("settings");
    const storedFavorites = localStorage.getItem("favorites");
    const storedTheme = localStorage.getItem("theme");
    const storedKeybinds = localStorage.getItem("keybinds");
    const storedGamepadBinds = localStorage.getItem("gamepadBinds");
    const storedHiddenThemes = localStorage.getItem("hiddenThemes");
    const storedPlayTime = localStorage.getItem("playTime");

    if (storedTheme) {
      this.theme = storedTheme;
    }
    document.documentElement.dataset.theme = this.theme;

    if (storedKeybinds) {
      try {
        this.keybinds = JSON.parse(storedKeybinds);
      } catch (e) {
        console.error("Failed to parse keybinds", e);
      }
    }

    if (storedGamepadBinds) {
      try {
        this.gamepadBinds = JSON.parse(storedGamepadBinds);
      } catch (e) {
        console.error("Failed to parse gamepad binds", e);
      }
    }

    if (storedHiddenThemes) {
      try {
        this.hiddenThemes = JSON.parse(storedHiddenThemes);
      } catch (e) {
        console.error("Failed to parse hidden themes", e);
      }
    }

    if (storedPlayTime) {
      try {
        this.playTime = JSON.parse(storedPlayTime);
      } catch (e) {
        console.error("Failed to parse play time", e);
      }
    }

    if (storedInstalled) {
      try {
        this.installed = JSON.parse(storedInstalled);
      } catch (e) {
        console.error("Failed to parse installed", e);
      }
    }

    this.library = this.catalog.filter((item) =>
      this.installed.includes(item.id),
    );

    if (storedSettings) {
      try {
        this.settings = JSON.parse(storedSettings);
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }

    if (this.settings.tagFilter === "all") {
      this.settings.tagFilter = catalogTagOrder;
    }

    if (storedFavorites) {
      try {
        this.favorites = JSON.parse(storedFavorites);
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    }

    this.isLoaded = true;
  }
  updateSetting(settingKey, value, share = true) {
    this.settings = { ...this.settings, [settingKey]: value };
    localStorage.setItem("settings", JSON.stringify(this.settings));

    if (share && this.storageChannel) {
      this.storageChannel.postMessage({
        type: "updateSetting",
        settingKey,
        value,
      });
    }
  }
  updateKeybind(ID, key, keyCode, replaceKey, share = true) {
    if (!this.keybinds[ID]) {
      this.keybinds[ID] = {};
    }
    this.keybinds[ID][key] = {
      key: replaceKey,
      keyCode,
    };
    localStorage.setItem("keybinds", JSON.stringify(this.keybinds));

    if (share && this.storageChannel) {
      this.storageChannel.postMessage({
        type: "updateKeybind",
        ID,
        key,
        keyCode,
        replaceKey,
      });
    }
  }
  removeKeybind(ID, key, share = true) {
    if (this.keybinds[ID]) {
      delete this.keybinds[ID][key];
      localStorage.setItem("keybinds", JSON.stringify(this.keybinds));

      if (share && this.storageChannel) {
        this.storageChannel.postMessage({ type: "removeKeybind", ID, key });
      }
    }
  }
  updateGamepadBind(ID, action, bindData, share = true) {
    if (!this.gamepadBinds[ID]) {
      this.gamepadBinds[ID] = {};
    }
    this.gamepadBinds[ID][action] = bindData;
    localStorage.setItem("gamepadBinds", JSON.stringify(this.gamepadBinds));

    if (share && this.storageChannel) {
      this.storageChannel.postMessage({
        type: "updateGamepadBind",
        ID,
        action,
        bindData,
      });
    }
  }
  removeGamepadBind(ID, action, share = true) {
    if (this.gamepadBinds[ID]) {
      delete this.gamepadBinds[ID][action];
      localStorage.setItem("gamepadBinds", JSON.stringify(this.gamepadBinds));

      if (share && this.storageChannel) {
        this.storageChannel.postMessage({
          type: "removeGamepadBind",
          ID,
          action,
        });
      }
    }
  }
  executeThemeSwap(theme, share) {
    this.theme = theme;
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);

    if (share && this.storageChannel) {
      this.storageChannel.postMessage({ type: "updateTheme", theme });
    }
  }
  updateTheme(theme, share = true) {
    if (!document.startViewTransition) {
      this.executeThemeSwap(theme, share);
      return;
    }

    document.startViewTransition(() => {
      this.executeThemeSwap(theme, share);
    });
  }
  addFavorite(ID, share = true) {
    if (!this.favorites.includes(ID)) {
      this.favorites.push(ID);
      localStorage.setItem("favorites", JSON.stringify(this.favorites));

      if (share && this.storageChannel) {
        this.storageChannel.postMessage({ type: "addFavorite", ID });
      }
    }
  }
  removeFavorite(ID, share = true) {
    this.favorites = this.favorites.filter((item) => item !== ID);
    localStorage.setItem("favorites", JSON.stringify(this.favorites));

    if (share && this.storageChannel) {
      this.storageChannel.postMessage({ type: "removeFavorite", ID });
    }
  }
  install(ID, share = true) {
    if (!this.installed.includes(ID)) {
      this.installed.push(ID);
      localStorage.setItem("installed", JSON.stringify(this.installed));
      this.library = this.catalog.filter((item) =>
        this.installed.includes(item.id),
      );

      if (share && this.storageChannel) {
        this.storageChannel.postMessage({ type: "install", ID });
      }
    }
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
      this.removeFavorite(ID);
    }

    if (share && this.storageChannel) {
      this.storageChannel.postMessage({ type: "uninstall", ID });
    }
  }
  setActive(ID, share = false) {
    const now = Date.now();

    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    const width = window.screen.width;
    const height = window.screen.height;

    this.active[ID] = {
      win: window.open(
        "/launch/" + ID,
        "_blank",
        standalone ? `width=${width},height=${height},left=0,top=0` : null,
      ),
      tabID: storage.tabID,
      initialPath: "/launch/" + ID,
      time: Date.now(),
      lastTick: now,
      startTime: now,
    };

    this.updatePlayTime(ID, this.active[ID].lastTick, now);

    this.active[ID].intervalId = setInterval(() => {
      if (this.active[ID]) {
        const tickNow = Date.now();
        this.updatePlayTime(ID, this.active[ID].lastTick, tickNow);
        this.active[ID].lastTick = tickNow;
      }
    }, 1000);

    if (share && this.storageChannel) {
      this.storageChannel.postMessage({
        type: "setActive",
        ID,
      });
    }
  }
  resumeActive(ID, share = false) {
    const entry = this.active[ID];

    if (entry?.win) {
      entry.win.focus();
    }

    if (share && entry?.tabID && this.storageChannel) {
      this.storageChannel.postMessage({
        type: "resumeActiveRequest",
        ID,
        tabID: entry.tabID,
      });
    }
  }
  quitActive(ID, share = false) {
    const entry = this.active[ID];

    clearInterval(entry.intervalId);

    if (entry?.win) {
      entry.win.close();
    }

    this.updatePlayTime(ID, entry.lastTick, Date.now());

    delete this.active[ID];

    if (share && this.storageChannel) {
      this.storageChannel.postMessage({
        type: "deleteActive",
        ID,
      });
    }
  }
  addHiddenTheme(theme, share = true) {
    this.hiddenThemes.push(theme);
    localStorage.setItem("hiddenThemes", JSON.stringify(this.hiddenThemes));

    if (share && this.storageChannel) {
      this.storageChannel.postMessage({
        type: "addHiddenTheme",
        theme,
      });
    }
  }
  updatePlayTime(ID, start, end, share = true) {
    const existingTime = this.playTime[ID]?.playTime || 0;
    this.playTime[ID] = {
      playTime: existingTime + (end - start),
      lastPlayed: end,
    };
    localStorage.setItem("playTime", JSON.stringify(this.playTime));

    if (share && this.storageChannel) {
      this.storageChannel.postMessage({
        type: "updatePlaytime",
        ID,
        start,
        end,
      });
    }
  }
}

export const storage = new StorageManager();
