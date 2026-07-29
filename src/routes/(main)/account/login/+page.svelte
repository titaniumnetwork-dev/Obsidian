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

<div class="flex flex-col items-center justify-center px-8 mt-auto">
  <div
    class="w-full max-w-sm p-6 bg-neutral-900 border border-border rounded-radius flex flex-col gap-6"
  >
    <div class="flex flex-col gap-2 text-center">
      <p >Welcome Back</p>
      <p class="text-text-placeholder text-sm">
        Log in to sync settings and game data
      </p>
    </div>
    <form class="flex flex-col gap-4" onsubmit={handleLogin}>
      <div class="flex flex-col gap-2">
        <p class="text-sm">Email</p>
        <div
          class="bg-input/30 transition-colors border border-input rounded-lg items-center flex w-full h-9 px-2.5 gap-1.5"
        >
          <AtSign size="16" class="text-text-placeholder shrink-0" />
          <input
            name="email"
            type="email"
            bind:value={email}
            required
            class="w-full h-full text-sm bg-transparent outline-none placeholder:text-text-placeholder"
          />
          {#if email.length > 0}
            <button
              tabindex="-1"
              type="button"
              aria-label="Clear Email"
              class="cursor-pointer shrink-0 text-text-placeholder"
              onclick={() => (email = "")}
            >
              <X size="16" />
            </button>
          {/if}
        </div>
      </div>
      <div class="flex flex-col gap-2">
        <div class="flex justify-between gap-2 text-sm">
          <p>Password</p>
          <a
            class="text-text-placeholder hover:underline"
            href="/account/forgot-password">Forgot your password?</a
          >
        </div>
        <div
          class="bg-input/30 transition-colors border border-input rounded-lg items-center flex w-full h-9 px-2.5 gap-1.5"
        >
          <KeyRound size="16" class="text-text-placeholder shrink-0" />
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            bind:value={password}
            required
            class="w-full h-full text-sm bg-transparent outline-none placeholder:text-text-placeholder"
          />
          {#if password.length > 0}
            <button
              tabindex="-1"
              type="button"
              aria-label="Toggle Visibility"
              class="cursor-pointer shrink-0 text-text-placeholder"
              onclick={() => (showPassword = !showPassword)}
            >
              {#if showPassword}
                <Eye size="16" />
              {:else}
                <EyeClosed size="16" />
              {/if}
            </button>
            <button
              tabindex="-1"
              type="button"
              aria-label="Clear Password"
              class="cursor-pointer shrink-0 text-text-placeholder"
              onclick={() => (password = "")}
            >
              <X size="16" />
            </button>
          {/if}
        </div>
      </div>
      <div
        class="h-16.75"
        use:turnstile
        turnstile-sitekey={PUBLIC_TURNSTILE_SITE_KEY}
        turnstile-size="flexible"
        onturnstile={handleTurnstile}
      ></div>
      <div class="flex flex-col gap-2">
        {#if errorMessage}
          <p class="text-sm text-text-placeholder">{errorMessage}</p>
        {/if}
        <button
          type="submit"
          disabled={loading}
          class="h-9 px-2.5 bg-primary rounded-lg w-full disabled:opacity-50 cursor-pointer disabled:cursor-default text-text-inverse text-sm"
        >
          <span>
            {#if loading}
              Logging In...
            {:else}
              Login
            {/if}
          </span>
        </button>
        <p class="text-sm text-center text-text-placeholder">
          Don't have an account? <a
            href="/account/signup"
            class="hover:underline">Sign Up</a
          >
        </p>
      </div>
    </form>
  </div>
</div>
