<script lang="ts">
  import { enhance } from '$app/forms';
  import StatusUpdateButtons from '$lib/components/admin/StatusUpdateButtons.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { APP_CONFIG, PAGINATION } from '$lib/constants/app-config.js';
  import {
    DEFAULT_GITHUB_SEARCH_SORT,
    GITHUB_SEARCH_SORT_CHOICES,
  } from '$lib/constants/github-search.js';
  import {
    LIBRARY_STATUS_BADGE_CLASS,
    LIBRARY_STATUS_TEXT,
    type LibraryStatus,
  } from '$lib/constants/library-status.js';
  import { DEFAULT_SCRAPER_CONFIG } from '$lib/constants/scraper-config.js';
  import type { ActionData, PageData } from './$types';

  // 管理者画面 - ライブラリ一覧ページ
  // 全ライブラリの承認・削除を管理

  interface Props {
    data: PageData;
    form?: ActionData;
  }

  let { data, form }: Props = $props();

  let libraries = $state(data.libraries);
  let currentPage = 1;
  let totalItems = $derived(libraries.length);
  let itemsPerPage = 10;
  let statusUpdateInProgress: Record<string, boolean> = {};
  let showBulkAddForm = $state(false);
  let bulkAddInProgress = $state(false);
  let startPage = $state(PAGINATION.MIN_PAGE);
  let endPage = $state(PAGINATION.MIN_PAGE);
  let perPage = $state(PAGINATION.PER_PAGE_OPTIONS[3]); // 100件/ページ
  let sortOption = $state(DEFAULT_GITHUB_SEARCH_SORT);
  let maxResults = $derived(Math.max(0, (endPage - startPage + 1) * perPage));
  let bulkUpdateInProgress = $state(false);
  let bulkUpdateMessage = $state('');
  let selectedTags = $state(resetSelectedTags()); // 初期値は全タグ選択

  /**
   * selectedTagsを初期値にリセット
   */
  function resetSelectedTags(): string[] {
    return [...DEFAULT_SCRAPER_CONFIG.gasTags];
  }

  async function handleStatusUpdate(libraryId: string, newStatus: LibraryStatus) {
    statusUpdateInProgress[libraryId] = true;

    try {
      // FormDataを使用してSvelteKitのアクションエンドポイントに送信
      const formData = new FormData();
      formData.append('status', newStatus);

      const response = await fetch(`/admin/libraries/${libraryId}?/updateStatus`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        // レスポンスをJSONとして解析
        const result = await response.json();

        if (result.type === 'success') {
          // ライブラリのステータスを更新
          libraries = libraries.map(lib =>
            lib.id === libraryId ? { ...lib, status: newStatus } : lib
          );
        } else {
          console.error('ステータス更新に失敗しました:', result.data?.error || '不明なエラー');
        }
      } else {
        console.error('ステータス更新に失敗しました');
      }
    } catch (error) {
      console.error('ステータス更新エラー:', error);
    } finally {
      statusUpdateInProgress[libraryId] = false;
    }
  }

  async function handleDelete(id: string) {
    const targetLibrary = libraries.find(lib => lib.id === id);
    const libraryName = targetLibrary?.name || 'ライブラリ';

    if (!confirm(`本当に「${libraryName}」を削除しますか？この操作は取り消せません。`)) {
      return;
    }

    try {
      // FormDataを使用してSvelteKitのdeleteアクションに送信
      const formData = new FormData();
      formData.append('libraryId', id);

      const response = await fetch('?/delete', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        // レスポンスをJSONとして解析
        const result = await response.json();

        if (result.type === 'success') {
          // ライブラリ一覧から削除されたライブラリを除去
          libraries = libraries.filter(lib => lib.id !== id);
          alert(result.data?.message || 'ライブラリを削除しました。');
        } else {
          console.error('ライブラリ削除に失敗しました:', result.data?.error || '不明なエラー');
          alert(result.data?.error || 'ライブラリの削除に失敗しました。');
        }
      } else {
        console.error('ライブラリ削除に失敗しました');
        alert('ライブラリの削除に失敗しました。');
      }
    } catch (error) {
      console.error('ライブラリ削除エラー:', error);
      alert('ライブラリの削除中にエラーが発生しました。');
    }
  }

  function toggleBulkAddForm() {
    showBulkAddForm = !showBulkAddForm;
    if (!showBulkAddForm) {
      startPage = PAGINATION.MIN_PAGE;
      endPage = PAGINATION.MIN_PAGE;
      perPage = PAGINATION.PER_PAGE_OPTIONS[3]; // 100件/ページ
      sortOption = DEFAULT_GITHUB_SEARCH_SORT;
      selectedTags = resetSelectedTags();
    }
  }

  async function handleBulkUpdate() {
    if (bulkUpdateInProgress) return;

    if (
      !confirm('全ライブラリの情報を一括更新しますか？この処理には時間がかかる場合があります。')
    ) {
      return;
    }

    bulkUpdateInProgress = true;
    bulkUpdateMessage = '全ライブラリの一括更新を開始しています...';

    try {
      let successCount = 0;
      let errorCount = 0;
      const totalLibraries = libraries.length;

      for (let i = 0; i < libraries.length; i++) {
        const library = libraries[i];
        bulkUpdateMessage = `${i + 1}/${totalLibraries} ライブラリを更新中: ${library.name}`;

        try {
          const response = await fetch(`/admin/libraries/${library.id}/scraping`, {
            method: 'POST',
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
            console.error(`ライブラリ ${library.name} の更新に失敗:`, await response.text());
          }
        } catch (error) {
          errorCount++;
          console.error(`ライブラリ ${library.name} の更新エラー:`, error);
        }

        await new Promise(resolve => setTimeout(resolve, 500));
      }

      bulkUpdateMessage = `一括更新が完了しました。成功: ${successCount}件、失敗: ${errorCount}件`;

      setTimeout(() => {
        bulkUpdateMessage = '';
        window.location.reload();
      }, 3000);
    } catch (error) {
      console.error('一括更新エラー:', error);
      bulkUpdateMessage = '一括更新中にエラーが発生しました。';
    } finally {
      bulkUpdateInProgress = false;
      setTimeout(() => {
        bulkUpdateMessage = '';
      }, 5000);
    }
  }
</script>

<svelte:head>
  <title>管理画面 - ライブラリ一覧 - {APP_CONFIG.SITE_NAME}</title>
  <meta
    name="description"
    content="{APP_CONFIG.SITE_NAME}管理者画面 - ライブラリの承認・削除を管理"
  />
</svelte:head>

<main class="container mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
  <div class="mb-8 flex items-center justify-between">
    <h1 class="text-3xl font-bold text-gray-900">ライブラリ管理</h1>
    <div class="flex space-x-2">
      <a
        href="/admin/libraries/new"
        class="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
      >
        新規追加
      </a>
      <button
        onclick={toggleBulkAddForm}
        class="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700"
      >
        一括新規追加
      </button>
      <button
        onclick={handleBulkUpdate}
        disabled={bulkUpdateInProgress}
        class="inline-flex items-center justify-center rounded-md border border-transparent bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {#if bulkUpdateInProgress}
          <svg
            class="mr-2 h-4 w-4 animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          一括更新中...
        {:else}
          一括更新
        {/if}
      </button>
    </div>
  </div>

  <!-- 一括更新メッセージ -->
  {#if bulkUpdateMessage}
    <div class="mb-6 rounded-md bg-blue-50 p-4 text-blue-800">
      <div class="flex">
        <svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clip-rule="evenodd"
          />
        </svg>
        <div class="ml-3">
          <p class="text-sm font-medium">{bulkUpdateMessage}</p>
        </div>
      </div>
    </div>
  {/if}

  <!-- 一括追加フォーム -->
  {#if showBulkAddForm}
    <div class="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-md">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-xl font-semibold text-gray-900">一括新規追加</h2>
        <button
          onclick={toggleBulkAddForm}
          class="text-gray-400 hover:text-gray-600"
          aria-label="閉じる"
        >
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>

      <form
        method="POST"
        action="?/bulkAddByTags"
        use:enhance={() => {
          bulkAddInProgress = true;
          return async ({ result, update }) => {
            await update();
            bulkAddInProgress = false;
            if (result.type === 'success') {
              startPage = PAGINATION.MIN_PAGE;
              endPage = PAGINATION.MIN_PAGE;
              perPage = PAGINATION.PER_PAGE_OPTIONS[3]; // 100件/ページ
              sortOption = DEFAULT_GITHUB_SEARCH_SORT;
              selectedTags = resetSelectedTags();
              showBulkAddForm = false;
              // ページリロードでライブラリ一覧を更新
              window.location.reload();
            }
          };
        }}
      >
        <!-- ページ範囲設定 -->
        <div class="mb-6 space-y-4">
          <h3 class="text-lg font-medium text-gray-900">検索範囲設定</h3>

          <!-- ページ範囲 -->
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label for="startPage" class="mb-1 block text-sm font-medium text-gray-700">
                開始ページ
              </label>
              <input
                id="startPage"
                name="startPage"
                type="number"
                min={PAGINATION.MIN_PAGE}
                max={PAGINATION.MAX_PAGE}
                bind:value={startPage}
                class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={bulkAddInProgress}
                required
              />
            </div>

            <div>
              <label for="endPage" class="mb-1 block text-sm font-medium text-gray-700">
                終了ページ
              </label>
              <input
                id="endPage"
                name="endPage"
                type="number"
                min={PAGINATION.MIN_PAGE}
                max={PAGINATION.MAX_PAGE}
                bind:value={endPage}
                class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={bulkAddInProgress}
                required
              />
            </div>

            <div>
              <label for="perPage" class="mb-1 block text-sm font-medium text-gray-700">
                1ページあたりの件数
              </label>
              <select
                id="perPage"
                name="perPage"
                bind:value={perPage}
                class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={bulkAddInProgress}
              >
                {#each PAGINATION.PER_PAGE_OPTIONS as option (option)}
                  <option value={option}>{option}件/ページ</option>
                {/each}
              </select>
            </div>
          </div>

          <!-- GitHubタグ選択 -->
          <div class="grid grid-cols-1 gap-4">
            <div>
              <div class="mb-2 text-sm font-medium text-gray-700">検索対象タグ</div>
              <div class="space-y-2">
                {#each DEFAULT_SCRAPER_CONFIG.gasTags as tag (tag)}
                  <label class="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="selectedTags"
                      value={tag}
                      bind:group={selectedTags}
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={bulkAddInProgress}
                    />
                    <span class="text-sm text-gray-700">{tag}</span>
                  </label>
                {/each}
              </div>
              <p class="mt-1 text-xs text-gray-500">
                選択したタグを含むリポジトリを検索します。複数選択可能です。
              </p>
            </div>
          </div>

          <!-- 並び順設定 -->
          <div class="grid grid-cols-1 gap-4">
            <div>
              <label for="sortOption" class="mb-1 block text-sm font-medium text-gray-700">
                並び順
              </label>
              <select
                id="sortOption"
                name="sortOption"
                bind:value={sortOption}
                class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={bulkAddInProgress}
              >
                {#each GITHUB_SEARCH_SORT_CHOICES as choice (choice.key)}
                  <option value={choice.key}>{choice.label}</option>
                {/each}
              </select>
              <p class="mt-1 text-xs text-gray-500">
                {GITHUB_SEARCH_SORT_CHOICES.find(c => c.key === sortOption)?.description}
              </p>
            </div>
          </div>

          <!-- 総件数表示 -->
          <div class="rounded-md bg-gray-50 p-3">
            <p class="text-sm text-gray-700">
              <strong>📋 検索予定件数:</strong>
              {Math.max(0, (endPage - startPage + 1) * perPage)}件 (ページ {startPage} 〜 {endPage}, {perPage}件/ページ)
            </p>
            <p class="mt-1 text-xs text-gray-500">
              GitHub APIの制限により、最大{PAGINATION.MAX_TOTAL_RESULTS}件までの取得となります。
            </p>
          </div>

          <!-- 非表示のhiddenフィールド -->
          <input type="hidden" name="maxResults" bind:value={maxResults} />
          <div class="mt-2 rounded-md bg-blue-50 p-3">
            <p class="text-xs text-blue-700">
              <strong>📋 検索対象タグ:</strong>
              {selectedTags.join(', ')}
            </p>
            <p class="mt-1 text-xs text-blue-600">
              <strong>🔍 処理内容:</strong> GitHubでタグ検索 → READMEからスクリプトID抽出 → 重複チェック
              → DB登録
            </p>
            <p class="mt-1 text-xs text-orange-600">
              <strong>⚠️ 注意:</strong> 大量検索（500件以上）は時間がかかります（5-10分程度）
            </p>
          </div>
        </div>

        <div class="flex items-center justify-end space-x-3">
          <button
            type="button"
            onclick={toggleBulkAddForm}
            class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            disabled={bulkAddInProgress}
          >
            キャンセル
          </button>
          <button
            type="submit"
            class="inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={bulkAddInProgress}
          >
            {#if bulkAddInProgress}
              <svg
                class="mr-2 h-4 w-4 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              処理中...
            {:else}
              自動検索・一括追加実行
            {/if}
          </button>
        </div>
      </form>
    </div>
  {/if}

  <!-- 処理結果メッセージ -->
  {#if form?.success}
    <div class="mb-6 rounded-md bg-green-50 p-4 text-green-800">
      <div class="flex">
        <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          />
        </svg>
        <div class="ml-3">
          <p class="text-sm font-medium">{form.message}</p>
          {#if form.details}
            <div class="mt-2 text-xs">
              <p>総処理数: {form.details.total}件</p>
              <p>登録成功: {form.details.inserted}件</p>
              {#if form.details.errors > 0}
                <p>エラー: {form.details.errors}件</p>
              {/if}
              {#if form.details.duplicates > 0}
                <p>重複スキップ: {form.details.duplicates}件</p>
              {/if}
            </div>
          {/if}
        </div>
      </div>
    </div>
  {:else if form?.error}
    <div class="mb-6 rounded-md bg-red-50 p-4 text-red-800">
      <div class="flex">
        <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"
          />
        </svg>
        <div class="ml-3">
          <p class="text-sm font-medium">{form.error}</p>
        </div>
      </div>
    </div>
  {/if}

  <!-- Library List Table -->
  <div class="overflow-hidden rounded-lg bg-white shadow-md">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
            >
              ライブラリ名
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
            >
              作者
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
            >
              ステータス
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
            >
              最終更新日
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase"
            >
              アクション
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          {#each libraries as library (library.id)}
            <tr>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  <a
                    href="/admin/libraries/{library.id}"
                    class="text-blue-600 hover:text-blue-900 hover:underline"
                  >
                    {library.name}
                  </a>
                </div>
                <div class="max-w-xs truncate text-sm text-gray-500">
                  <a
                    href={`https://script.google.com/u/1/home/projects/${library.scriptId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={library.scriptId}
                    class="text-blue-600 hover:text-blue-900 hover:underline"
                  >
                    {library.scriptId}
                  </a>
                </div>
              </td>
              <td class="px-6 py-4 text-sm whitespace-nowrap text-gray-700">
                <a
                  href={library.authorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-blue-600 hover:text-blue-900 hover:underline"
                >
                  {library.authorName}
                </a>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class={LIBRARY_STATUS_BADGE_CLASS[library.status]}>
                  {LIBRARY_STATUS_TEXT[library.status]}
                </span>
              </td>
              <td class="px-6 py-4 text-sm whitespace-nowrap text-gray-700">
                {new Date(library.updatedAt).toLocaleDateString('ja-JP')}
              </td>
              <td class="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                <div class="flex items-center justify-end gap-2">
                  <StatusUpdateButtons
                    {library}
                    isStatusUpdateInProgress={statusUpdateInProgress[library.id] || false}
                    onStatusUpdate={status => handleStatusUpdate(library.id, status)}
                    compact={true}
                  />
                  <button
                    onclick={() => handleDelete(library.id)}
                    class="ml-2 inline-flex cursor-pointer justify-center rounded-md border border-transparent bg-gray-600 px-3 py-1 text-xs font-medium text-white shadow-sm hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    削除
                  </button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div
      class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6"
    >
      <div class="flex flex-1 justify-between sm:hidden">
        <button
          class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          前へ
        </button>
        <button
          class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          次へ
        </button>
      </div>
      <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700">
            全
            <span class="font-medium">{totalItems}</span>
            件中
            <span class="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
            -
            <span class="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span>
            件を表示
          </p>
        </div>
        <div>
          <nav
            class="relative z-0 inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Pagination"
          >
            <button
              class="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <span class="sr-only">前へ</span>
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
            <button
              aria-current="page"
              class="relative z-10 inline-flex items-center border border-blue-500 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600"
            >
              1
            </button>
            <button
              class="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              2
            </button>
            <button
              class="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <span class="sr-only">次へ</span>
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <Footer variant="admin" />
</main>
