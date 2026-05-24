import Gameboy from "$lib/assets/emulation/gb.svelte";
import GameboyAdvance from "$lib/assets/emulation/gba.svelte";
import N64 from "$lib/assets/emulation/n64.svelte";
import NDS from "$lib/assets/emulation/nds.svelte";
import NES from "$lib/assets/emulation/nes.svelte";
import SNES from "$lib/assets/emulation/snes.svelte";
import VirtualBoy from "$lib/assets/emulation/vb.svelte";
import Ruffle from "./assets/emulation/ruffle.svelte";

export const emulators = [
  {
    title: "Nintendo 64",
    id: "nintendo-64",
    icon: N64,
  },
  {
    title: "Game Boy",
    id: "gameboy",
    icon: Gameboy,
  },
  {
    title: "Game Boy Advance",
    id: "gameboy-advance",
    icon: GameboyAdvance,
  },
  {
    title: "Nintendo DS",
    id: "nintendo-ds",
    icon: NDS,
  },
  {
    title: "Nintendo Entertainment System",
    id: "nintendo-entertainment-system",
    icon: NES,
  },
  {
    title: "Super Nintendo Entertainment System",
    id: "super-nintendo-entertainment-system",
    icon: SNES,
  },
  {
    title: "Virtual Boy",
    id: "virtual-boy",
    icon: VirtualBoy,
  },
];

export const flashEmulators = [
  {
    title: "Ruffle",
    id: "ruffle",
    icon: Ruffle,
  },
];
