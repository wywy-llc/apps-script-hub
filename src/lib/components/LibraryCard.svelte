<script lang="ts">
  // ライブラリ情報を表示するカードコンポーネント
  // 検索結果やライブラリ一覧で使用される

  export let library: {
    id: number;
    name: string;
    description: string;
    tags: string[];
    author: string;
    version: string;
    lastUpdated: string;
  };

  // タグの色設定
  const tagColors: Record<string, string> = {
    Date: 'bg-indigo-50 text-indigo-700 ring-indigo-700/10',
    Utility: 'bg-green-50 text-green-700 ring-green-600/20',
    Format: 'bg-gray-50 text-gray-600 ring-gray-500/10',
    Calendar: 'bg-red-50 text-red-700 ring-red-700/10',
    Japan: 'bg-yellow-50 text-yellow-800 ring-yellow-600/20',
    Holiday: 'bg-gray-50 text-gray-600 ring-gray-500/10',
  };
</script>

<div
  class="border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-gray-300 transition-all"
>
  <h2 class="text-xl font-semibold text-blue-600 hover:underline">
    <a href="/libraries/{library.id}">{library.name}</a>
  </h2>
  <p class="mt-2 text-gray-700">
    {library.description}
  </p>
  <div class="mt-4 flex flex-wrap gap-2">
    {#each library.tags as tag}
      <span
        class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset {tagColors[
          tag
        ] || 'bg-gray-50 text-gray-600 ring-gray-500/10'}"
      >
        {tag}
      </span>
    {/each}
  </div>
  <div class="mt-4 text-sm text-gray-500">
    <span>
      <a href="/users/{library.author}" class="hover:underline"
        >{library.author}</a
      >
    </span>
    <span class="mx-2">/</span>
    <span>{library.version}</span>
    <span class="mx-2">/</span>
    <span>最終更新: {library.lastUpdated}</span>
  </div>
</div>
