import Atari2600 from "./assets/emulation/Atari2600.svelte";
import Atari5200 from "./assets/emulation/Atari5200.svelte";
import Atari7800 from "./assets/emulation/Atari7800.svelte";
import AtariJaguar from "./assets/emulation/AtariJaguar.svelte";
import AtariLynx from "./assets/emulation/AtariLynx.svelte";
import ColecoVision from "./assets/emulation/ColecoVision.svelte";
import Gameboy from "./assets/emulation/Gameboy.svelte";
import GameboyAdvance from "./assets/emulation/GameboyAdvance.svelte";
import GameboyColor from "./assets/emulation/GameboyColor.svelte";
import GameGear from "./assets/emulation/GameGear.svelte";
import NeoGeo from "./assets/emulation/NeoGeo.svelte";
import NeoGeoCD from "./assets/emulation/NeoGeoCD.svelte";
import NeoGeoPocket from "./assets/emulation/NeoGeoPocket.svelte";
import NeoGeoPocketColor from "./assets/emulation/NeoGeoPocketColor.svelte";
import NES from "./assets/emulation/NES.svelte";
import Nintendo64 from "./assets/emulation/Nintendo64.svelte";
import NintendoDS from "./assets/emulation/NintendoDS.svelte";
import PCEngineSuperGrafx from "./assets/emulation/PCEngineSuperGrafx.svelte";
import Playstation from "./assets/emulation/Playstation.svelte";
import Ruffle from "./assets/emulation/Ruffle.svelte";
import SegaCD from "./assets/emulation/SegaCD.svelte";
import SegaGenesis from "./assets/emulation/SegaGenesis.svelte";
import SegaMasterSystem from "./assets/emulation/SegaMasterSystem.svelte";
import SegaSaturn from "./assets/emulation/SegaSaturn.svelte";
import SNES from "./assets/emulation/SNES.svelte";
import TurboGrafx16 from "./assets/emulation/TurboGrafx16.svelte";
import VirtualBoy from "./assets/emulation/VirtualBoy.svelte";
import WonderSwan from "./assets/emulation/WonderSwan.svelte";

export const emulators = [
  {
    title: "Atari 2600",
    id: "atari-2600",
    icon: Atari2600,
    accept: ".a26,.bin",
    company: "Atari",
  },
  {
    title: "Atari 5200",
    id: "atari-5200",
    icon: Atari5200,
    accept: ".a52,.bin",
    company: "Atari",
  },
  {
    title: "Atari 7800",
    id: "atari-7800",
    icon: Atari7800,
    accept: ".a78,.bin",
    company: "Atari",
  },
  {
    title: "Atari Jaguar",
    id: "atari-jaguar",
    icon: AtariJaguar,
    accept: ".j64,.jag",
    company: "Atari",
  },
  {
    title: "Atari Lynx",
    id: "atari-lynx",
    icon: AtariLynx,
    accept: ".lnx",
    company: "Atari",
  },
  {
    title: "ColecoVision",
    id: "colecovision",
    icon: ColecoVision,
    accept: ".col,.cv",
    company: "Coleco",
  },
  {
    title: "Flash Player",
    id: "ruffle",
    icon: Ruffle,
    accept: ".swf",
    company: "Ruffle",
  },
  {
    title: "Game Boy",
    id: "gameboy",
    icon: Gameboy,
    accept: ".gb",
    company: "Nintendo",
  },
  {
    title: "Game Boy Advance",
    id: "gameboy-advance",
    icon: GameboyAdvance,
    accept: ".gba",
    company: "Nintendo",
  },
  {
    title: "Game Boy Color",
    id: "gameboy-color",
    icon: GameboyColor,
    accept: ".gbc",
    company: "Nintendo",
  },
  {
    title: "Game Gear",
    id: "game-gear",
    icon: GameGear,
    accept: ".gg",
    company: "Sega",
  },
  {
    title: "Sega Master System",
    id: "sega-master-system",
    icon: SegaMasterSystem,
    accept: ".sms",
    company: "Sega",
  },
  {
    title: "Neo Geo",
    id: "neo-geo",
    icon: NeoGeo,
    accept: ".zip",
    company: "SNK",
  },
  {
    title: "Neo Geo CD",
    id: "neo-geo-cd",
    icon: NeoGeoCD,
    accept: ".cue,.chd",
    company: "SNK",
  },
  {
    title: "Neo Geo Pocket",
    id: "neo-geo-pocket",
    icon: NeoGeoPocket,
    accept: ".ngp",
    company: "SNK",
  },
  {
    title: "Neo Geo Pocket Color",
    id: "neo-geo-pocket-color",
    icon: NeoGeoPocketColor,
    accept: ".ngc",
    company: "SNK",
  },
  {
    title: "Nintendo 64",
    id: "nintendo-64",
    icon: Nintendo64,
    accept: ".n64,.z64",
    company: "Nintendo",
  },
  {
    title: "Nintendo DS",
    id: "nintendo-ds",
    icon: NintendoDS,
    accept: ".gb",
    company: "Nintendo",
  },
  {
    title: "Nintendo Entertainment System",
    shortTitle: "NES",
    id: "nes",
    icon: NES,
    accept: ".fds,.nes,.unif,.unf",
    company: "Nintendo",
  },
  {
    title: "PC Engine SuperGrafx",
    id: "pc-engine-supergrafx",
    icon: PCEngineSuperGrafx,
    accept: ".sgx",
    company: "NEC",
  },
  {
    title: "Playstation",
    id: "Playstation",
    icon: Playstation,
    accept: ".cue,.iso,.chd,.pbp,.toc,.m3u",
    company: "Sony",
  },
  {
    title: "Sega CD",
    id: "sega-cd",
    icon: SegaCD,
    accept: ".cue,.chd,.iso",
    company: "Sega",
  },
  {
    title: "Sega Genesis",
    id: "sega-genesis",
    icon: SegaGenesis,
    accept: ".md,.smd,.gen,.bin",
    company: "Sega",
  },
  {
    title: "Sega Saturn",
    id: "sega-saturn",
    icon: SegaSaturn,
    accept: ".cue,.chd,.iso",
    company: "Sega",
  },
  {
    title: "Super Nintendo Entertainment System",
    shortTitle: "SNES",
    id: "snes",
    icon: SNES,
    accept: ".smc,.fig,.sfc,.gd3,.gd7,.dx2,.bsx,.swc",
    company: "Nintendo",
  },
  {
    title: "TurboGrafx-16",
    id: "turbografx-16",
    icon: TurboGrafx16,
    accept: ".pce",
    company: "NEC",
  },
  {
    title: "TurboGrafx-CD",
    id: "turbografx-cd",
    icon: TurboGrafx16,
    accept: ".cue,.chd",
    company: "NEC",
  },
  {
    title: "Virtual Boy",
    id: "virtual-boy",
    icon: VirtualBoy,
    accept: ".vb",
    company: "Nintendo",
  },
  {
    title: "WonderSwan",
    id: "wonderswan",
    icon: WonderSwan,
    accept: ".ws",
    company: "Bandai",
  },
  {
    title: "WonderSwan Color",
    id: "wonderswan-color",
    icon: WonderSwan,
    accept: ".wsc",
    company: "Bandai",
  },
];

export const companies = [
  "Atari",
  "Bandai",
  "Coleco",
  "NEC",
  "Nintendo",
  "Ruffle",
  "Sega",
  "SNK",
  "Sony",
];

export const routes = emulators.map((emu) => emu.id);
