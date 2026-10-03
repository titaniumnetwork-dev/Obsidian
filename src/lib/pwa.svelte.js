import { toast } from "svelte-sonner";
import { BadgeCheck } from "@lucide/svelte";
import { goto } from "$app/navigation";
import { storage } from "#lib/storage.svelte";

export const pwa = $state({
  installPrompt: null,
});

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    pwa.installPrompt = e;
  });

  window.addEventListener("appinstalled", () => {
    pwa.installPrompt = null;

    storage.settings.libraryMode = true;
    if (window.location.pathname === "/") {
      goto("/library");
    }
    toast("App Installed", {
      description:
        "Library mode automatically enabled.",
      position: "bottom-center",
      icon: BadgeCheck,
      action: {
        label: "Settings",
        onClick: () => goto("/settings/general"),
      },
    });
  });
}
