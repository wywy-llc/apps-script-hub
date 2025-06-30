<script lang="ts">
  import LibraryCard from '$lib/components/LibraryCard.svelte';
  import SearchBox from '$lib/components/SearchBox.svelte';
  import type { PageData } from './$types.js';

  // 検索結果ページコンポーネント
  // GASライブラリの検索結果を表示し、ページネーション機能を提供

  export let data: PageData;

  $: ({ libraries, totalResults, searchQuery, currentPage, itemsPerPage } = data);

  // 検索ボックス用のローカル値（将来の拡張用）
  // let value = searchQuery;

  // 結果件数に基づいてページ数を動的に計算
  $: totalPages = Math.ceil(totalResults / itemsPerPage);
</script>

<svelte:head>
  <title>{searchQuery ? `「${searchQuery}」の検索結果` : 'ライブラリ一覧'} - AppsScriptHub</title>
  <meta
    name="description"
    content="AppsScriptHubでのライブラリ検索結果ページ。GASで使える便利なライブラリを見つけよう。"
  />
</svelte:head>

<div class="container mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
  <!-- 検索バーと結果件数 -->
  <div class="mb-8">
    <div class="mx-auto mb-6 max-w-xl">
      <SearchBox placeholder="GASライブラリを検索" value={searchQuery} />
    </div>
    {#if searchQuery}
      <h1 class="text-center text-2xl font-bold text-gray-800">
        「{searchQuery}」の検索結果: {totalResults}件
      </h1>
    {:else}
      <h1 class="text-center text-2xl font-bold text-gray-800">
        すべてのライブラリ ({totalResults}件)
      </h1>
    {/if}
  </div>

  <!-- ライブラリリスト -->
  {#if libraries.length > 0}
    <div class="mx-auto max-w-3xl space-y-6">
      {#each libraries as library (library.id)}
        <LibraryCard {library} librarySummary={library.librarySummary} />
      {/each}
    </div>

    <!-- ページネーション -->
    <nav
      class="mx-auto mt-12 flex max-w-3xl items-center justify-between border-t border-gray-200 px-4 pt-6 sm:px-0"
    >
      <div class="-mt-px flex w-0 flex-1">
        {#if currentPage > 1}
          <a
            href={`/user/search?q=${encodeURIComponent(searchQuery)}&page=${currentPage - 1}`}
            class="inline-flex items-center border-t-2 border-transparent pt-4 pr-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
          >
            <svg
              class="mr-3 h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M18 10a.75.75 0 01-.75.75H4.66l2.1 1.95a.75.75 0 11-1.02 1.1l-3.5-3.25a.75.75 0 010-1.1l3.5-3.25a.75.75 0 111.02 1.1l-2.1 1.95h12.59A.75.75 0 0118 10z"
                clip-rule="evenodd"
              />
            </svg>
            前へ
          </a>
        {/if}
      </div>
      <div class="hidden md:-mt-px md:flex">
        {#each Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1) as pageNum (pageNum)}
          {#if pageNum === currentPage}
            <span
              class="inline-flex items-center border-t-2 border-blue-600 px-4 pt-4 text-sm font-medium text-blue-600"
              aria-current="page"
            >
              {pageNum}
            </span>
          {:else}
            <a
              href="/user/search?q={encodeURIComponent(searchQuery)}&page={pageNum}"
              class="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
            >
              {pageNum}
            </a>
          {/if}
        {/each}
        {#if totalPages > 5}
          <span
            class="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500"
            >...</span
          >
          <a
            href="/user/search?q={encodeURIComponent(searchQuery)}&page={totalPages}"
            class="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
          >
            {totalPages}
          </a>
        {/if}
      </div>
      <div class="-mt-px flex w-0 flex-1 justify-end">
        {#if currentPage < totalPages}
          <a
            href={`/user/search?q=${encodeURIComponent(searchQuery)}&page=${currentPage + 1}`}
            class="inline-flex items-center border-t-2 border-transparent pt-4 pl-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
          >
            次へ
            <svg
              class="ml-3 h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M2 10a.75.75 0 01.75-.75h12.59l-2.1-1.95a.75.75 0 111.02-1.1l3.5 3.25a.75.75 0 010 1.1l-3.5 3.25a.75.75 0 11-1.02-1.1l2.1-1.95H2.75A.75.75 0 012 10z"
                clip-rule="evenodd"
              />
            </svg>
          </a>
        {/if}
      </div>
    </nav>
  {:else}
    <div class="mx-auto max-w-3xl py-12 text-center">
      <svg
        class="mx-auto h-12 w-12 text-gray-400"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
        />
      </svg>
      <h3 class="mt-4 text-lg font-medium text-gray-900">
        {searchQuery ? '検索結果が見つかりませんでした' : 'GASライブラリを検索'}
      </h3>
      <p class="mt-2 text-gray-500">
        {searchQuery
          ? '別のキーワードで検索してみてください。'
          : '上の検索ボックスからライブラリを検索できます。'}
      </p>
    </div>
  {/if}
</div>
