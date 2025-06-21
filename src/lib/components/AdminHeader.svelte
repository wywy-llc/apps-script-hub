<script lang="ts">
  // 管理者画面専用ヘッダーコンポーネント
  // 管理者認証後の画面で使用されるヘッダー

  interface Props {
    onSignOut?: () => void;
  }

  let { onSignOut = () => console.log('サインアウト') }: Props = $props();
</script>

<header
  class="bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-200"
>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      <!-- Logo -->
      <div class="flex items-center">
        <a href="/admin" class="text-xl font-bold text-gray-900">
          AppsScriptHub <span class="text-sm font-normal text-gray-500"
            >Admin</span
          >
        </a>
      </div>

      <!-- Right side actions -->
      <div class="flex items-center space-x-4">
        <button
          onclick={onSignOut}
          class="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  </div>
</header>
