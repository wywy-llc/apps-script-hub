<script lang="ts">
  import { enhance } from '$app/forms';
  import LibraryDetail from '$lib/components/LibraryDetail.svelte';
  import type { LibraryStatus } from '$lib/constants/library-status.js';
  import type { ActionData, PageData } from './$types';

  // 管理者画面 - ライブラリ詳細ページ
  // ライブラリの詳細情報表示、スクレイピング実行、編集・公開機能

  interface Props {
    data: PageData;
    form?: ActionData;
  }

  let { data, form }: Props = $props();
  let library = $state(data.library);

  let isScrapingInProgress = $state(false);
  let scrapingMessage = $state('');
  let isStatusUpdateInProgress = $state(false);
  let statusMessage = $state('');

  // メッセージ管理のための状態
  let messageTimeoutId: ReturnType<typeof setTimeout> | null = null;

  // formの変更を監視するエフェクト（エフェクト内での状態更新を最小化）
  $effect(() => {
    if (form?.success || form?.error) {
      // 既存のタイムアウトをクリア
      if (messageTimeoutId) {
        clearTimeout(messageTimeoutId);
        messageTimeoutId = null;
      }

      if (form.success) {
        statusMessage = form.message || '';
        // 3秒後にメッセージを消去
        messageTimeoutId = setTimeout(() => {
          statusMessage = '';
        }, 3000);
      } else if (form.error) {
        statusMessage = form.error || '';
        // エラーメッセージは5秒後に消去
        messageTimeoutId = setTimeout(() => {
          statusMessage = '';
        }, 5000);
      }
    }
  });

  function handleScraping() {
    if (isScrapingInProgress) return;

    isScrapingInProgress = true;
    scrapingMessage = 'GitHubリポジトリから情報を取得中...';

    // GitHub API から情報を再取得
    fetch(`/admin/libraries/${library.id}/scraping`, {
      method: 'POST',
    })
      .then(async response => {
        if (response.ok) {
          scrapingMessage = 'スクレイピングが完了しました。ページを再読み込みしてください。';
          // ページを再読み込み
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          const error = await response.json();
          scrapingMessage = error.message || 'スクレイピングに失敗しました。';
        }
      })
      .catch(error => {
        console.error('スクレイピングエラー:', error);
        scrapingMessage = 'スクレイピングに失敗しました。';
      })
      .finally(() => {
        isScrapingInProgress = false;
        // 3秒後にメッセージを消去
        setTimeout(() => {
          scrapingMessage = '';
        }, 3000);
      });
  }

  /**
   * ステータス更新アクションのハンドラー
   */
  function handleStatusUpdate(newStatus: LibraryStatus) {
    isStatusUpdateInProgress = true;
    // フォームを送信
    const form = document.getElementById(`status-form-${newStatus}`) as HTMLFormElement;
    if (form) {
      form.requestSubmit();
    }
  }

  function handleEdit() {
    // 編集ページに遷移
    window.location.href = `/admin/libraries/${library.id}/edit`;
  }
</script>

<svelte:head>
  <title>管理画面 - ライブラリ詳細 - AppsScriptHub</title>
  <meta name="description" content="AppsScriptHub管理者画面 - ライブラリの詳細情報と管理機能" />
</svelte:head>

<main>
  <LibraryDetail
    {library}
    isAdminMode={true}
    form={form || undefined}
    onScraping={handleScraping}
    onEdit={handleEdit}
    onStatusUpdate={handleStatusUpdate}
    {isScrapingInProgress}
    {scrapingMessage}
    {isStatusUpdateInProgress}
    {statusMessage}
  />

  <!-- 隠しフォーム群（ステータス更新用） -->
  <form
    id="status-form-published"
    method="POST"
    action="?/updateStatus"
    use:enhance={() => {
      isStatusUpdateInProgress = true;
      return async ({ result, update }) => {
        // フォームの状態を更新
        await update();

        // ステータス更新の成功時のみライブラリステータスを楽観的に更新
        if (result.type === 'success' && result.data?.success) {
          library = { ...library, status: 'published' as LibraryStatus };
        }

        isStatusUpdateInProgress = false;
      };
    }}
    style="display: none;"
  >
    <input type="hidden" name="status" value="published" />
  </form>

  <form
    id="status-form-pending"
    method="POST"
    action="?/updateStatus"
    use:enhance={() => {
      isStatusUpdateInProgress = true;
      return async ({ result, update }) => {
        // フォームの状態を更新
        await update();

        // ステータス更新の成功時のみライブラリステータスを楽観的に更新
        if (result.type === 'success' && result.data?.success) {
          library = { ...library, status: 'pending' as LibraryStatus };
        }

        isStatusUpdateInProgress = false;
      };
    }}
    style="display: none;"
  >
    <input type="hidden" name="status" value="pending" />
  </form>

  <!-- Footer -->
  <footer class="mt-12 border-t border-gray-200 bg-gray-50">
    <div class="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div class="text-center text-sm text-gray-500">
        &copy; 2025 wywy LLC. All rights reserved.
      </div>
    </div>
  </footer>
</main>
