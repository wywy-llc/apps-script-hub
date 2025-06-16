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
    Logging: 'bg-blue-50 text-blue-700 ring-blue-700/10',
    Utility: 'bg-green-50 text-green-700 ring-green-600/20',
    WebApp: 'bg-pink-50 text-pink-700 ring-pink-700/10',
    HTML: 'bg-purple-50 text-purple-700 ring-purple-700/10',
    Testing: 'bg-gray-50 text-gray-600 ring-gray-500/10',
    Date: 'bg-indigo-50 text-indigo-700 ring-indigo-700/10',
    Format: 'bg-yellow-50 text-yellow-800 ring-yellow-600/20',
    Calendar: 'bg-red-50 text-red-700 ring-red-700/10',
    Spreadsheet: 'bg-emerald-50 text-emerald-700 ring-emerald-700/10',
    API: 'bg-cyan-50 text-cyan-700 ring-cyan-700/10',
    Email: 'bg-orange-50 text-orange-700 ring-orange-700/10',
    Template: 'bg-violet-50 text-violet-700 ring-violet-700/10',
  };
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
        <span
          class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset {tagColors[
            tag
          ] || 'bg-gray-50 text-gray-600 ring-gray-500/10'}"
        >
          {tag}
        </span>
      {/each}
    </div>
    <p class="mt-4 text-xs text-gray-500">最終更新: {library.lastUpdated}</p>
  </div>
</div>
