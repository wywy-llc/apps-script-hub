<script lang="ts">
  import { getLocale } from '$lib/paraglide/runtime.js'; // cspell:ignore paraglide
  import type { Locale } from '$lib';
  import type { LibrarySummaryRecord } from '$lib/types/library-summary.js';
  import MarkdownRenderer from '$lib/components/MarkdownRenderer.svelte';

  interface Props {
    librarySummary: LibrarySummaryRecord;
    libraryName: string;
    isAdminMode?: boolean;
  }

  let { librarySummary, libraryName, isAdminMode = false }: Props = $props();

  // Paraglide の現在の言語設定を使用（自動的に更新される） // cspell:ignore Paraglide
  let currentLocale = $derived<Locale>(getLocale());

  // 使用例のマークダウンを取得
  let usageExample = $derived(
    currentLocale === 'ja' ? librarySummary.usageExampleJa : librarySummary.usageExampleEn
  );
</script>

<div class="mt-8">
  <h2
    class="mb-6 {isAdminMode
      ? 'text-2xl font-bold'
      : 'border-b border-gray-200 pb-3 text-2xl font-semibold text-gray-900'}"
  >
    AI による要約
  </h2>
  <div
    class={isAdminMode
      ? 'overflow-hidden rounded-lg bg-white shadow-md'
      : 'rounded-lg border border-gray-200 bg-white'}
  >
    <div class={isAdminMode ? 'px-6 py-8' : 'px-6 py-6'}>
      <!-- ライブラリ名 -->
      <div class="mb-8">
        <h3 class="mb-3 text-lg font-bold text-gray-900">
          {currentLocale === 'ja'
            ? librarySummary.libraryNameJa || libraryName
            : librarySummary.libraryNameEn || libraryName}
        </h3>
        {#if librarySummary.purposeJa || librarySummary.purposeEn}
          <p class="text-sm leading-relaxed text-gray-700">
            {currentLocale === 'ja' ? librarySummary.purposeJa : librarySummary.purposeEn}
          </p>
        {/if}
      </div>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <!-- 対象ユーザー -->
        {#if librarySummary.targetUsersJa || librarySummary.targetUsersEn}
          <div class="rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-sm">
            <h4 class="mb-3 flex items-center text-base font-semibold text-blue-900">
              <svg
                class="mr-2 h-5 w-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                ></path>
              </svg>
              対象ユーザー
            </h4>
            <p class="text-sm leading-relaxed text-blue-800">
              {currentLocale === 'ja' ? librarySummary.targetUsersJa : librarySummary.targetUsersEn}
            </p>
          </div>
        {/if}

        <!-- 解決する課題 -->
        {#if librarySummary.coreProblemJa || librarySummary.coreProblemEn}
          <div class="rounded-lg border border-yellow-200 bg-yellow-50 p-4 shadow-sm">
            <h4 class="mb-3 flex items-center text-base font-semibold text-yellow-900">
              <svg
                class="mr-2 h-5 w-5 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                ></path>
              </svg>
              解決する課題
            </h4>
            <p class="text-sm leading-relaxed text-yellow-800">
              {currentLocale === 'ja' ? librarySummary.coreProblemJa : librarySummary.coreProblemEn}
            </p>
          </div>
        {/if}
      </div>

      <!-- タグ -->
      {#if (currentLocale === 'ja' ? librarySummary.tagsJa : librarySummary.tagsEn) && (currentLocale === 'ja' ? librarySummary.tagsJa || [] : librarySummary.tagsEn || []).length > 0}
        <div class="my-4">
          <h4 class="mb-3 flex items-center text-base font-semibold text-blue-800">
            <svg
              class="mr-2 h-5 w-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              ></path>
            </svg>
            タグ
          </h4>
          <div class="flex flex-wrap gap-2">
            {#each currentLocale === 'ja' ? librarySummary.tagsJa || [] : librarySummary.tagsEn || [] as tag, index (index)}
              <span
                class="inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-xs font-medium text-blue-800 shadow-sm"
              >
                {tag}
              </span>
            {/each}
          </div>
        </div>
      {/if}

      <!-- 主な特徴 -->
      {#if librarySummary.mainBenefits && librarySummary.mainBenefits.length > 0}
        <div class="mb-8">
          <h4 class="mb-4 flex items-center text-base font-semibold text-emerald-800">
            <svg
              class="mr-2 h-5 w-5 text-emerald-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            主な特徴
          </h4>
          <div class="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {#each librarySummary.mainBenefits as benefit, index (index)}
              <div class="rounded-lg border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
                <div class="mb-2 flex items-center">
                  <div
                    class="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600"
                  >
                    <span class="text-sm font-semibold text-white">{index + 1}</span>
                  </div>
                  <h5 class="text-base font-semibold text-emerald-900">
                    {currentLocale === 'ja' ? benefit.title.ja : benefit.title.en}
                  </h5>
                </div>
                <p class="text-sm leading-relaxed text-emerald-800">
                  {currentLocale === 'ja' ? benefit.description.ja : benefit.description.en}
                </p>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- 使用例 -->
      {#if usageExample}
        <div class="mb-6">
          <h4 class="mb-4 flex items-center text-base font-semibold text-indigo-800">
            <svg
              class="mr-2 h-5 w-5 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              ></path>
            </svg>
            使用例
          </h4>
          <MarkdownRenderer content={usageExample} class="shadow-sm" />
        </div>
      {/if}

      <!-- 言語設定はヘッダーの LanguageSwitcher で管理 -->
    </div>
  </div>
</div>
