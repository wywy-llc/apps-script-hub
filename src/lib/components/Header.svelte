<script lang="ts">
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
        <a href="/" class="text-xl font-bold text-gray-900"> AppsScriptHub </a>
      </div>

      <!-- 右側のアクション -->
      <div class="flex items-center space-x-4">
        <a
          href="/signin"
          class="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
        >
          Sign in
        </a>
        <a
          href="/signup"
          class="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
        >
          Sign up
        </a>
      </div>
    </div>
  </div>
</header>
