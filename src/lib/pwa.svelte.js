import { storage } from "#lib/storage.svelte";
import { goto } from "$app/navigation";
import { BadgeCheck } from "@lucide/svelte";
import { toast } from "svelte-sonner";

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

    storage.updateSetting("libraryMode", true);
    if (window.location.pathname === "/") {
      goto("/library");
    }
    storage.setLibraryModeDismissed(true);
    toast("App Installed", {
      description: "Library mode automatically enabled.",
      position: "bottom-center",
      icon: BadgeCheck,
      action: {
        label: "Settings",
        onClick: () => goto("/settings/general"),
      },
    });
  });
}
