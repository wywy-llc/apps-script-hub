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
  <h2 class="mb-6 {isAdminMode ? 'text-2xl font-bold' : 'border-b pb-2 text-2xl font-semibold'}">
    AI による要約
  </h2>
  <div class={isAdminMode ? 'overflow-hidden rounded-lg bg-white shadow-md' : ''}>
    <div class={isAdminMode ? 'px-6 py-8' : ''}>
      <!-- ライブラリ名 -->
      <div class="mb-6">
        <h3 class="mb-2 text-xl font-bold text-gray-900">
          {currentLocale === 'ja'
            ? librarySummary.libraryNameJa || libraryName
            : librarySummary.libraryNameEn || libraryName}
        </h3>
        {#if librarySummary.purposeJa || librarySummary.purposeEn}
          <p class="leading-relaxed text-gray-600">
            {currentLocale === 'ja' ? librarySummary.purposeJa : librarySummary.purposeEn}
          </p>
        {/if}
      </div>

      <!-- 対象ユーザー -->
      {#if librarySummary.targetUsersJa || librarySummary.targetUsersEn}
        <div class="mb-6">
          <h4 class="mb-2 text-lg font-semibold text-gray-800">対象ユーザー</h4>
          <p class="text-gray-600">
            {currentLocale === 'ja' ? librarySummary.targetUsersJa : librarySummary.targetUsersEn}
          </p>
        </div>
      {/if}

      <!-- タグ -->
      {#if (currentLocale === 'ja' ? librarySummary.tagsJa : librarySummary.tagsEn) && (currentLocale === 'ja' ? librarySummary.tagsJa || [] : librarySummary.tagsEn || []).length > 0}
        <div class="mb-6">
          <h4 class="mb-2 text-lg font-semibold text-gray-800">タグ</h4>
          <div class="flex flex-wrap gap-2">
            {#each currentLocale === 'ja' ? librarySummary.tagsJa || [] : librarySummary.tagsEn || [] as tag, index (index)}
              <span
                class="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
              >
                {tag}
              </span>
            {/each}
          </div>
        </div>
      {/if}

      <!-- 解決する課題 -->
      {#if librarySummary.coreProblemJa || librarySummary.coreProblemEn}
        <div class="mb-6">
          <h4 class="mb-2 text-lg font-semibold text-gray-800">解決する課題</h4>
          <p class="leading-relaxed text-gray-600">
            {currentLocale === 'ja' ? librarySummary.coreProblemJa : librarySummary.coreProblemEn}
          </p>
        </div>
      {/if}

      <!-- 主な特徴 -->
      {#if librarySummary.mainBenefits && librarySummary.mainBenefits.length > 0}
        <div class="mb-6">
          <h4 class="mb-3 text-lg font-semibold text-gray-800">主な特徴</h4>
          <div class="space-y-4">
            {#each librarySummary.mainBenefits as benefit, index (index)}
              <div class="border-l-4 border-blue-500 pl-4">
                <h5 class="mb-1 font-medium text-gray-900">
                  {currentLocale === 'ja' ? benefit.title.ja : benefit.title.en}
                </h5>
                <p class="text-sm leading-relaxed text-gray-600">
                  {currentLocale === 'ja' ? benefit.description.ja : benefit.description.en}
                </p>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- 言語設定はヘッダーの LanguageSwitcher で管理 -->
    </div>
  </div>
</div>
