<script lang="ts">
  import StatusUpdateButtons from '$lib/components/admin/StatusUpdateButtons.svelte';
  import {
    LIBRARY_STATUS_BADGE_CLASS,
    LIBRARY_STATUS_TEXT,
    type LibraryStatus,
  } from '$lib/constants/library-status.js';
  import type { PageData } from './$types';

  // 管理者画面 - ライブラリ一覧ページ
  // 全ライブラリの承認・削除を管理

  export let data: PageData;

  let libraries = data.libraries;
  let currentPage = 1;
  let totalItems = libraries.length;
  let itemsPerPage = 10;
  let statusUpdateInProgress: Record<string, boolean> = {};

  async function handleStatusUpdate(libraryId: string, newStatus: LibraryStatus) {
    statusUpdateInProgress[libraryId] = true;

    try {
      const response = await fetch(`/admin/libraries/${libraryId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // ライブラリのステータスを更新
        libraries = libraries.map(lib =>
          lib.id === libraryId ? { ...lib, status: newStatus } : lib
        );
      } else {
        console.error('ステータス更新に失敗しました');
      }
    } catch (error) {
      console.error('ステータス更新エラー:', error);
    } finally {
      statusUpdateInProgress[libraryId] = false;
    }
  }

  function handleDelete(id: string) {
    // 削除処理のロジック
    if (confirm('本当に削除しますか？')) {
      console.log('削除:', id);
    }
  }
</script>

<svelte:head>
  <title>管理画面 - ライブラリ一覧 - AppsScriptHub</title>
  <meta name="description" content="AppsScriptHub管理者画面 - ライブラリの承認・削除を管理" />
</svelte:head>

<main class="container mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
  <div class="mb-8 flex items-center justify-between">
    <h1 class="text-3xl font-bold text-gray-900">ライブラリ管理</h1>
    <a
      href="/admin/libraries/new"
      class="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
    >
      新規追加
    </a>
  </div>

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
                    on:click={() => handleDelete(library.id)}
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
  <footer class="mt-12 border-t border-gray-200 bg-gray-50">
    <div class="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div class="text-center text-sm text-gray-500">
        &copy; 2025 wywy LLC. All rights reserved.
      </div>
    </div>
  </footer>
</main>
