<script lang="ts">
  import { copyright, terms, privacy } from '$lib/paraglide/messages.js';
  
  // フッターコンポーネント
  // AppsScriptHubのメインフッターで、コピーライトとリンクを表示
</script>

<footer class="bg-white border-t border-gray-200">
  <div class="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center flex-col sm:flex-row">
      <p class="text-sm text-gray-500">
        {copyright()}
      </p>
      <div class="flex space-x-6 mt-4 sm:mt-0">
        <a href="/terms" class="text-sm text-gray-500 hover:text-gray-900"
          >{terms()}</a
        >
        <a href="/privacy" class="text-sm text-gray-500 hover:text-gray-900"
          >{privacy()}</a
        >
      </div>
    </div>
  </div>
</footer>
