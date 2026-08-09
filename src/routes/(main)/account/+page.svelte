<script>
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import { authClient } from "$lib/client";
  import Head from "$lib/components/Head.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Card from "$lib/components/ui/Card.svelte";
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
  <Card>
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
          class="relative group block w-16 h-16 rounded-[10px] overflow-hidden cursor-pointer border border-border bg-secondary"
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
              class="w-full h-full flex items-center justify-center text-muted"
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
            <p class="text-sm text-muted">
              {form.message}
            </p>
          {/if}
        {/if}
      </form>
      <div class="flex flex-col">
        <p>{data.user.username}</p>
        <p class="text-sm text-muted">{data.user.email}</p>
      </div>
      {#if formError}
        <p class="text-sm text-muted">{formError}</p>
      {/if}
    </div>
    <div class="flex flex-col gap-2">
      <div>
        <p>Stats</p>
        <p class="text-sm text-muted">
          Joined on {new Intl.DateTimeFormat("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }).format(new Date(data.user.createdAt))}
        </p>
      </div>
      <div class="flex gap-4">
        <Button variant="outline" class="whitespace-nowrap cursor-default">
          <LayoutGrid size="16" />
          <span>{storage.installed.length + " Installed"}</span>
        </Button>
        <Button
          variant="outline" class="whitespace-nowrap cursor-default"
        >
          <Play size="16" />
          <span>{Object.keys(storage.playTime).length + " Played"}</span>
        </Button>
        <Button
          variant="outline" class="whitespace-nowrap cursor-default"
        >
          <PieChart size="16" />
          <span
            >{Object.keys(storage.playTime).length
              ? formatPlaytime(
                  Object.entries(storage.playTime)
                    .map((item) => item[1].playTime)
                    .reduce((acc, curr) => acc + curr, 0),
                )
              : "No Playtime"}</span
          >
        </Button>
      </div>
    </div>
    <div class="flex flex-col gap-2">
      <div>
        <p>Cloud Saves</p>
        <p class="text-sm text-muted">
          {#if storage.cloudUsedBytes === 0}
            Empty
          {:else}
            {displayUsed} / {displayLimit}
          {/if}
        </p>
      </div>
      <progress
        class="appearance-none [&::-webkit-progress-bar]:overflow-hidden h-4 w-full [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-bar]:bg-secondary [&::-webkit-progress-value]:bg-primary [&::-webkit-progress-bar]:border [&::-webkit-progress-bar]:border-border [&::-webkit-progress-value]:transition-[width]"
        max={storage.cloudLimitBytes}
        value={storage.cloudUsedBytes}
      ></progress>
      {#if storagePercentage > 90}
        <p class="text-xs text-muted">You are running out of cloud space!</p>
      {/if}
    </div>
    {#if data.user.role === "admin"}
      <div class="flex flex-col gap-2">
        <div>
          <p>Admin Panel</p>
          <p class="text-sm text-muted">Privileged access only</p>
        </div>
        <div class="flex gap-4">
          <Button variant="outline" href="/admin/users">Users</Button>
        </div>
      </div>
    {/if}
    <div class="flex gap-4 justify-center">
      <Button variant="outline" href="/settings/account">
        <Settings size="16" />
        <p>Settings</p>
      </Button>
      <Button
        variant="outline"
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
      >
        <LogOut size="16" />
        {#if loggingOut}
          <span>Logging Out...</span>
        {:else}
          <span>Log Out</span>
        {/if}
      </Button>
    </div>
  </Card>
</div>
