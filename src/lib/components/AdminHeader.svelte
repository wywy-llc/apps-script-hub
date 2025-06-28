<script lang="ts">
  import { app_title } from '$lib/paraglide/messages.js';
  import LanguageSwitcher from './LanguageSwitcher.svelte';
  import UserDropdown from './UserDropdown.svelte';

  export let user: any;

  // 管理者用ヘッダーコンポーネント
  // 管理者専用ナビゲーションとユーザードロップダウンを含む
</script>

<header
  class="bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-200"
>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      <!-- ロゴとナビゲーション -->
      <div class="flex items-center space-x-8">
        <a href="/" class="text-xl font-bold text-gray-900">{app_title()}</a>

        <!-- 管理者ナビゲーション -->
        <nav class="flex items-center space-x-4">
          <a
            href="/admin"
            class="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
          >
            管理画面
          </a>
          <a
            href="/admin/libraries"
            class="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
          >
            ライブラリ管理
          </a>
        </nav>
      </div>

      <!-- 右側のアクション -->
      <div class="flex items-center space-x-4">
        <LanguageSwitcher />
        <UserDropdown {user} showAdminLink={true} />
      </div>
    </div>
  </div>
</header>
