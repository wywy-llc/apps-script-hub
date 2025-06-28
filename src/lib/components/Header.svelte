<script lang="ts">
  import { app_title, sign_in, sign_up } from '$lib/paraglide/messages.js';
  import { page } from '$app/stores';
  import { signOut } from '@auth/sveltekit/client';
  import Button from './Button.svelte';
  import LanguageSwitcher from './LanguageSwitcher.svelte';

  // ヘッダーナビゲーションコンポーネント  
  // AppsScriptHubのメインヘッダーで、ロゴとログイン/ログアウトボタンを表示

  $: session = $page.data.session;
  $: user = $page.data.user;

  async function handleSignOut() {
    await signOut({ redirectTo: '/' });
  }
</script>

<header
  class="bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-200"
>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      <!-- ロゴ -->
      <div class="flex items-center">
        <a href="/" class="text-xl font-bold text-gray-900">{app_title()}</a>
      </div>

      <!-- 右側のアクション -->
      <div class="flex items-center space-x-4">
        <LanguageSwitcher />
        {#if session && user}
          <!-- ログイン済みユーザー -->
          <div class="flex items-center space-x-3">
            <span class="text-sm text-gray-700">
              {user.name || user.email}
            </span>
            <a
              href="/admin"
              class="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              管理画面
            </a>
            <Button variant="outline" size="sm" on:click={handleSignOut}>
              ログアウト
            </Button>
          </div>
        {:else}
          <!-- 未ログインユーザー -->
          <Button variant="primary" size="md" href="/auth/login">
            Login
          </Button>
        {/if}
      </div>
    </div>
  </div>
</header>
