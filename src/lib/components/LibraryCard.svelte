<script lang="ts">
  import { last_updated } from '$lib/paraglide/messages.js';
  import { getLocale } from '$lib/paraglide/runtime.js';
  // cspell:ignore paraglide
  import type { Locale } from '$lib';
  import type { Library } from '$lib/server/db/schema.js';
  import type { LibrarySummaryRecord } from '$lib/types/library-summary.js';

  interface Props {
    library: Library;
    librarySummary?: LibrarySummaryRecord | null;
  }

  let { library, librarySummary }: Props = $props();

  // Paraglide の現在の言語設定を使用（自動的に更新される） // cspell:ignore Paraglide
  let currentLocale = $derived<Locale>(getLocale());

  // 数値をフォーマットする関数
  function formatNumber(num: number): string {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  }

  // タグクリック時の検索機能（将来の拡張用）
  // function searchByTag(tag: string) {
  //   window.location.href = `/user/search?q=${encodeURIComponent(tag)}`;
  // }
</script>

<div
  data-testid="library-card"
  class="flex flex-col rounded-lg border border-gray-200 p-6 transition-all hover:border-gray-300 hover:shadow-lg"
>
  <div class="flex-grow">
    <h3 class="text-xl font-semibold text-blue-600 hover:underline">
      <a href="/user/libraries/{library.id}">
        {library.name}
      </a>
    </h3>
    <p class="mt-2 text-sm text-gray-600">
      {librarySummary
        ? currentLocale === 'ja'
          ? librarySummary.purposeJa || library.description
          : librarySummary.purposeEn || library.description
        : library.description}
    </p>

    <!-- タグ -->
    {#if librarySummary && (currentLocale === 'ja' ? librarySummary.tagsJa : librarySummary.tagsEn) && (currentLocale === 'ja' ? librarySummary.tagsJa || [] : librarySummary.tagsEn || []).length > 0}
      <div class="mt-3">
        <div class="flex flex-wrap gap-1">
          {#each (currentLocale === 'ja' ? librarySummary.tagsJa || [] : librarySummary.tagsEn || []).slice(0, 3) as tag, index (index)}
            <span
              class="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
            >
              {tag}
            </span>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  <div class="mt-4 space-y-2">
    <div class="flex items-center text-xs text-gray-500">
      <svg
        class="mr-1 h-3 w-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        ></path>
      </svg>
      <a href={library.authorUrl} class="hover:text-gray-700 hover:underline"
        >{library.authorName}</a
      >
    </div>
    <div class="flex items-center justify-between text-xs text-gray-500">
      <span>
        {last_updated()}: {currentLocale === 'ja'
          ? new Date(library.updatedAt).toLocaleDateString('ja-JP')
          : new Date(library.updatedAt).toLocaleDateString('en-US')}
      </span>
      <div class="flex items-center space-x-3">
        <div class="flex items-center space-x-1">
          <svg
            class="h-3 w-3 text-yellow-400"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            ></path>
          </svg>
          <span>{formatNumber(library.starCount || 0)}</span>
        </div>
        <div class="flex items-center space-x-1">
          <svg
            class="h-3 w-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            ></path>
          </svg>
          <span>{formatNumber(library.copyCount || 0)}</span>
        </div>
      </div>
    </div>
  </div>
</div>
