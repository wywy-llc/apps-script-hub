<script lang="ts">
  import { enhance } from '$app/forms';
  import MarkdownRenderer from '$lib/components/MarkdownRenderer.svelte';
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

  // アクションの結果を処理
  $effect(() => {
    if (form?.success) {
      statusMessage = form.message;
      // ライブラリのステータスを更新
      if (form.newStatus && ['pending', 'published', 'rejected'].includes(form.newStatus)) {
        library = { ...library, status: form.newStatus as 'pending' | 'published' | 'rejected' };
      }
      // 3秒後にメッセージを消去
      setTimeout(() => {
        statusMessage = '';
      }, 3000);
    } else if (form?.error) {
      statusMessage = form.error;
      // エラーメッセージは5秒後に消去
      setTimeout(() => {
        statusMessage = '';
      }, 5000);
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
  function createStatusUpdateHandler(newStatus: 'published' | 'rejected' | 'pending') {
    return () => {
      const confirmMessages = {
        published: 'このライブラリを承認して公開しますか？',
        rejected: 'このライブラリを拒否しますか？',
        pending: 'このライブラリを承認待ちに戻しますか？',
      };

      if (confirm(confirmMessages[newStatus])) {
        isStatusUpdateInProgress = true;
        // フォームを送信
        const form = document.getElementById(`status-form-${newStatus}`) as HTMLFormElement;
        if (form) {
          form.requestSubmit();
        }
      }
    };
  }

  function handleEdit() {
    // 編集ページに遷移
    window.location.href = `/admin/libraries/${library.id}/edit`;
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'published':
        return 'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800';
      case 'pending':
        return 'px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800';
      default:
        return 'px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800';
    }
  }

  function getStatusText(status: string) {
    switch (status) {
      case 'published':
        return '公開中';
      case 'pending':
        return '承認待ち';
      case 'rejected':
        return '却下';
      default:
        return '不明';
    }
  }
</script>

<svelte:head>
  <title>管理画面 - ライブラリ詳細 - AppsScriptHub</title>
  <meta name="description" content="AppsScriptHub管理者画面 - ライブラリの詳細情報と管理機能" />
</svelte:head>

<main class="container mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
  <div class="mx-auto max-w-3xl">
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">ライブラリ詳細</h1>
        <div class="mt-2 flex items-center space-x-3">
          <p class="text-sm text-gray-500">{library.name}</p>
          <span class={getStatusBadge(library.status)}>
            {getStatusText(library.status)}
          </span>
        </div>
      </div>
      <div class="flex space-x-2">
        <button
          type="button"
          onclick={handleScraping}
          disabled={isScrapingInProgress}
          class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isScrapingInProgress ? 'スクレイピング中...' : 'スクレイピング実行'}
        </button>
        <button
          type="button"
          onclick={handleEdit}
          class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          編集
        </button>
        <!-- ステータス更新ボタン -->
        {#if library.status === 'pending'}
          <button
            type="button"
            onclick={createStatusUpdateHandler('published')}
            disabled={isStatusUpdateInProgress}
            class="inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            承認・公開
          </button>
          <button
            type="button"
            onclick={createStatusUpdateHandler('rejected')}
            disabled={isStatusUpdateInProgress}
            class="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            拒否
          </button>
        {:else if library.status === 'published'}
          <button
            type="button"
            onclick={createStatusUpdateHandler('rejected')}
            disabled={isStatusUpdateInProgress}
            class="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            拒否に変更
          </button>
          <button
            type="button"
            onclick={createStatusUpdateHandler('pending')}
            disabled={isStatusUpdateInProgress}
            class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            承認待ちに戻す
          </button>
        {:else if library.status === 'rejected'}
          <button
            type="button"
            onclick={createStatusUpdateHandler('published')}
            disabled={isStatusUpdateInProgress}
            class="inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            承認・公開
          </button>
        {/if}
      </div>
    </div>

    <!-- スクレイピングメッセージ -->
    {#if scrapingMessage}
      <div class="mb-6 rounded-md bg-blue-50 p-4 text-blue-800">
        {scrapingMessage}
      </div>
    {/if}

    <!-- ステータス更新メッセージ -->
    {#if statusMessage}
      <div
        class="mb-6 rounded-md p-4 {form?.success
          ? 'bg-green-50 text-green-800'
          : 'bg-red-50 text-red-800'}"
      >
        {statusMessage}
      </div>
    {/if}

    <!-- Library Details -->
    <h2 class="mb-6 text-2xl font-bold text-gray-900">概要</h2>
    <div class="overflow-hidden rounded-lg bg-white shadow-md">
      <div class="px-6 py-8">
        <dl class="space-y-8">
          <div>
            <dt class="text-sm font-medium text-gray-500">ライブラリ名</dt>
            <dd class="mt-1 text-lg font-semibold text-gray-900">
              {library.name}
            </dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">GAS スクリプトID</dt>
            <dd class="mt-1 font-mono text-base break-all text-gray-900">
              {library.scriptId}
            </dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">GitHub リポジトリURL</dt>
            <dd class="mt-1 text-base text-blue-600 hover:underline">
              <a href={library.repositoryUrl} target="_blank" rel="noopener noreferrer">
                {library.repositoryUrl}
              </a>
            </dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">GASメソッド</dt>
            <dd class="mt-1 text-base text-blue-600 hover:underline">
              <a
                href={`https://script.google.com/macros/library/d/${library.scriptId}/0`}
                target="_blank"
                rel="noopener noreferrer"
                title={`https://script.google.com/macros/library/d/${library.scriptId}/0`}
              >
                https://script.google.com/macros/library/d/{library.scriptId.slice(-8)}...
              </a>
            </dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">GASプロジェクト</dt>
            <dd class="mt-1 text-base text-blue-600 hover:underline">
              <a
                href={`https://script.google.com/u/1/home/projects/${library.scriptId}/edit`}
                target="_blank"
                rel="noopener noreferrer"
                title={`https://script.google.com/u/1/home/projects/${library.scriptId}/edit`}
              >
                https://script.google.com/projects/{library.scriptId.slice(-8)}...
              </a>
            </dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">GitHub 作者</dt>
            <dd class="mt-1 text-base">
              {#if library.authorName}
                <a
                  href={library.authorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-blue-600 hover:underline"
                >
                  {library.authorName}
                </a>
              {:else}
                <a
                  href={library.authorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-blue-600 hover:underline"
                >
                  {library.authorUrl}
                </a>
              {/if}
            </dd>
          </div>
          {#if library.description}
            <div>
              <dt class="text-sm font-medium text-gray-500">説明</dt>
              <dd class="mt-1 text-base text-gray-900">
                {library.description}
              </dd>
            </div>
          {/if}
          <div>
            <dt class="text-sm font-medium text-gray-500">作成日時</dt>
            <dd class="mt-1 text-base text-gray-900">
              {new Date(library.createdAt).toLocaleString('ja-JP')}
            </dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">更新日時</dt>
            <dd class="mt-1 text-base text-gray-900">
              {new Date(library.updatedAt).toLocaleString('ja-JP')}
            </dd>
          </div>
        </dl>
      </div>
    </div>

    <!-- Scraping Results -->
    <div class="mt-12">
      <h2 class="mb-6 text-2xl font-bold text-gray-900">詳細</h2>
      <div class="overflow-hidden rounded-lg bg-white shadow-md">
        <div class="px-6">
          <!-- README Section -->
          {#if library.readmeContent}
            <MarkdownRenderer content={library.readmeContent} />
          {:else}
            <div class="py-8 text-center text-gray-500">
              <p>README が見つかりませんでした。</p>
              <p class="mt-2 text-sm">スクレイピングを実行してREADMEを取得してください。</p>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>

  <!-- 隠しフォーム群（ステータス更新用） -->
  <form
    id="status-form-published"
    method="POST"
    action="?/updateStatus"
    use:enhance={() => {
      isStatusUpdateInProgress = true;
      return async ({ result, update }) => {
        await update();
        // 成功時にライブラリのステータスを即座に更新
        if (result.type === 'success' && result.data?.success) {
          library = { ...library, status: 'published' };
        }
        isStatusUpdateInProgress = false;
      };
    }}
    style="display: none;"
  >
    <input type="hidden" name="status" value="published" />
  </form>

  <form
    id="status-form-rejected"
    method="POST"
    action="?/updateStatus"
    use:enhance={() => {
      isStatusUpdateInProgress = true;
      return async ({ result, update }) => {
        await update();
        // 成功時にライブラリのステータスを即座に更新
        if (result.type === 'success' && result.data?.success) {
          library = { ...library, status: 'rejected' };
        }
        isStatusUpdateInProgress = false;
      };
    }}
    style="display: none;"
  >
    <input type="hidden" name="status" value="rejected" />
  </form>

  <form
    id="status-form-pending"
    method="POST"
    action="?/updateStatus"
    use:enhance={() => {
      isStatusUpdateInProgress = true;
      return async ({ result, update }) => {
        await update();
        // 成功時にライブラリのステータスを即座に更新
        if (result.type === 'success' && result.data?.success) {
          library = { ...library, status: 'pending' };
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
