<script lang="ts">
  import { app_title, sign_in, sign_up } from '$lib/paraglide/messages.js';
  import Button from './Button.svelte';
  import LanguageSwitcher from './LanguageSwitcher.svelte';

  // ヘッダーナビゲーションコンポーネント
  // AppsScriptHubのメインヘッダーで、ロゴとサインイン/サインアップボタンを表示
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
        <a
          href="/signin"
          class="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
        >
          {sign_in()}
        </a>
        <Button variant="primary" size="md" href="/signup">
          {sign_up()}
        </Button>
      </div>
    </div>
  </div>
</header>
