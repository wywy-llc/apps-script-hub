<script lang="ts">
  // ライブラリ情報を表示するカードコンポーネント
  // 検索結果やライブラリ一覧で使用される

  export let library: {
    id: number;
    name: string;
    description: string;
    tags: string[];
    author: string;
    lastUpdated: string;
    stars: number;
    downloads: number;
  };

  // 数値をフォーマットする関数
  function formatNumber(num: number): string {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  }

  // タグクリック時の検索機能
  function searchByTag(tag: string) {
    window.location.href = `/search?q=${encodeURIComponent(tag)}`;
  }
</script>

<div
  class="border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-gray-300 transition-all flex flex-col"
>
  <div class="flex-grow">
    <h3 class="text-xl font-semibold text-blue-600 hover:underline">
      <a href="/libraries/{library.id}">{library.name}</a>
    </h3>
    <p class="mt-2 text-gray-600 text-sm">
      {library.description}
    </p>
  </div>
  <div class="mt-4">
    <div class="flex flex-wrap gap-2">
      {#each library.tags as tag}
        <button
          class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset bg-indigo-50 text-indigo-700 ring-indigo-700/10 hover:bg-indigo-100 hover:text-indigo-800 hover:ring-indigo-800/20 transition-colors cursor-pointer"
          on:click={() => searchByTag(tag)}
          title="「{tag}」で検索"
        >
          {tag}
        </button>
      {/each}
    </div>
    <div class="mt-4 space-y-2">
      <div class="flex items-center text-xs text-gray-500">
        <svg
          class="h-3 w-3 mr-1"
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
        <a
          href="/users/{library.author}"
          class="hover:underline hover:text-gray-700">{library.author}</a
        >
      </div>
      <div class="flex items-center justify-between text-xs text-gray-500">
        <span>最終更新: {library.lastUpdated}</span>
        <div class="flex items-center space-x-3">
          <div class="flex items-center space-x-1">
            <svg
              class="h-3 w-3"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.286 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.286-3.957a1 1 0 00-.364-1.118L2.049 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z"
              ></path>
            </svg>
            <span>{formatNumber(library.stars)}</span>
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
            <span>{formatNumber(library.downloads)}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
