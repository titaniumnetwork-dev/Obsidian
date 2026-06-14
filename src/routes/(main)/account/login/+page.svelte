<script>
  import { goto } from "$app/navigation";
  import { PUBLIC_TURNSTILE_SITE_KEY } from "$env/static/public";
  import { authClient } from "$lib/client";
  import Head from "$lib/components/Head.svelte";
  import { storage } from "$lib/storage.svelte.js";
  import { AtSign, Eye, EyeClosed, KeyRound, X } from "@lucide/svelte";
  import { turnstile } from "@svelte-put/cloudflare-turnstile";

  let { form } = $props();

  const session = authClient.useSession();
  let email = $state("");
  let password = $state("");
  let showPassword = $state(false);
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

  async function handleLogin(e) {
    e.preventDefault();

    loading = true;
    errorMessage = "";

    if (!turnstileToken) {
      errorMessage = "Please complete the Turnstile challenge";
      loading = false;
      return;
    }

    const { data, error } = await authClient.signIn.email({
      email,
      password,
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

      errorMessage = error.message || "Sign in failed";
      loading = false;
      return;
    }

    await storage.broadcastAuthChange();
    await goto("/account", { invalidateAll: true });
  }
</script>

<Head title="Login" />

<div class="flex flex-col items-center justify-center px-4 my-16">
  <div
    class="w-full max-w-md p-8 bg-secondary border border-surface rounded-2xl flex flex-col gap-8"
  >
    <div class="flex flex-col gap-2 text-center">
      <h1 class="text-3xl font-bold">Welcome Back</h1>
      <p class="text-text-placeholder text-sm">
        Log in to sync settings and game data
      </p>
    </div>
    <form class="flex flex-col gap-4" onsubmit={handleLogin}>
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
            Logging In...
          {:else}
            Login
          {/if}
        </span>
      </button>
    </form>
    <p class="text-sm text-center text-text-placeholder">
      Don't have an account? <a href="/account/sign-up" class="hover:underline"
        >Sign Up</a
      >
    </p>
  </div>
</div>
