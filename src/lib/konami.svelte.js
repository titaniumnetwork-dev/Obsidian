import { goto } from "$app/navigation";
import { Sparkles } from "@lucide/svelte";
import { toast } from "svelte-sonner";
import { storage } from "./storage.svelte";

const konamiCode = [
  "arrowup",
  "arrowup",
  "arrowdown",
  "arrowdown",
  "arrowleft",
  "arrowright",
  "arrowleft",
  "arrowright",
  "b",
  "a",
];

let keyPresses = [];

if (typeof window !== "undefined") {
  window.addEventListener("keydown", (e) => {
    keyPresses.push(e.key.toLowerCase());

    if (keyPresses.length > konamiCode.length) {
      keyPresses.shift();
    }

    const isMatch = keyPresses.join(",") === konamiCode.join(",");

    if (isMatch) {
      if (!storage.hiddenThemes.includes("3kh0")) {
        storage.addHiddenTheme("3kh0");
        storage.updateTheme("3kh0");
        toast("Theme Unlocked", {
          description: "You unlocked the 3kh0 theme!",
          position: "bottom-center",
          icon: Sparkles,
          action: {
            label: "Settings",
            onClick: () => goto("/settings/appearance"),
          },
        });
      }
      keyPresses = [];
    }
  });
}
