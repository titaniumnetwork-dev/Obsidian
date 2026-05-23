<script>
  import { enhance } from "$app/forms";
  import Head from "$lib/components/Head.svelte";
  import { storage } from "$lib/storage.svelte.js";
  import { AtSign, KeyRound, User, X } from "@lucide/svelte";

  let { form } = $props();

  let username = $state("");
  let email = $state("");
  let password = $state("");

  $effect(() => {
    if (form?.username) {
      username = form.username;
    }
    if (form?.email) {
      email = form.email;
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
</script>

<Head title="Sign Up" />

<div class="flex flex-col items-center justify-center px-4 my-16">
  <div
    class="w-full max-w-md p-8 bg-secondary border border-surface rounded-2xl flex flex-col gap-8"
  >
    <div class="flex flex-col gap-2 text-center">
      <h1 class="text-3xl font-bold tracking-tight">Create Account</h1>
      <p class="text-text-placeholder text-sm">
        Sign up with Obsidian to sync settings and game data
      </p>
    </div>

    <form class="flex flex-col gap-4" method="POST" use:enhance>
      <div
        class="focus-within:bg-surface bg-secondary transition-colors border border-border rounded-xl items-center flex w-full h-10"
      >
        <User size="20" class="ml-3 text-text-placeholder shrink-0" />
        <input
          name="username"
          type="text"
          placeholder="Username"
          bind:value={username}
          required
          class="w-full h-full pl-2 pr-4 bg-transparent outline-none placeholder:text-text-placeholder"
        />
        {#if username.length > 0}
          <button
            tabindex="-1"
            type="button"
            aria-label="Clear Username"
            class="mr-3 cursor-pointer shrink-0 text-text-placeholder"
            onclick={() => (username = "")}
          >
            <X size="20" />
          </button>
        {/if}
      </div>

      <div
        class="focus-within:bg-surface bg-secondary transition-colors border border-border rounded-xl items-center flex w-full h-10"
      >
        <AtSign size="20" class="ml-3 text-text-placeholder shrink-0" />
        <input
          name="email"
          type="email"
          placeholder="Email"
          bind:value={email}
          required
          class="w-full h-full pl-2 pr-4 bg-transparent outline-none placeholder:text-text-placeholder"
        />
        {#if email.length > 0}
          <button
            tabindex="-1"
            type="button"
            aria-label="Clear Email"
            class="mr-3 cursor-pointer shrink-0 text-text-placeholder"
            onclick={() => (email = "")}
          >
            <X size="20" />
          </button>
        {/if}
      </div>

      <div
        class="focus-within:bg-surface bg-secondary transition-colors border border-border rounded-xl items-center flex w-full h-10"
      >
        <KeyRound size="20" class="ml-3 text-text-placeholder shrink-0" />
        <input
          name="password"
          type="password"
          placeholder="Password"
          bind:value={password}
          required
          class="w-full h-full pl-2 pr-4 bg-transparent outline-none placeholder:text-text-placeholder"
        />
        {#if password.length > 0}
          <button
            tabindex="-1"
            type="button"
            aria-label="Clear Password"
            class="mr-3 cursor-pointer shrink-0 text-text-placeholder"
            onclick={() => (password = "")}
          >
            <X size="20" />
          </button>
        {/if}
      </div>

      <input
        type="hidden"
        name="local_storage"
        value={JSON.stringify(storage.exportData())}
      />

      <p class="text-sm text-text-placeholder">
        By signing up, you agree to our <a
          href="/privacy"
          class="hover:underline">Privacy Policy</a
        >
        and <a href="/terms" class="hover:underline">Terms of Service</a> and that
        you are at least 13 years old.
      </p>
      {#if form?.error}
        <p class="text-sm text-text-placeholder">{form.error}</p>
      {/if}
      <button
        type="submit"
        class="px-4 py-2 bg-surface rounded-xl cursor-pointer border border-border w-fit"
      >
        <span>Sign Up</span>
      </button>
    </form>
    <p class="text-sm text-center text-text-placeholder">
      Already have an account? <a href="/account/login" class="hover:underline"
        >Log In</a
      >
    </p>
  </div>
</div>
