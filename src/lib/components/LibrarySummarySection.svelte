<script lang="ts">
  import { getLocale } from '$lib/paraglide/runtime.js'; // cspell:ignore paraglide
  import type { Locale } from '$lib';
  import type { LibrarySummaryRecord } from '$lib/types/library-summary.js';

  interface Props {
    librarySummary: LibrarySummaryRecord;
    libraryName: string;
    isAdminMode?: boolean;
  }

  let { librarySummary, libraryName, isAdminMode = false }: Props = $props();

  // Paraglide の現在の言語設定を使用（自動的に更新される） // cspell:ignore Paraglide
  let currentLocale = $derived<Locale>(getLocale());
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
        <h3 class="mb-3 text-xl font-bold text-gray-900">
          {currentLocale === 'ja'
            ? librarySummary.libraryNameJa || libraryName
            : librarySummary.libraryNameEn || libraryName}
        </h3>
        {#if librarySummary.purposeJa || librarySummary.purposeEn}
          <p class="text-lg leading-relaxed text-gray-700">
            {currentLocale === 'ja' ? librarySummary.purposeJa : librarySummary.purposeEn}
          </p>
        {/if}
      </div>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <!-- 対象ユーザー -->
        {#if librarySummary.targetUsersJa || librarySummary.targetUsersEn}
          <div class="rounded-lg bg-blue-50 p-4">
            <h4 class="mb-3 flex items-center text-lg font-semibold text-blue-900">
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
            <p class="text-blue-800">
              {currentLocale === 'ja' ? librarySummary.targetUsersJa : librarySummary.targetUsersEn}
            </p>
          </div>
        {/if}

        <!-- 解決する課題 -->
        {#if librarySummary.coreProblemJa || librarySummary.coreProblemEn}
          <div class="rounded-lg bg-amber-50 p-4">
            <h4 class="mb-3 flex items-center text-lg font-semibold text-amber-900">
              <svg
                class="mr-2 h-5 w-5 text-amber-600"
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
            <p class="leading-relaxed text-amber-800">
              {currentLocale === 'ja' ? librarySummary.coreProblemJa : librarySummary.coreProblemEn}
            </p>
          </div>
        {/if}
      </div>

      <!-- タグ -->
      {#if (currentLocale === 'ja' ? librarySummary.tagsJa : librarySummary.tagsEn) && (currentLocale === 'ja' ? librarySummary.tagsJa || [] : librarySummary.tagsEn || []).length > 0}
        <div class="my-4">
          <h4 class="mb-3 text-lg font-semibold text-gray-800">タグ</h4>
          <div class="flex flex-wrap gap-2">
            {#each currentLocale === 'ja' ? librarySummary.tagsJa || [] : librarySummary.tagsEn || [] as tag, index (index)}
              <span
                class="inline-flex items-center rounded-full bg-gradient-to-r from-blue-100 to-blue-200 px-4 py-2 text-sm font-medium text-blue-900 shadow-sm"
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
          <h4 class="mb-4 flex items-center text-lg font-semibold text-gray-800">
            <svg
              class="mr-2 h-5 w-5 text-green-600"
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
              <div class="rounded-lg border border-green-200 bg-green-50 p-4 shadow-sm">
                <div class="mb-2 flex items-center">
                  <div
                    class="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-green-100"
                  >
                    <span class="text-sm font-semibold text-green-700">{index + 1}</span>
                  </div>
                  <h5 class="font-semibold text-green-900">
                    {currentLocale === 'ja' ? benefit.title.ja : benefit.title.en}
                  </h5>
                </div>
                <p class="text-sm leading-relaxed text-green-800">
                  {currentLocale === 'ja' ? benefit.description.ja : benefit.description.en}
                </p>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- 使用例 -->
      {#if librarySummary.usageExampleJa || librarySummary.usageExampleEn}
        <div class="mb-6">
          <h4 class="mb-4 flex items-center text-lg font-semibold text-gray-800">
            <svg
              class="mr-2 h-5 w-5 text-purple-600"
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
          <div class="rounded-lg border border-gray-300 bg-gray-900 p-1 shadow-lg">
            <div class="flex items-center justify-between rounded-t-lg bg-gray-800 px-4 py-2">
              <div class="flex space-x-2">
                <div class="h-3 w-3 rounded-full bg-red-500"></div>
                <div class="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div class="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <span class="text-xs text-gray-400">Code Example</span>
            </div>
            <div class="rounded-b-lg bg-gray-900 p-4">
              <pre
                class="overflow-x-auto text-sm leading-relaxed whitespace-pre-wrap text-green-400"><code
                  >{currentLocale === 'ja'
                    ? librarySummary.usageExampleJa
                    : librarySummary.usageExampleEn}</code
                ></pre>
            </div>
          </div>
        </div>
      {/if}

      <!-- 言語設定はヘッダーの LanguageSwitcher で管理 -->
    </div>
  </div>
</div>
