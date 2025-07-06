<script lang="ts">
  import { copyright, terms, privacy, about_us } from '$lib/paraglide/messages.js';

  // フッターコンポーネント
  // Apps Script Hubのメインフッターで、コピーライトとリンクを表示
  // variant: 'default' | 'admin'を指定して表示形式を切り替え

  interface Props {
    variant?: 'default' | 'admin';
  }

  let { variant = 'default' }: Props = $props();
</script>

{#if variant === 'admin'}
  <!-- 管理画面用のシンプルなフッター -->
  <footer class="mt-12 border-t border-gray-200 bg-gray-50">
    <div class="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div class="text-center text-sm text-gray-500">
        {copyright()}
      </div>
    </div>
  </footer>
{:else}
  <!-- 通常ページ用のフッター（リンク付き） -->
  <footer class="border-t border-gray-200 bg-white">
    <div class="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div class="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
        <!-- コピーライト -->
        <div class="flex flex-col items-center sm:items-start">
          <p class="text-sm text-gray-500">
            {copyright()}
          </p>
        </div>

        <!-- ナビゲーションリンク -->
        <nav class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:justify-end">
          <a
            href="https://wywy.jp/members"
            class="rounded-sm px-1 text-sm text-gray-500 transition-colors hover:text-gray-900 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
            target="_blank"
            rel="noopener noreferrer"
          >
            {about_us()}
          </a>
          <a
            href="/terms"
            class="rounded-sm px-1 text-sm text-gray-500 transition-colors hover:text-gray-900 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
          >
            {terms()}
          </a>
          <a
            href="/privacy"
            class="rounded-sm px-1 text-sm text-gray-500 transition-colors hover:text-gray-900 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
          >
            {privacy()}
          </a>
        </nav>
      </div>
    </div>
  </footer>
{/if}
