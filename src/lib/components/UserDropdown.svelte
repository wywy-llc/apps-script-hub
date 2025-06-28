<script lang="ts">
  import { clickOutside } from '$lib/actions/clickOutside';
  import { signOut } from '@auth/sveltekit/client';

  export let user: { name?: string; email?: string; image?: string };
  export let showAdminLink = false;

  let isOpen = false;

  function toggleDropdown() {
    isOpen = !isOpen;
  }

  function closeDropdown() {
    isOpen = false;
  }

  async function handleSignOut() {
    await signOut({ redirectTo: '/' });
    closeDropdown();
  }
</script>

<div class="relative">
  <!-- ユーザー名ボタン -->
  <button
    on:click={toggleDropdown}
    class="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-2 py-1 transition-colors"
  >
    <span>{user.name || user.email}</span>
    <svg
      class="h-4 w-4 transition-transform {isOpen ? 'rotate-180' : ''}"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M19 9l-7 7-7-7"
      />
    </svg>
  </button>

  <!-- ドロップダウンメニュー -->
  {#if isOpen}
    <div
      use:clickOutside={closeDropdown}
      class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
    >
      <div class="py-1">
        {#if showAdminLink}
          <a
            href="/admin"
            class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            on:click={closeDropdown}
          >
            管理画面
          </a>
        {/if}
        <a
          href="/user/search"
          class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          on:click={closeDropdown}
        >
          ライブラリ検索
        </a>
        <hr class="my-1 border-gray-200" />
        <button
          on:click={handleSignOut}
          class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        >
          ログアウト
        </button>
      </div>
    </div>
  {/if}
</div>
