<script>
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import { authClient } from "$lib/client";
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

  let { data, form } = $props();

  const session = authClient.useSession();
  let isUploading = $state(false);
  let formError = $state("");
  let loggingOut = $state(false);

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

  function formatStorage(bytes) {
    if (bytes === 0) return "0";
    if (bytes < 1048576) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    }
    return `${(bytes / 1048576).toFixed(2)} MB`;
  }
  let displayUsed = $derived(formatStorage(storage.cloudUsedBytes));
  let displayLimit = $derived(
    `${(storage.cloudLimitBytes / 1048576).toFixed(2)} MB`,
  );
  let storagePercentage = $derived(
    (storage.cloudUsedBytes / storage.cloudLimitBytes) * 100,
  );
</script>

<Head title={data.user.username + "'s Account"} />

<div class="flex flex-col items-center justify-center px-4 mt-auto">
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
          {#if data.user.image}
            <img
              class="w-full h-full object-cover"
              src={"/cdn/avatars/" + data.user.image}
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
        {#if form?.field === "avatar"}
          {#if form?.message}
            <p class="text-sm text-text-placeholder">
              {form.message}
            </p>
          {/if}
        {/if}
      </form>
      <div class="flex flex-col">
        <h1
          data-admin={data.user.role === "admin"}
          class="text-2xl font-bold relative data-[admin=true]:after:content-['Admin'] data-[admin=true]:after:absolute data-[admin=true]:after:ml-2 data-[admin=true]:after:top-1/2 data-[admin=true]:after:-translate-y-1/2 data-[admin=true]:after:px-2 data-[admin=true]:after:bg-primary data-[admin=true]:after:text-text-inverse data-[admin=true]:after:border data-[admin=true]:after:border-border-primary data-[admin=true]:after:text-xs data-[admin=true]:after:rounded-full data-[admin=true]:after:font-normal"
        >
          @{data.user.username}
        </h1>
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
          Joined on {new Intl.DateTimeFormat("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }).format(new Date(data.user.createdAt))}
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
        <p class="text-sm text-text-placeholder">
          {#if storage.cloudUsedBytes === 0}
            Empty
          {:else}
            {displayUsed} / {displayLimit}
          {/if}
        </p>
      </div>
      <progress
        class="appearance-none [&::-webkit-progress-bar]:overflow-hidden h-4 w-full [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-bar]:bg-surface [&::-webkit-progress-value]:bg-primary [&::-webkit-progress-bar]:border [&::-webkit-progress-bar]:border-border [&::-webkit-progress-value]:transition-[width]"
        max={storage.cloudLimitBytes}
        value={storage.cloudUsedBytes}
      ></progress>
      {#if storagePercentage > 90}
        <p class="text-xs text-text-placeholder">
          You are running out of cloud space!
        </p>
      {/if}
    </div>
    {#if data.user.role === "admin"}
      <div class="flex flex-col gap-2">
        <div>
          <p>Admin Panel</p>
          <p class="text-sm text-text-placeholder">Privileged access only</p>
        </div>
        <div class="flex gap-4">
          <a
            href="/admin/users"
            class="px-4 py-2 bg-surface rounded-xl border border-border"
          >
            Users
          </a>
        </div>
      </div>
    {/if}
    <div class="flex gap-4 justify-center">
      <a
        href="/settings/account"
        class="px-4 py-2 bg-surface rounded-xl flex gap-2 items-center border border-border"
      >
        <Settings size="20" />
        <p>Settings</p>
      </a>
      <button
        onclick={async () => {
          loggingOut = true;

          await storage.flushSync();

          await authClient.signOut({
            fetchOptions: {
              onSuccess: async () => {
                loggingOut = false;

                await storage.broadcastAuthChange();
                await goto("/account/login", { invalidateAll: true });
              },
            },
          });
        }}
        disabled={loggingOut}
        class="px-4 py-2 bg-surface rounded-xl flex gap-2 items-center border border-border disabled:opacity-50 cursor-pointer disabled:cursor-default"
      >
        <LogOut size="20" />
        {#if loggingOut}
          <span>Logging Out...</span>
        {:else}
          <span>Log Out</span>
        {/if}
      </button>
    </div>
  </div>
</div>
