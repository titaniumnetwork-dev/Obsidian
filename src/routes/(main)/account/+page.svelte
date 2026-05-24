<script>
  import { enhance } from "$app/forms";
  import Head from "$lib/components/Head.svelte";
  import { formatPlaytime } from "$lib/formatUtils.js";
  import { storage } from "$lib/storage.svelte.js";
  import {
    LayoutGrid,
    Loader2,
    LogOut,
    PieChart,
    Play,
    Settings,
    Upload,
    User,
  } from "@lucide/svelte";

  let { data } = $props();
  let isUploading = $state(false);
  let formError = $state("");

  async function formatImage(file, sizeWidth, sizeHeight) {
    if (!file) return null;

    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise((r) => (img.onload = r));

    const canvas = document.createElement("canvas");
    canvas.width = sizeWidth;
    canvas.height = sizeHeight;

    const scale = Math.max(sizeWidth / img.width, sizeHeight / img.height);
    const scaledW = img.width * scale;
    const scaledH = img.height * scale;
    const x = (sizeWidth - scaledW) / 2;
    const y = (sizeHeight - scaledH) / 2;

    canvas.getContext("2d").drawImage(img, x, y, scaledW, scaledH);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(img.src);
        resolve(blob);
      }, "image/webp");
    });
  }

  let favoritesData = $derived(
    storage.favorites
      .map((id) => storage.library.find((item) => item.id === id))
      .filter(Boolean),
  );
</script>

<Head title={data.user.name + "'s Account"} />

<div class="flex flex-col items-center justify-center px-4 my-16">
  <div
    class="w-full max-w-lg p-8 bg-secondary border border-surface rounded-2xl flex flex-col gap-8"
  >
    <div class="flex flex-col items-center gap-4 text-center">
      <form
        method="POST"
        action="?/uploadAvatar"
        enctype="multipart/form-data"
        use:enhance={async ({ formData, cancel }) => {
          const file = formData.get("avatar");

          if (file && file.size > 0) {
            isUploading = true;
            formError = "";

            try {
              const webpBlob = await formatImage(file, 80, 80);
              formData.set("avatar", webpBlob, "avatar.webp");
            } catch (e) {
              formError = "Failed to process image.";
              cancel();
            }
          }

          return async ({ update }) => {
            isUploading = false;
            await update();
          };
        }}
      >
        <label
          class="relative group block w-20 h-20 rounded-2xl overflow-hidden cursor-pointer border border-border bg-surface"
        >
          {#if data.user.avatar_url}
            <img
              class="w-full h-full object-cover"
              src={"/cdn/avatars/" + data.user.avatar_url}
              alt="Profile"
              draggable="false"
            />
          {:else}
            <div
              class="w-full h-full flex items-center justify-center text-text-placeholder"
            >
              <User size="32" />
            </div>
          {/if}
          <div
            class="absolute inset-0 flex items-center justify-center transition-colors {isUploading
              ? ' bg-(--color-overlay)'
              : ' hover:bg-(--color-overlay)'}"
          >
            <div
              class="transition-opacity {isUploading
                ? 'opacity-100'
                : 'opacity-0 group-hover:opacity-100'}"
            >
              {#if isUploading}
                <Loader2 size="24" class="animate-spin" />
              {:else}
                <Upload size="24" />
              {/if}
            </div>
          </div>
          <input
            type="file"
            name="avatar"
            accept="image/*"
            class="hidden"
            onchange={(e) => {
              if (e.target.files.length > 0) {
                e.target.form.requestSubmit();
              }
            }}
          />
        </label>
      </form>
      <div class="flex flex-col">
        <h1 class="text-2xl font-bold">@{data.user.name}</h1>
        <p class="text-text-placeholder">{data.user.email}</p>
      </div>
      {#if formError}
        <p class="text-sm text-text-placeholder">{formError}</p>
      {/if}
    </div>
    <div class="flex flex-col gap-2">
      <div>
        <p>Stats</p>
        <p class="text-sm text-text-placeholder">
          Information about your activity
        </p>
      </div>
      <div class="flex gap-4">
        <div
          class="flex justify-center items-center bg-surface rounded-xl px-4 py-2 gap-2 text-sm border border-border whitespace-nowrap w-full"
        >
          <LayoutGrid size="20" />
          <span>{storage.installed.length + " Installed"}</span>
        </div>
        <div
          class="flex justify-center items-center bg-surface rounded-xl px-4 py-2 gap-2 text-sm border border-border whitespace-nowrap w-full"
        >
          <Play size="20" />
          <span>{Object.keys(storage.playTime).length + " Played"}</span>
        </div>
        <div
          class="flex justify-center items-center bg-surface rounded-xl px-4 py-2 gap-2 text-sm border border-border whitespace-nowrap w-full"
        >
          <PieChart size="20" />
          <span
            >{Object.keys(storage.playTime).length
              ? formatPlaytime(
                  Object.entries(storage.playTime)
                    .map((item) => item[1].playTime)
                    .reduce((acc, curr) => acc + curr, 0),
                )
              : "No Playtime"}</span
          >
        </div>
      </div>
    </div>
    <div class="flex flex-col gap-2">
      <div>
        <p>Cloud Saves</p>
        <p class="text-sm text-text-placeholder">25 MB / 3180 MB Used</p>
      </div>
      <progress
        class="h-4 w-full [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-bar]:bg-surface [&::-webkit-progress-value]:bg-primary [&::-webkit-progress-bar]:border [&::-webkit-progress-bar]:border-border"
        max="100"
        value="25"
      ></progress>
    </div>
    <div class="flex gap-4 justify-center">
      <a
        href="/settings/account"
        class="px-4 py-2 bg-surface rounded-xl flex gap-2 items-center border border-border"
      >
        <Settings size="20" />
        <p>Settings</p>
      </a>
      <form
        use:enhance={async () => {
          await storage.flushSync();

          return async ({ update }) => {
            storage.loadStorage(storage.catalog).then(() => {
              storage.broadcastAuthChange();
            });

            await update();
          };
        }}
        method="POST"
        action="/account/logout"
      >
        <button
          type="submit"
          class="px-4 py-2 bg-surface rounded-xl flex gap-2 items-center border border-border cursor-pointer"
        >
          <LogOut size="20" />
          <span>Log Out</span>
        </button>
      </form>
    </div>
  </div>
</div>
