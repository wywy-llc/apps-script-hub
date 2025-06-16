<script lang="ts">
  import { getLocale, setLocale, locales } from '$lib/paraglide/runtime.js';
  import type { Locale } from '$lib';
  import { LANGUAGE_NAMES } from '$lib';

  // 現在のロケールを取得
  $: currentLocale = getLocale();

  // 現在のページのURLを他の言語にローカライズ
  function switchLanguage(newLocale: Locale) {
    setLocale(newLocale);
  }
</script>

<div class="relative inline-block text-left">
  <select
    class="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
    value={currentLocale}
    on:change={(e) => switchLanguage(e.currentTarget.value as Locale)}
  >
    {#each locales as locale}
      <option value={locale}>
        {LANGUAGE_NAMES[locale as Locale] || locale}
      </option>
    {/each}
  </select>
</div>