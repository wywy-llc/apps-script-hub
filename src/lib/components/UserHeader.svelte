<script lang="ts">
  import { app_title } from '$lib/paraglide/messages.js';
  import LanguageSwitcher from './LanguageSwitcher.svelte';
  import UserDropdown from './UserDropdown.svelte';

  export let user: any;
  export let showAdminLink = false;

  // ログインユーザー用ヘッダーコンポーネント
  // ユーザードロップダウンメニューを含む
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
        <UserDropdown {user} {showAdminLink} />
      </div>
    </div>
  </div>
</header>
