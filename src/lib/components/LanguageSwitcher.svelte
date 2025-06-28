<script lang="ts">
  import type { Locale } from '$lib';
  import { LANGUAGE_NAMES } from '$lib';
  import { getLocale, locales, setLocale } from '$lib/paraglide/runtime.js';

  // 現在のロケールを取得
  let currentLocale = getLocale();

  // ドロップダウンの開閉状態
  let isOpen = false;

  // 現在のページのURLを他の言語にローカライズ
  function switchLanguage(newLocale: Locale) {
    setLocale(newLocale);
    isOpen = false; // 言語選択後にドロップダウンを閉じる
  }

  // ドロップダウンの開閉をトグル
  function toggleDropdown() {
    isOpen = !isOpen;
  }

  // 外部クリックでドロップダウンを閉じる
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.language-selector')) {
      isOpen = false;
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

<div class="language-selector relative inline-block">
  <!-- ヘッダー部分 (クリックで開閉) -->
  <button
    type="button"
    class="flex items-center justify-between bg-white border border-gray-300 rounded-lg shadow-sm px-3 py-2 cursor-pointer select-none hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
    on:click={toggleDropdown}
    aria-expanded={isOpen}
    aria-haspopup="listbox"
  >
    <div class="flex items-center">
      <!-- 地球儀アイコン -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 text-gray-600 mr-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
        />
      </svg>
      <!-- 選択中の言語を表示 -->
      <span class="font-medium text-gray-800 text-sm">
        {LANGUAGE_NAMES[currentLocale] || currentLocale}
      </span>
    </div>
    <!-- 開閉を示す矢印アイコン -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-4 w-4 text-gray-600 transition-transform duration-200 {isOpen
        ? 'rotate-180'
        : ''}"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  <!-- 言語リスト -->
  {#if isOpen}
    <div
      class="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10 overflow-hidden"
      role="listbox"
    >
      <ul class="text-gray-700">
        {#each locales as locale (locale)}
          <li>
            <button
              type="button"
              class="w-full text-left px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0 transition-colors
                {currentLocale === locale
                ? 'bg-blue-600 text-white font-medium hover:bg-blue-700'
                : ''}"
              on:click={() => switchLanguage(locale)}
              role="option"
              aria-selected={currentLocale === locale}
            >
              {LANGUAGE_NAMES[locale as Locale] || locale}
            </button>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</div>

<style>
  .rotate-180 {
    transform: rotate(180deg);
  }
</style>
