<script lang="ts">
  import { goto } from '$app/navigation';

  // GASライブラリ検索コンポーネント
  // トップページとサーチページで共通利用されるレスポンシブ検索ボックス

  // Props
  export let placeholder = 'GASライブラリを検索';
  export let value = '';
  export let size: 'small' | 'large' = 'large';

  // 検索実行
  function handleSearch(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const query = formData.get('q') as string;

    if (query.trim()) {
      goto(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  // サイズによるスタイル切り替え
  $: inputClasses =
    size === 'large'
      ? 'block w-full rounded-full border-0 bg-white py-5 pl-12 pr-4 text-gray-900 shadow-md ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 text-base leading-6'
      : 'block w-full rounded-full border-0 bg-white py-3 pl-10 pr-4 text-gray-900 shadow-md ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 text-sm leading-6';

  $: iconContainerClasses =
    size === 'large'
      ? 'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4'
      : 'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3';
</script>

<form class="relative" on:submit={handleSearch}>
  <div class={iconContainerClasses}>
    <svg
      class="h-6 w-6 text-gray-400"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fill-rule="evenodd"
        d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
        clip-rule="evenodd"
      />
    </svg>
  </div>
  <input
    type="search"
    name="q"
    id="search"
    class={inputClasses}
    {placeholder}
    bind:value
  />
</form>
