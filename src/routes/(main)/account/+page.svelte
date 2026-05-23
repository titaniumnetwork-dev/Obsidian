<script>
  import { enhance } from "$app/forms";
  import Head from "$lib/components/Head.svelte";
  import { storage } from "$lib/storage.svelte.js";
  import {
    Loader2,
    LogOut,
    Settings,
    Trash2,
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
</script>

<Head title={data.user.name + "'s Account"} />

<div class="flex flex-col items-center justify-center px-4 my-16">
  <div
    class="w-full max-w-xl p-8 bg-secondary border border-surface rounded-2xl flex flex-col gap-8"
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
            class="absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity text-white {isUploading
              ? 'opacity-100'
              : 'opacity-0 group-hover:opacity-100'}"
          >
            {#if isUploading}
              <Loader2 size="24" class="animate-spin" />
            {:else}
              <Upload size="24" />
            {/if}
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
        <h1 class="text-2xl font-bold tracking-tight">@{data.user.name}</h1>
        <p class="text-text-placeholder">{data.user.email}</p>
      </div>
      {#if formError}
        <p class="text-sm text-text-placeholder">{formError}</p>
      {/if}
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

      <form method="POST" action="?/delete" use:enhance>
        <button
          type="submit"
          class="px-4 py-2 bg-surface rounded-xl flex gap-2 items-center border border-border cursor-pointer"
        >
          <Trash2 size="20" />
          <span>Delete Account</span>
        </button>
      </form>
    </div>
  </div>
</div>
