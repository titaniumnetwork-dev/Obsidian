<script>
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import { authClient } from "$lib/client";
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
  <div class="flex flex-col gap-4 max-w-xl">
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
      <div>
        <p>Profile Picture</p>
        <p class="text-sm text-text-placeholder mb-2">Upload a new pfp</p>
      </div>
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
      {#if avatarMessage}
        <p class="text-sm text-text-placeholder mt-2">{avatarMessage}</p>
      {/if}
    </form>
    <form onsubmit={handleUpdateUsername} class="flex flex-col gap-2">
      <div>
        <p>Username</p>
        <p class="text-sm text-text-placeholder mb-2">
          Change your display name
        </p>
      </div>
      <div class="flex gap-4">
        <div
          class="focus-within:bg-surface bg-secondary transition-colors border border-border rounded-xl items-center flex flex-1 h-10"
        >
          <User size="20" class="ml-3 text-text-placeholder" />
          <input
            placeholder="Username"
            name="username"
            type="text"
            bind:value={editUsername}
            required
            class="w-full h-full pl-3 pr-4 bg-transparent outline-none placeholder:text-text-placeholder text-sm"
          />
          {#if editUsername.length > 0}
            <button
              tabindex="-1"
              type="button"
              class="mr-3 shrink-0 text-text-placeholder cursor-pointer"
              onclick={() => (editUsername = "")}
            >
              <X size="16" />
            </button>
          {/if}
        </div>
        <button
          type="submit"
          disabled={usernameLoading ||
            editUsername === data.user.username ||
            editUsername.trim() === ""}
          class="px-4 py-2 bg-surface border border-border rounded-xl text-sm disabled:opacity-50 cursor-pointer disabled:cursor-default transition-opacity"
        >
          <span>{usernameLoading ? "Updating..." : "Update"}</span>
        </button>
      </div>
      {#if usernameMessage}
        <p class="text-sm text-text-placeholder">{usernameMessage}</p>
      {/if}
    </form>
    <form onsubmit={handleUpdateEmail} class="flex flex-col gap-2">
      <div>
        <p>Email</p>
        <p class="text-sm text-text-placeholder mb-2">
          Change your login email
        </p>
      </div>
      <div class="flex gap-4">
        <div
          class="focus-within:bg-surface bg-secondary transition-colors border border-border rounded-xl items-center flex flex-1 h-10"
        >
          <AtSign size="20" class="ml-3 text-text-placeholder shrink-0" />
          <input
            placeholder="Email"
            name="email"
            type="email"
            bind:value={editEmail}
            required
            class="w-full h-full pl-3 pr-4 bg-transparent outline-none placeholder:text-text-placeholder text-sm"
          />
          {#if editEmail.length > 0}
            <button
              tabindex="-1"
              type="button"
              class="mr-3 shrink-0 text-text-placeholder cursor-pointer"
              onclick={() => (editEmail = "")}
            >
              <X size="16" />
            </button>
          {/if}
        </div>
        <button
          type="submit"
          disabled={emailLoading ||
            editEmail === data.user.email ||
            editEmail.trim() === ""}
          class="px-4 py-2 bg-surface border border-border rounded-xl text-sm disabled:opacity-50 cursor-pointer disabled:cursor-default transition-opacity shrink-0"
        >
          <span>{emailLoading ? "Updating..." : "Update"}</span>
        </button>
      </div>
      {#if emailMessage}
        <p class="text-sm text-text-placeholder">{emailMessage}</p>
      {/if}
    </form>
    <form onsubmit={handleUpdatePassword} class="flex flex-col gap-2">
      <div>
        <p>Password</p>
        <p class="text-sm text-text-placeholder mb-2">Set a new password</p>
      </div>

      <div class="flex gap-4">
        <div
          class="focus-within:bg-surface bg-secondary transition-colors border border-border rounded-xl items-center flex flex-1 h-10"
        >
          <KeyRound size="20" class="ml-3 text-text-placeholder shrink-0" />
          <input
            placeholder="Current Password"
            name="oldPassword"
            type={showOldPassword ? "text" : "password"}
            bind:value={oldPassword}
            required
            class="w-full h-full pl-3 pr-4 bg-transparent outline-none placeholder:text-text-placeholder text-sm"
          />
          {#if oldPassword.length > 0}
            <button
              tabindex="-1"
              type="button"
              aria-label="Toggle Visibility"
              class="mr-3 cursor-pointer shrink-0 text-text-placeholder"
              onclick={() => (showOldPassword = !showOldPassword)}
            >
              {#if showOldPassword}
                <Eye size="20" />
              {:else}
                <EyeClosed size="20" />
              {/if}
            </button>
            <button
              tabindex="-1"
              type="button"
              class="mr-3 shrink-0 text-text-placeholder cursor-pointer"
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
          class="focus-within:bg-surface bg-secondary transition-colors border border-border rounded-xl items-center flex flex-1 h-10"
        >
          <KeyRound size="20" class="ml-3 text-text-placeholder shrink-0" />
          <input
            placeholder="New Password"
            name="newPassword"
            type={showEditPassword ? "text" : "password"}
            bind:value={editPassword}
            required
            class="w-full h-full pl-3 pr-4 bg-transparent outline-none placeholder:text-text-placeholder text-sm"
          />
          {#if editPassword.length > 0}
            <button
              tabindex="-1"
              type="button"
              aria-label="Toggle Visibility"
              class="mr-3 cursor-pointer shrink-0 text-text-placeholder"
              onclick={() => (showEditPassword = !showEditPassword)}
            >
              {#if showEditPassword}
                <Eye size="20" />
              {:else}
                <EyeClosed size="20" />
              {/if}
            </button>
            <button
              tabindex="-1"
              type="button"
              class="mr-3 shrink-0 text-text-placeholder cursor-pointer"
              onclick={() => (editPassword = "")}
            >
              <X size="16" />
            </button>
          {/if}
        </div>
        <button
          type="submit"
          disabled={passwordLoading || !oldPassword || !editPassword}
          class="px-4 py-2 bg-surface border border-border rounded-xl text-sm disabled:opacity-50 cursor-pointer disabled:cursor-default transition-opacity shrink-0"
        >
          <span>{passwordLoading ? "Updating..." : "Update"}</span>
        </button>
      </div>
      {#if passwordMessage}
        <p class="text-sm text-text-placeholder">{passwordMessage}</p>
      {/if}
    </form>
    <form onsubmit={handleDeleteAccount} class="flex flex-col gap-2">
      <div>
        <p>Delete Account</p>
        <p class="text-sm text-text-placeholder mb-2">
          Permanently delete your account
        </p>
      </div>
      <div class="flex gap-4">
        <div
          class="focus-within:bg-surface bg-secondary transition-colors border border-border rounded-xl items-center flex flex-1 h-10"
        >
          <KeyRound size="20" class="ml-3 text-text-placeholder shrink-0" />
          <input
            placeholder="Password"
            name="deletePassword"
            type={showDeletePassword ? "text" : "password"}
            bind:value={deletePassword}
            required
            class="w-full h-full pl-3 pr-4 bg-transparent outline-none placeholder:text-text-placeholder text-sm"
          />
          {#if deletePassword.length > 0}
            <button
              tabindex="-1"
              type="button"
              aria-label="Toggle Visibility"
              class="mr-3 cursor-pointer shrink-0 text-text-placeholder"
              onclick={() => (showDeletePassword = !showDeletePassword)}
            >
              {#if showDeletePassword}
                <Eye size="20" />
              {:else}
                <EyeClosed size="20" />
              {/if}
            </button>
            <button
              tabindex="-1"
              type="button"
              class="mr-3 shrink-0 text-text-placeholder cursor-pointer"
              onclick={() => (deletePassword = "")}
            >
              <X size="16" />
            </button>
          {/if}
        </div>
        <button
          type="submit"
          disabled={deleteLoading || !deletePassword}
          class="px-4 py-2 bg-surface rounded-xl flex gap-2 items-center border border-border cursor-pointer transition-colors text-sm w-fit disabled:opacity-50 disabled:cursor-default"
        >
          <Trash2 size="16" />
          <span>{deleteLoading ? "Deleting..." : "Delete Account"}</span>
        </button>
      </div>
      {#if deleteMessage}
        <p class="text-sm text-text-placeholder">{deleteMessage}</p>
      {/if}
    </form>
  </div>
{:else}
  <p>Obsidian Account</p>
  <p class="text-sm text-text-placeholder mb-4">
    Sign in to manage your account and sync your data
  </p>
  <div class="flex gap-4">
    <a
      href="/account/login"
      class="px-4 py-2 text-sm bg-surface rounded-xl flex items-center gap-2 border border-border"
      >Login</a
    >
    <a
      href="/account/sign-up"
      class="px-4 py-2 text-sm bg-surface rounded-xl flex items-center gap-2 border border-border"
      >Sign Up</a
    >
  </div>
{/if}
