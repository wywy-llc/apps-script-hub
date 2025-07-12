<script lang="ts">
  import LibraryCard from '$lib/components/LibraryCard.svelte';
  import SearchBox from '$lib/components/SearchBox.svelte';
  import { createFullUrl, getLogoUrl } from '$lib/constants/app-config.js';
  import {
    all_libraries_count,
    meta_keywords_home,
    next,
    no_search_results,
    previous,
    search_from_box,
    search_gas_libraries,
    search_results_for,
    try_different_keywords,
  } from '$lib/paraglide/messages.js';
  import type { PageData } from './$types.js';

  // 検索結果ページコンポーネント
  // GASライブラリの検索結果を表示し、ページネーション機能を提供

  export let data: PageData;

  $: ({ libraries, totalResults, searchQuery, currentPage, itemsPerPage } = data);

  // 検索ボックス用のローカル値（将来の拡張用）
  // let value = searchQuery;

  // 結果件数に基づいてページ数を動的に計算
  $: totalPages = Math.ceil(totalResults / itemsPerPage);

  // SEO用のmeta情報を動的に生成
  $: pageTitle = searchQuery
    ? `${search_results_for({ query: searchQuery, count: totalResults })} - GAS Library Hub`
    : `${all_libraries_count({ count: totalResults })} - GAS Library Hub`;

  $: pageDescription = searchQuery
    ? `"${searchQuery}"の検索結果を表示中。${totalResults}件のGoogle Apps Scriptライブラリが見つかりました。`
    : `Google Apps Scriptライブラリの一覧。${totalResults}件の便利なライブラリを検索できます。`;

  $: currentUrl = searchQuery
    ? createFullUrl(`/user/search?q=${encodeURIComponent(searchQuery)}&page=${currentPage}`)
    : createFullUrl('/user/search');
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={pageDescription} />
  <meta name="keywords" content={meta_keywords_home()} />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content={currentUrl} />
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={pageDescription} />
  <meta property="og:image" content={getLogoUrl()} />
  <meta property="og:site_name" content="GAS Library Hub" />

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content={currentUrl} />
  <meta property="twitter:title" content={pageTitle} />
  <meta property="twitter:description" content={pageDescription} />
  <meta property="twitter:image" content={getLogoUrl()} />

  <!-- Additional SEO Meta Tags -->
  <link rel="canonical" href={currentUrl} />

  <!-- Pagination Meta Tags -->
  {#if currentPage > 1}
    <link
      rel="prev"
      href={searchQuery
        ? `/user/search?q=${encodeURIComponent(searchQuery)}&page=${currentPage - 1}`
        : '/user/search'}
    />
  {/if}
  {#if currentPage < totalPages}
    <link
      rel="next"
      href={`/user/search?q=${encodeURIComponent(searchQuery)}&page=${currentPage + 1}`}
    />
  {/if}
</svelte:head>

<main class="container mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
  <!-- 検索バーと結果件数 -->
  <header class="mb-8">
    <div class="mx-auto mb-6 max-w-xl">
      <SearchBox placeholder={search_gas_libraries()} value={searchQuery} />
    </div>
    {#if searchQuery}
      <h1 class="text-center text-2xl font-bold text-gray-800">
        {search_results_for({ query: searchQuery, count: totalResults })}
      </h1>
    {:else}
      <h1 class="text-center text-2xl font-bold text-gray-800">
        {all_libraries_count({ count: totalResults })}
      </h1>
    {/if}
  </header>

  <!-- ライブラリリスト -->
  {#if libraries.length > 0}
    <section class="mx-auto max-w-3xl space-y-6" aria-label="検索結果ライブラリ一覧">
      {#each libraries as library (library.id)}
        <article>
          <LibraryCard {library} librarySummary={library.librarySummary} />
        </article>
      {/each}
    </section>

    <!-- ページネーション -->
    <nav
      class="mx-auto mt-12 flex max-w-3xl items-center justify-between border-t border-gray-200 px-4 pt-6 sm:px-0"
      aria-label="ページネーション"
    >
      <div class="-mt-px flex w-0 flex-1">
        {#if currentPage > 1}
          <a
            href={`/user/search?q=${encodeURIComponent(searchQuery)}&page=${currentPage - 1}`}
            class="inline-flex items-center border-t-2 border-transparent pt-4 pr-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
            aria-label="前のページへ"
            rel="prev"
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
            {previous()}
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
              href={`/user/search?q=${encodeURIComponent(searchQuery)}&page=${pageNum}`}
              class="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
              aria-label="ページ {pageNum} へ"
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
            href={`/user/search?q=${encodeURIComponent(searchQuery)}&page=${totalPages}`}
            class="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
            aria-label="最終ページ {totalPages} へ"
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
            aria-label="次のページへ"
            rel="next"
          >
            {next()}
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
    <section class="mx-auto max-w-3xl py-12 text-center" aria-label="検索結果なし">
      <svg
        class="mx-auto h-12 w-12 text-gray-400"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
        />
      </svg>
      <h2 class="mt-4 text-lg font-medium text-gray-900">
        {searchQuery ? no_search_results() : search_gas_libraries()}
      </h2>
      <p class="mt-2 text-gray-500">
        {searchQuery ? try_different_keywords() : search_from_box()}
      </p>
    </section>
  {/if}
</main>
