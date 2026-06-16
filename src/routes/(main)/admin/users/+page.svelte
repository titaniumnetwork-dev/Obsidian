<script>
  import { goto } from "$app/navigation";
  import { authClient } from "$lib/client";
  import Head from "$lib/components/Head.svelte";
  import { storage } from "$lib/storage.svelte";
  import {
    ChevronLeft,
    ChevronRight,
    CircleOff,
    Eye,
    Gavel,
    Trash,
  } from "@lucide/svelte";
  import { onMount } from "svelte";

  const pageSize = 10;
  let currentPage = $state(1);
  let usersList = $state([]);
  let totalUsers = $state(0);
  let totalPages = $state(0);
  let isLoading = $state(true);
  let errorMessage = $state("");

  async function loadUsers(page) {
    isLoading = true;
    errorMessage = "";

    const { data, error } = await authClient.admin.listUsers({
      query: {
        limit: pageSize,
        offset: (page - 1) * pageSize,
      },
    });

    if (error) {
      errorMessage = error.message || "Failed to load users";
    } else if (data) {
      usersList = data.users;
      totalUsers = data.total;
      totalPages = Math.ceil(totalUsers / pageSize);
    }

    isLoading = false;
  }

  onMount(() => {
    loadUsers(currentPage);
  });

  function goToNextPage() {
    if (currentPage < totalPages) {
      currentPage++;
      loadUsers(currentPage);
    }
  }

  function goToPrevPage() {
    if (currentPage > 1) {
      currentPage--;
      loadUsers(currentPage);
    }
  }

  async function deleteUser(user) {
    const { data, error } = await authClient.admin.removeUser({
      userId: user.id,
    });

    if (error) {
      errorMessage = "Error deleting user: " + user.username;
    } else if (data) {
      if (usersList.length === 1 && currentPage > 1) {
        currentPage--;
      }

      loadUsers(currentPage);
    }
  }

  async function banUser(user) {
    const { error } = await authClient.admin.banUser({
      userId: user.id,
    });

    if (error) {
      errorMessage = "Error banning user: " + user.username;
    } else {
      loadUsers(currentPage);
    }
  }

  async function unbanUser(user) {
    const { error } = await authClient.admin.unbanUser({
      userId: user.id,
    });

    if (error) {
      errorMessage = "Error unbanning user: " + user.username;
    } else {
      loadUsers(currentPage);
    }
  }

  async function impersonateUser(user) {
    const { data, error } = await authClient.admin.impersonateUser({
      userId: user.id,
    });

    if (error) {
      errorMessage = "Error impersonating user: " + user.username;
    } else {
      await storage.broadcastAuthChange();
      await goto("/", { invalidateAll: true });
    }
  }
</script>

<Head title="Users" />

<div class="h-full w-full px-4 flex flex-col gap-4">
  <div class="flex flex-col">
    <h1 class="text-xl font-bold">Users</h1>
    <p class="text-text-placeholder text-sm">
      Manage registered users. {#if totalUsers}{totalUsers} total users.{/if}
    </p>
  </div>
  <div class="flex flex-col items-center gap-4 text-center">
    <table class="w-full table-fixed text-left divide-y divide-border text-sm">
      <thead>
        <tr>
          <th class="p-4">Avatar</th>
          <th class="p-4">Username</th>
          <th class="p-4">Email</th>
          <th class="p-4">Joined</th>
          <th class="p-4">Role</th>
          <th class="p-4">Actions</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-border">
        {#if isLoading}
          <tr>
            <td colspan="6" class="p-4 text-text-placeholder text-center"
              >Loading users...</td
            >
          </tr>
        {:else if errorMessage}
          <tr>
            <td colspan="6" class="p-4 text-text-placeholder text-center"
              >{errorMessage}</td
            >
          </tr>
        {:else}
          {#each usersList as user}
            <tr class="hover:bg-secondary">
              <td class="p-4">
                <img
                  class="w-8 h-8 object-cover rounded-lg"
                  src={"/cdn/avatars/" + user.image}
                  alt="Profile"
                  draggable="false"
                />
              </td>
              <td class="p-4">
                {user.username}
              </td>
              <td class="p-4">
                {user.email}
              </td>
              <td class="p-4">
                {new Intl.DateTimeFormat("en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }).format(new Date(user.createdAt))}
              </td>
              <td class="p-4">
                <span
                  class="px-2 py-1 text-xs rounded-full border
                  {user.role === 'admin'
                    ? ' bg-primary text-text-inverse border-border-primary'
                    : ' border-border'}"
                >
                  {user.role}
                </span>
              </td>
              <td class="p-4">
                <div class="flex gap-4">
                  {#if user.role !== "admin"}
                    <button
                      title="Impersonate User"
                      onclick={() => impersonateUser(user)}
                      class="p-1 cursor-pointer text-sm bg-surface border border-border rounded-lg flex gap-2"
                    >
                      <Eye class="w-4 h-4" />
                    </button>
                  {/if}
                  {#if user.banned}
                    <button
                      title="Unban User"
                      onclick={() => unbanUser(user)}
                      class="p-1 cursor-pointer text-sm bg-surface border border-border rounded-lg flex gap-2"
                    >
                      <CircleOff class="w-4 h-4" />
                    </button>
                  {:else}
                    <button
                      title="Ban User"
                      onclick={() => banUser(user)}
                      class="p-1 cursor-pointer text-sm bg-surface border border-border rounded-lg flex gap-2"
                    >
                      <Gavel class="w-4 h-4" />
                    </button>
                  {/if}
                  <button
                    title="Delete User"
                    onclick={() => deleteUser(user)}
                    class="p-1 cursor-pointer text-sm bg-surface border border-border rounded-lg flex gap-2"
                  >
                    <Trash class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="6" class="p-4 text-text-placeholder text-center"
                >No users found.</td
              >
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
  <div class="flex gap-4 items-center justify-center mt-auto">
    <button
      aria-label="Previous Page"
      disabled={currentPage === 1}
      onclick={goToPrevPage}
      class="bg-surface border border-border w-10 h-10 rounded-full flex justify-center items-center disabled:opacity-50 cursor-pointer disabled:cursor-default"
    >
      <ChevronLeft size="20" />
    </button>
    <p>{currentPage} / {totalPages === 0 ? 1 : totalPages}</p>
    <button
      aria-label="Next Page"
      disabled={currentPage >= totalPages}
      onclick={goToNextPage}
      class="bg-surface border border-border w-10 h-10 rounded-full flex justify-center items-center disabled:opacity-50 cursor-pointer disabled:cursor-default"
    >
      <ChevronRight size="20" />
    </button>
  </div>
</div>
