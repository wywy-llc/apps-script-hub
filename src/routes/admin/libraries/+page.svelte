<script lang="ts">
  import AdminHeader from '$lib/components/AdminHeader.svelte';
  import type { PageData } from './$types';

  // 管理者画面 - ライブラリ一覧ページ
  // 全ライブラリの承認・編集・削除を管理

  interface Library {
    id: string;
    name: string;
    scriptId: string;
    authorName: string;
    authorUrl: string;
    status: 'published' | 'pending' | 'rejected';
    updatedAt: Date;
    starCount: number;
    description: string;
  }

  export let data: PageData;
  
  let libraries: Library[] = data.libraries;
  let currentPage = 1;
  let totalItems = libraries.length;
  let itemsPerPage = 10;

  function getStatusBadge(status: Library['status']) {
    switch (status) {
      case 'published':
        return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800';
      case 'pending':
        return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800';
      default:
        return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800';
    }
  }

  function getStatusText(status: Library['status']) {
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

  function handleApprove(id: string) {
    // 承認処理のロジック
    console.log('承認:', id);
  }

  function handleEdit(id: string) {
    // 編集処理のロジック
    console.log('編集:', id);
  }

  function handleDelete(id: string) {
    // 削除処理のロジック
    if (confirm('本当に削除しますか？')) {
      console.log('削除:', id);
    }
  }

  function handleSignOut() {
    // サインアウト処理
    console.log('サインアウト');
  }
</script>

<svelte:head>
  <title>管理画面 - ライブラリ一覧 - AppsScriptHub</title>
  <meta
    name="description"
    content="AppsScriptHub管理者画面 - ライブラリの承認・編集・削除を管理"
  />
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <AdminHeader onSignOut={handleSignOut} />

  <main class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900">ライブラリ管理</h1>
      <a
        href="/admin/libraries/new"
        class="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
      >
        新規追加
      </a>
    </div>

    <!-- Library List Table -->
    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                ライブラリ名
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                作者
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                ステータス
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                最終更新日
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                アクション
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
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
                  <div class="text-sm text-gray-500 truncate max-w-xs">
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
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
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
                  <span class={getStatusBadge(library.status)}>
                    {getStatusText(library.status)}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {new Date(library.updatedAt).toLocaleDateString('ja-JP')}
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                >
                  {#if library.status === 'pending'}
                    <button
                      on:click={() => handleApprove(library.id)}
                      class="text-green-600 hover:text-green-900"
                    >
                      承認
                    </button>
                  {/if}
                  <button
                    on:click={() => handleEdit(library.id)}
                    class="text-indigo-600 hover:text-indigo-900 {library.status ===
                    'pending'
                      ? 'ml-4'
                      : ''}"
                  >
                    編集
                  </button>
                  <button
                    on:click={() => handleDelete(library.id)}
                    class="text-red-600 hover:text-red-900 ml-4"
                  >
                    削除
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"
      >
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            前へ
          </button>
          <button
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            次へ
          </button>
        </div>
        <div
          class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between"
        >
          <div>
            <p class="text-sm text-gray-700">
              全
              <span class="font-medium">{totalItems}</span>
              件中
              <span class="font-medium"
                >{(currentPage - 1) * itemsPerPage + 1}</span
              >
              -
              <span class="font-medium"
                >{Math.min(currentPage * itemsPerPage, totalItems)}</span
              >
              件を表示
            </p>
          </div>
          <div>
            <nav
              class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination"
            >
              <button
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
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
                class="z-10 bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
              >
                1
              </button>
              <button
                class="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
              >
                2
              </button>
              <button
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
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
  </main>

  <!-- Footer -->
  <footer class="bg-gray-50 border-t border-gray-200 mt-12">
    <div class="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div class="text-center text-sm text-gray-500">
        &copy; 2025 wywy LLC. All rights reserved.
      </div>
    </div>
  </footer>
</div>
