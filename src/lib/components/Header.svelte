<script lang="ts">
  import { app_title, login } from '$lib/paraglide/messages.js';
  import Button from './Button.svelte';
  import GoogleAnalytics from './GoogleAnalytics.svelte';
  import LanguageSwitcher from './LanguageSwitcher.svelte';

  // 基本ヘッダーコンポーネント
  // 未ログインユーザー向けのシンプルなヘッダー
</script>

<header class="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex h-16 items-center justify-between">
      <!-- ロゴ -->
      <div class="flex items-center">
        <a href="/" class="flex items-center space-x-2 text-xl font-bold text-gray-900">
          <img src="/logo.png" alt={app_title()} class="h-8 w-8" />
          <span>{app_title()}</span>
        </a>
      </div>

      <!-- 右側のアクション -->
      <div class="flex items-center space-x-4">
        <LanguageSwitcher />
        <Button variant="primary" size="md" href="/auth/login">{login()}</Button>
      </div>
    </div>
  </div>
</header>

<GoogleAnalytics />
