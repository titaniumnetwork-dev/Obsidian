<script>
  let { data } = $props();
</script>

{#if data.user}
  <p>Username</p>
  <p class="text-sm text-text-placeholder mb-4">Change your username</p>
  <p>Email</p>
  <p class="text-sm text-text-placeholder mb-4">Change your email</p>
  <p>Password</p>
  <p class="text-sm text-text-placeholder mb-4">Change your password</p>
{:else}
  <p>Obsidian Account</p>
  <p class="text-sm text-text-placeholder mb-4">
    Sign in to manage your account and sync your data.
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
