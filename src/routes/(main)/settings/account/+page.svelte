<script>
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import { authClient } from "$lib/client";
  import Button from "$lib/components/ui/Button.svelte";
  import Card from "$lib/components/ui/Card.svelte";
  import {
    AtSign,
    Eye,
    EyeClosed,
    KeyRound,
    Loader2,
    Trash2,
    Upload,
    User,
    X,
  } from "@lucide/svelte";

  let { data, form } = $props();

  const session = authClient.useSession();

  let editUsername = $state("");
  let editEmail = $state("");
  let oldPassword = $state("");
  let editPassword = $state("");
  let deletePassword = $state("");

  let showOldPassword = $state(false);
  let showEditPassword = $state(false);
  let showDeletePassword = $state(false);

  let isUploading = $state(false);
  let usernameLoading = $state(false);
  let emailLoading = $state(false);
  let passwordLoading = $state(false);
  let deleteLoading = $state(false);

  let avatarMessage = $state("");
  let usernameMessage = $state("");
  let emailMessage = $state("");
  let passwordMessage = $state("");
  let deleteMessage = $state("");

  $effect(() => {
    if (data.user) {
      editUsername = data.user.username;
      editEmail = data.user.email;
    }
  });

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

  async function handleUpdateUsername(e) {
    e.preventDefault();
    usernameLoading = true;
    usernameMessage = "";

    const { error } = await authClient.updateUser({
      username: editUsername,
    });

    if (error) {
      usernameMessage = error.message || "Updating username failed";
    } else {
      await invalidateAll();
    }
    usernameLoading = false;
  }

  async function handleUpdateEmail(e) {
    e.preventDefault();
    emailLoading = true;
    emailMessage = "";

    const { error } = await authClient.changeEmail({
      newEmail: editEmail,
    });

    if (error) {
      emailMessage = error.message || "Updating email failed";
    } else {
      await invalidateAll();
    }
    emailLoading = false;
  }

  async function handleUpdatePassword(e) {
    e.preventDefault();
    passwordLoading = true;
    passwordMessage = "";

    const { error } = await authClient.changePassword({
      newPassword: editPassword,
      currentPassword: oldPassword,
      revokeOtherSessions: true,
    });

    if (error) {
      passwordMessage = error.message || "Updating password failed";
    } else {
      passwordMessage = "Password updated successfully";
      oldPassword = "";
      editPassword = "";
    }
    passwordLoading = false;
  }

  async function handleDeleteAccount(e) {
    e.preventDefault();
    deleteLoading = true;
    deleteMessage = "";

    const { error } = await authClient.deleteUser({
      password: deletePassword,
    });

    if (error) {
      deleteMessage = error.message || "Deleting account failed";
      deleteLoading = false;
    } else {
      await invalidateAll();
    }
  }
</script>

