<script>
  import { goto } from "$app/navigation";
  import { PUBLIC_TURNSTILE_SITE_KEY } from "$env/static/public";
  import { authClient } from "$lib/client";
  import Head from "$lib/components/Head.svelte";
  import { storage } from "$lib/storage.svelte.js";
  import { AtSign, Eye, EyeClosed, KeyRound, User, X } from "@lucide/svelte";
  import { turnstile } from "@svelte-put/cloudflare-turnstile";

  let { form } = $props();

  const session = authClient.useSession();
  let username = $state("");
  let email = $state("");
  let password = $state("");
  let confirmPassword = $state("");
  let showPassword = $state(false);
  let showConfirmPassword = $state(false);
  let turnstileToken = $state("");
  let turnstileWidgetId = $state("");
  let turnstileInstance = $state(null);
  let loading = $state(false);
  let errorMessage = $state("");

  const handleTurnstile = (e) => {
    turnstileToken = e.detail.token;
    turnstileWidgetId = e.detail.widgetId;
    turnstileInstance = e.detail.turnstile;
  };

  async function handleSignup(e) {
    e.preventDefault();

    loading = true;
    errorMessage = "";

    if (!turnstileToken) {
      errorMessage = "Please complete the Turnstile challenge";
      loading = false;
      return;
    }

    if (password !== confirmPassword) {
      errorMessage = "Passwords must match";
      loading = false;
      return;
    }

    const { data, error } = await authClient.signUp.email({
      name: "",
      email,
      password,
      username,
      storage: JSON.stringify(storage.exportData()),
      fetchOptions: {
        headers: {
          "x-captcha-response": turnstileToken,
        },
      },
    });

    if (error) {
      if (turnstileInstance && turnstileWidgetId) {
        turnstileInstance.reset(turnstileWidgetId);
        turnstileToken = "";
      }

      errorMessage = error.message || "Sign up failed";
      loading = false;
      return;
    }

    await storage.broadcastAuthChange();
    await goto("/account", { invalidateAll: true });
  }
</script>

<Head title="Sign Up" />

<div class="flex flex-col items-center justify-center px-4 my-16">
  <div
    class="w-full max-w-md p-8 bg-secondary border border-surface rounded-2xl flex flex-col gap-8"
  >
    <div class="flex flex-col gap-2 text-center">
      <h1 class="text-3xl font-bold">Create Account</h1>
      <p class="text-text-placeholder text-sm">
        Sign up with Obsidian to sync settings and game data
      </p>
    </div>

    <form class="flex flex-col gap-4" onsubmit={handleSignup}>
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
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          bind:value={password}
          required
          class="w-full h-full pl-2 pr-4 bg-transparent outline-none placeholder:text-text-placeholder"
        />
        {#if password.length > 0}
          <button
            tabindex="-1"
            type="button"
            aria-label="Toggle Visibility"
            class="mr-3 cursor-pointer shrink-0 text-text-placeholder"
            onclick={() => (showPassword = !showPassword)}
          >
            {#if showPassword}
              <Eye size="20" />
            {:else}
              <EyeClosed size="20" />
            {/if}
          </button>
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
      <div
        class="focus-within:bg-surface bg-secondary transition-colors border border-border rounded-xl items-center flex w-full h-10"
      >
        <KeyRound size="20" class="ml-3 text-text-placeholder shrink-0" />
        <input
          name="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm Password"
          bind:value={confirmPassword}
          required
          class="w-full h-full pl-2 pr-4 bg-transparent outline-none placeholder:text-text-placeholder"
        />
        {#if confirmPassword.length > 0}
          <button
            tabindex="-1"
            type="button"
            aria-label="Toggle Visibility"
            class="mr-3 cursor-pointer shrink-0 text-text-placeholder"
            onclick={() => (showConfirmPassword = !showConfirmPassword)}
          >
            {#if showConfirmPassword}
              <Eye size="20" />
            {:else}
              <EyeClosed size="20" />
            {/if}
          </button>
          <button
            tabindex="-1"
            type="button"
            aria-label="Clear Password"
            class="mr-3 cursor-pointer shrink-0 text-text-placeholder"
            onclick={() => (confirmPassword = "")}
          >
            <X size="20" />
          </button>
        {/if}
      </div>
      <p class="text-sm text-text-placeholder">
        By signing up, you agree to our <a
          href="/privacy"
          class="hover:underline">Privacy Policy</a
        >
        and <a href="/terms" class="hover:underline">Terms of Service</a> and that
        you are at least 13 years old.
      </p>
      <div
        class="h-16.75"
        use:turnstile
        turnstile-sitekey={PUBLIC_TURNSTILE_SITE_KEY}
        onturnstile={handleTurnstile}
      ></div>
      {#if errorMessage}
        <p class="text-sm text-text-placeholder">{errorMessage}</p>
      {/if}
      <button
        type="submit"
        disabled={loading}
        class="px-4 py-2 bg-surface rounded-xl border border-border w-fit disabled:opacity-50 cursor-pointer disabled:cursor-default"
      >
        <span>
          {#if loading}
            Signing Up...
          {:else}
            Sign Up
          {/if}
        </span>
      </button>
    </form>
    <p class="text-sm text-center text-text-placeholder">
      Already have an account? <a href="/account/login" class="hover:underline"
        >Log In</a
      >
    </p>
  </div>
</div>
