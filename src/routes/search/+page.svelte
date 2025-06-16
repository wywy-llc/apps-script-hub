<script lang="ts">
  import { page } from '$app/stores';
  import LibraryCard from '$lib/components/LibraryCard.svelte';
  import SearchBox from '$lib/components/SearchBox.svelte';
  import { onMount } from 'svelte';

  // 検索結果ページコンポーネント
  // GASライブラリの検索結果を表示し、ページネーション機能を提供

  let searchQuery = '';
  let totalResults = 0;
  let currentPage = 1;
  const itemsPerPage = 10;

  // 結果件数に基づいてページ数を動的に計算
  $: totalPages = Math.ceil(totalResults / itemsPerPage);

  // 検索結果のモックデータ
  const mockLibraries = [
    {
      id: 1,
      name: 'GasDateFormatter',
      description:
        'Moment.jsライクなシンタックスで、GASの日時オブジェクトを簡単にフォーマットするためのユーティリティライブラリ。タイムゾーンの扱いもサポート。',
      tags: ['Date', 'Utility', 'Format'],
      author: 'user-name',
      lastUpdated: '3日前',
      stars: 492,
      downloads: 7300,
    },
    {
      id: 2,
      name: 'CalendarEventUtil',
      description:
        'Googleカレンダーのイベント作成・更新・削除をより直感的に行えるヘルパー集。繰り返しイベントの操作や、会議室の予約などを簡略化します。',
      tags: ['Calendar', 'Date', 'Utility'],
      author: 'developer-taro',
      lastUpdated: '2週間前',
      stars: 876,
      downloads: 13200,
    },
    {
      id: 3,
      name: 'JapaneseDate',
      description:
        '日本の祝日判定や和暦（元号）の変換機能を提供します。内閣府の祝日CSVデータソースと連携可能です。',
      tags: ['Date', 'Japan', 'Holiday'],
      author: 'gas-master',
      lastUpdated: '1ヶ月前',
      stars: 325,
      downloads: 4800,
    },
  ];

  onMount(() => {
    // URLクエリパラメータから検索キーワードを取得
    searchQuery = $page.url.searchParams.get('q') || '';
    totalResults = mockLibraries.length;
  });
</script>

<svelte:head>
  <title>「{searchQuery}」の検索結果 - AppsScriptHub</title>
  <meta
    name="description"
    content="AppsScriptHubでのライブラリ検索結果ページ。GASで使える便利なライブラリを見つけよう。"
  />
</svelte:head>

<div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
  <!-- 検索バーと結果件数 -->
  <div class="mb-8">
    <div class="max-w-xl mx-auto mb-6">
      <SearchBox placeholder="GASライブラリを検索" value={searchQuery} />
    </div>
    {#if searchQuery}
      <h1 class="text-2xl font-bold text-center text-gray-800">
        {totalResults}件のライブラリが見つかりました
      </h1>
    {:else}
      <h1 class="text-2xl font-bold text-center text-gray-800">
        ライブラリを検索
      </h1>
    {/if}
  </div>

  <!-- 検索結果リスト -->
  {#if searchQuery && mockLibraries.length > 0}
    <div class="max-w-3xl mx-auto space-y-6">
      {#each mockLibraries as library}
        <LibraryCard {library} />
      {/each}
    </div>

    <!-- ページネーション -->
    <nav
      class="flex items-center justify-between border-t border-gray-200 px-4 sm:px-0 mt-12 pt-6 max-w-3xl mx-auto"
    >
      <div class="-mt-px flex w-0 flex-1">
        {#if currentPage > 1}
          <a
            href={`/search?q=${encodeURIComponent(searchQuery)}&page=${currentPage - 1}`}
            class="inline-flex items-center border-t-2 border-transparent pr-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
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
        {#each Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1) as pageNum}
          {#if pageNum === currentPage}
            <span
              class="inline-flex items-center border-t-2 border-blue-600 px-4 pt-4 text-sm font-medium text-blue-600"
              aria-current="page"
            >
              {pageNum}
            </span>
          {:else}
            <a
              href="/search?q={encodeURIComponent(searchQuery)}&page={pageNum}"
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
            href="/search?q={encodeURIComponent(searchQuery)}&page={totalPages}"
            class="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
          >
            {totalPages}
          </a>
        {/if}
      </div>
      <div class="-mt-px flex w-0 flex-1 justify-end">
        {#if currentPage < totalPages}
          <a
            href={`/search?q=${encodeURIComponent(searchQuery)}&page=${currentPage + 1}`}
            class="inline-flex items-center border-t-2 border-transparent pl-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
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
  {:else if searchQuery}
    <div class="max-w-3xl mx-auto text-center py-12">
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
        検索結果が見つかりませんでした
      </h3>
      <p class="mt-2 text-gray-500">別のキーワードで検索してみてください。</p>
    </div>
  {:else}
    <div class="max-w-3xl mx-auto text-center py-12">
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
        GASライブラリを検索
      </h3>
      <p class="mt-2 text-gray-500">
        上の検索ボックスからライブラリを検索できます。
      </p>
    </div>
  {/if}
</div>
