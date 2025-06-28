<script lang="ts">
  import { copyright, terms, privacy } from '$lib/paraglide/messages.js';

  // フッターコンポーネント
  // AppsScriptHubのメインフッターで、コピーライトとリンクを表示
</script>

<footer class="border-t border-gray-200 bg-white">
  <div class="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
    <div class="flex flex-col items-center justify-between sm:flex-row">
      <p class="text-sm text-gray-500">
        {copyright()}
      </p>
      <div class="mt-4 flex space-x-6 sm:mt-0">
        <a href="/terms" class="text-sm text-gray-500 hover:text-gray-900">{terms()}</a>
        <a href="/privacy" class="text-sm text-gray-500 hover:text-gray-900">{privacy()}</a>
      </div>
    </div>
  </div>
</footer>
