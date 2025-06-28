<script lang="ts">
  import { app_title } from '$lib/paraglide/messages.js';
  import Button from './Button.svelte';
  import LanguageSwitcher from './LanguageSwitcher.svelte';

  // 基本ヘッダーコンポーネント
  // 未ログインユーザー向けのシンプルなヘッダー
</script>

<header class="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex h-16 items-center justify-between">
      <!-- ロゴ -->
      <div class="flex items-center">
        <a href="/" class="text-xl font-bold text-gray-900">{app_title()}</a>
      </div>

      <!-- 右側のアクション -->
      <div class="flex items-center space-x-4">
        <LanguageSwitcher />
        <Button variant="primary" size="md" href="/auth/login">Login</Button>
      </div>
    </div>
  </div>
</header>