{#if data.user}
  <div class="grid grid-cols-2 gap-4">
    <Card size="sm">
      <div>
        <p>Profile Picture</p>
        <p class="text-sm text-muted">Upload a new pfp</p>
      </div>
      <form
        method="POST"
        action="?/uploadAvatar"
        enctype="multipart/form-data"
        use:enhance={async ({ formData, cancel }) => {
          const file = formData.get("avatar");
          avatarMessage = "";

          if (file && file.size > 0) {
            isUploading = true;
            try {
              const webpBlob = await formatImage(file, 80, 80);
              formData.set("avatar", webpBlob, "avatar.webp");
            } catch (e) {
              avatarMessage = "Failed to process image.";
              isUploading = false;
              cancel();
            }
          }

          return async ({ update, result }) => {
            isUploading = false;
            if (result.type === "failure") {
              avatarMessage =
                result.data?.error || result.data?.message || "Upload failed";
            }
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
                <Loader2 size="20" class="animate-spin" />
              {:else}
                <Upload size="20" />
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
        {#if avatarMessage}
          <p class="text-sm text-muted mt-2">{avatarMessage}</p>
        {/if}
      </form>
    </Card>
    <Card size="sm">
      <div>
        <p>Username</p>
        <p class="text-sm text-muted">Change your display name</p>
      </div>
      <form onsubmit={handleUpdateUsername}>
        <div class="flex gap-4">
          <div
            class="focus-within:bg-secondary bg-card transition-colors border border-border rounded-xl items-center flex flex-1 h-10"
          >
            <User size="16" class="ml-3 text-muted" />
            <input
              placeholder="Username"
              name="username"
              type="text"
              bind:value={editUsername}
              required
              class="w-full h-full pl-3 pr-4 bg-transparent outline-none placeholder:text-muted text-sm"
            />
            {#if editUsername.length > 0}
              <button
                tabindex="-1"
                type="button"
                class="mr-3 shrink-0 text-muted cursor-pointer"
                onclick={() => (editUsername = "")}
              >
                <X size="16" />
              </button>
            {/if}
          </div>
          <Button
            variant="outline"
            type="submit"
            disabled={usernameLoading ||
              editUsername === data.user.username ||
              editUsername.trim() === ""}
          >
            <span>{usernameLoading ? "Updating..." : "Update"}</span>
          </Button>
        </div>
        {#if usernameMessage}
          <p class="text-sm text-muted">{usernameMessage}</p>
        {/if}
      </form>
    </Card>
    <Card size="sm">
      <div>
        <p>Email</p>
        <p class="text-sm text-muted">Change your login email</p>
      </div>
      <form onsubmit={handleUpdateEmail}>
        <div class="flex gap-4">
          <div
            class="focus-within:bg-secondary bg-card transition-colors border border-border rounded-xl items-center flex flex-1 h-10"
          >
            <AtSign size="20" class="ml-3 text-muted shrink-0" />
            <input
              placeholder="Email"
              name="email"
              type="email"
              bind:value={editEmail}
              required
              class="w-full h-full pl-3 pr-4 bg-transparent outline-none placeholder:text-muted text-sm"
            />
            {#if editEmail.length > 0}
              <button
                tabindex="-1"
                type="button"
                class="mr-3 shrink-0 text-muted cursor-pointer"
                onclick={() => (editEmail = "")}
              >
                <X size="16" />
              </button>
            {/if}
          </div>
          <Button
            variant="outline"
            type="submit"
            disabled={emailLoading ||
              editEmail === data.user.email ||
              editEmail.trim() === ""}
          >
            <span>{emailLoading ? "Updating..." : "Update"}</span>
          </Button>
        </div>
        {#if emailMessage}
          <p class="text-sm text-muted">{emailMessage}</p>
        {/if}
      </form>
    </Card>
    <Card size="sm">
      <div>
        <p>Password</p>
        <p class="text-sm text-muted">Set a new password</p>
      </div>
      <form onsubmit={handleUpdatePassword}>
        <div class="flex gap-4">
          <div
            class="focus-within:bg-secondary bg-card transition-colors border border-border rounded-xl items-center flex flex-1 h-10"
          >
            <KeyRound size="20" class="ml-3 text-muted shrink-0" />
            <input
              placeholder="Current Password"
              name="oldPassword"
              type={showOldPassword ? "text" : "password"}
              bind:value={oldPassword}
              required
              class="w-full h-full pl-3 pr-4 bg-transparent outline-none placeholder:text-muted text-sm"
            />
            {#if oldPassword.length > 0}
              <button
                tabindex="-1"
                type="button"
                aria-label="Toggle Visibility"
                class="mr-3 cursor-pointer shrink-0 text-muted"
                onclick={() => (showOldPassword = !showOldPassword)}
              >
                {#if showOldPassword}
                  <Eye size="16" />
                {:else}
                  <EyeClosed size="16" />
                {/if}
              </button>
              <button
                tabindex="-1"
                type="button"
                class="mr-3 shrink-0 text-muted cursor-pointer"
                onclick={() => (oldPassword = "")}
              >
                <X size="16" />
              </button>
            {/if}
          </div>
          <div class="px-4 py-2 opacity-0 pointer-events-none text-sm">
            Update
          </div>
        </div>
        <div class="flex gap-4 mt-2">
          <div
            class="focus-within:bg-secondary bg-card transition-colors border border-border rounded-xl items-center flex flex-1 h-10"
          >
            <KeyRound size="20" class="ml-3 text-muted shrink-0" />
            <input
              placeholder="New Password"
              name="newPassword"
              type={showEditPassword ? "text" : "password"}
              bind:value={editPassword}
              required
              class="w-full h-full pl-3 pr-4 bg-transparent outline-none placeholder:text-muted text-sm"
            />
            {#if editPassword.length > 0}
              <button
                tabindex="-1"
                type="button"
                aria-label="Toggle Visibility"
                class="mr-3 cursor-pointer shrink-0 text-muted"
                onclick={() => (showEditPassword = !showEditPassword)}
              >
                {#if showEditPassword}
                  <Eye size="16" />
                {:else}
                  <EyeClosed size="16" />
                {/if}
              </button>
              <button
                tabindex="-1"
                type="button"
                class="mr-3 shrink-0 text-muted cursor-pointer"
                onclick={() => (editPassword = "")}
              >
                <X size="16" />
              </button>
            {/if}
          </div>
          <Button
            variant="outline"
            type="submit"
            disabled={passwordLoading || !oldPassword || !editPassword}
          >
            <span>{passwordLoading ? "Updating..." : "Update"}</span>
          </Button>
        </div>
        {#if passwordMessage}
          <p class="text-sm text-muted">{passwordMessage}</p>
        {/if}
      </form>
    </Card>
    <Card size="sm">
      <div>
        <p>Delete Account</p>
        <p class="text-sm text-muted">Permanently delete your account</p>
      </div>
      <form onsubmit={handleDeleteAccount}>
        <div class="flex gap-4">
          <div
            class="focus-within:bg-secondary bg-card transition-colors border border-border rounded-xl items-center flex flex-1 h-10"
          >
            <KeyRound size="20" class="ml-3 text-muted shrink-0" />
            <input
              placeholder="Password"
              name="deletePassword"
              type={showDeletePassword ? "text" : "password"}
              bind:value={deletePassword}
              required
              class="w-full h-full pl-3 pr-4 bg-transparent outline-none placeholder:text-muted text-sm"
            />
            {#if deletePassword.length > 0}
              <button
                tabindex="-1"
                type="button"
                aria-label="Toggle Visibility"
                class="mr-3 cursor-pointer shrink-0 text-muted"
                onclick={() => (showDeletePassword = !showDeletePassword)}
              >
                {#if showDeletePassword}
                  <Eye size="16" />
                {:else}
                  <EyeClosed size="16" />
                {/if}
              </button>
              <button
                tabindex="-1"
                type="button"
                class="mr-3 shrink-0 text-muted cursor-pointer"
                onclick={() => (deletePassword = "")}
              >
                <X size="16" />
              </button>
            {/if}
          </div>
          <Button
            variant="outline"
            type="submit"
            disabled={deleteLoading || !deletePassword}
          >
            <Trash2 size="16" />
            <span>{deleteLoading ? "Deleting..." : "Delete Account"}</span>
          </Button>
        </div>
        {#if deleteMessage}
          <p class="text-sm text-muted">{deleteMessage}</p>
        {/if}
      </form>
    </Card>
  </div>
{/if}
