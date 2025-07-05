<script lang="ts">
  import type { Locale } from '$lib';
  import { LANGUAGE_NAMES } from '$lib';
  import { getLocale, locales, setLocale } from '$lib/paraglide/runtime.js';
  import { onMount } from 'svelte';

  // localStorageのキー
  const LOCALE_STORAGE_KEY = 'preferred-locale';

  // 現在のロケールを取得
  let currentLocale = $derived(getLocale());

  // ドロップダウンの開閉状態
  let isOpen = $state(false);

  // コンポーネント初期化時にlocalStorageから設定を読み込み
  onMount(() => {
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale;
      if (savedLocale && locales.includes(savedLocale) && savedLocale !== getLocale()) {
        setLocale(savedLocale);
      }
    }
  });

  // 現在のページのURLを他の言語にローカライズ
  function switchLanguage(newLocale: Locale) {
    setLocale(newLocale);

    // localStorageに保存
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    }

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
    class="flex cursor-pointer items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm transition-colors select-none hover:bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
    onclick={toggleDropdown}
    aria-expanded={isOpen}
    aria-haspopup="listbox"
  >
    <div class="flex items-center">
      <!-- 地球儀アイコン -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="mr-2 h-5 w-5 text-gray-600"
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
      <span class="text-sm font-medium text-gray-800">
        {LANGUAGE_NAMES[currentLocale] || currentLocale}
      </span>
    </div>
    <!-- 開閉を示す矢印アイコン -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-4 w-4 text-gray-600 transition-transform duration-200 {isOpen ? 'rotate-180' : ''}"
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
      class="absolute top-full left-0 z-10 mt-1 w-full overflow-hidden rounded-lg border border-gray-300 bg-white shadow-lg"
      role="listbox"
    >
      <ul class="text-gray-700">
        {#each locales as locale (locale)}
          <li>
            <button
              type="button"
              class="w-full cursor-pointer border-b border-gray-100 px-3 py-2 text-left text-sm transition-colors last:border-b-0 hover:bg-gray-100
                {currentLocale === locale
                ? 'bg-blue-600 font-medium text-white hover:bg-blue-700'
                : ''}"
              onclick={() => switchLanguage(locale)}
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
