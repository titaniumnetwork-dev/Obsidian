<script>
  import { enhance } from "$app/forms";
  import Head from "$lib/components/Head.svelte";
  import { storage } from "$lib/storage.svelte.js";
  import { AtSign, KeyRound, X } from "@lucide/svelte";

  let { form } = $props();

  let email = $state("");
  let password = $state("");

  $effect(() => {
    if (form?.email) {
      email = form.email;
    }
  });
</script>

<Head title="Login" />

<div class="flex flex-col items-center justify-center px-4 my-16">
  <div
    class="w-full max-w-md p-8 bg-secondary border border-surface rounded-2xl flex flex-col gap-8"
  >
    <div class="flex flex-col gap-2 text-center">
      <h1 class="text-3xl font-bold tracking-tight">Welcome Back</h1>
      <p class="text-text-placeholder text-sm">
        Log in to sync settings and game data
      </p>
    </div>
    <form
      class="flex flex-col gap-4"
      method="POST"
      use:enhance={() => {
        return async ({ result, update }) => {
          if (result.type === "redirect") {
            storage.loadStorage(storage.catalog).then(() => {
              storage.broadcastAuthChange();
            });
          }
          update();
        };
      }}
    >
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
      {#if form?.error}
        <p class="text-sm text-text-placeholder">{form.error}</p>
      {/if}
      <button
        type="submit"
        class="px-4 py-2 bg-surface rounded-xl cursor-pointer border border-border w-fit"
      >
        <span>Login</span>
      </button>
    </form>
    <p class="text-sm text-center text-text-placeholder">
      Don't have an account? <a href="/account/sign-up" class="hover:underline"
        >Sign Up</a
      >
    </p>
  </div>
</div>
