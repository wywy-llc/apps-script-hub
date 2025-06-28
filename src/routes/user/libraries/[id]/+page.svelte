<script lang="ts">
  import { page } from '$app/state';
  import MarkdownRenderer from '$lib/components/MarkdownRenderer.svelte';
  import { onMount } from 'svelte';

  // ライブラリ詳細ページコンポーネント
  // 特定のGASライブラリの詳細情報、README、メソッド一覧を表示

  let libraryId = '';
  let library = {
    name: '',
    description: '',
    author: '',
    publishedDate: '',
    repository: '',
    homepage: '',
    license: '',
    version: '',
    scriptId: '',
    libraryUrl: '',
  };

  // スクリプトIDのコピー数を管理
  let scriptIdCopyCount = 0;

  // モックデータ（実際の実装では API から取得）
  const mockLibraries = {
    '1': {
      name: 'GasDateFormatter',
      description: 'Moment.jsライクなシンタックスで、GASの日時オブジェクトを簡単にフォーマット',
      author: 'user-name',
      publishedDate: '2025/05/28',
      repository: 'https://github.com/user-name/gas-date-formatter',
      homepage: 'https://example.com',
      license: 'MIT',
      version: 'v1.2.0',
      scriptId: '1mbq56Ik4-I_4rnVlr9lTxJoXHStkjHYDyMHjmDWiRiJR3MDl-ThHwnbg',
      libraryUrl: 'https://script.google.com/macros/library/d/1mbq.../24',
    },
  };

  const readmeContent = `
## 概要

GAS (Google Apps Script) の標準の \`Utilities.formatDate()\` は便利ですが、タイムゾーンの指定が必須であったり、フォーマット文字列が少し特殊だったりします。

このライブラリは、より直感的で広く使われている [Moment.js](https://momentjs.com/) のような構文で日付フォーマットを可能にし、開発体験を向上させます。

### 主な機能

- **直感的なフォーマット**: \`YYYY-MM-DD\` のような分かりやすいパターンで日付を文字列に変換します。
- **タイムゾーンの自動解決**: スクリプトのタイムゾーンを自動的に使用し、明示的な指定を不要にします。
- **軽量**: 必要な機能に絞っているため、スクリプトの実行時間に与える影響は軽微です。

## 使い方

\`\`\`javascript
function myFunction() {
  // ライブラリをインポート (例: GasDateFormatter)
  
  const now = new Date();
  
  // 'YYYY/MM/DD HH:mm:ss' 形式でフォーマット
  const formattedDate = GasDateFormatter.format(now, 'YYYY/MM/DD HH:mm:ss');
  console.log(formattedDate); // 例: "2025/06/15 23:07:00"

  // 和暦や曜日も利用可能
  const warekiDate = GasDateFormatter.format(now, 'ggge年M月d日(E)');
  console.log(warekiDate); // 例: "令和7年6月15日(日)"
}
\`\`\`
	`;

  onMount(() => {
    libraryId = page.params.id;
    // 実際の実装では API からライブラリ情報を取得
    library = mockLibraries[libraryId as keyof typeof mockLibraries] || library;
  });

  function copyToClipboard(elementId: string) {
    const input = document.getElementById(elementId) as HTMLInputElement;
    if (input) {
      input.select();
      input.setSelectionRange(0, 99999);
      try {
        document.execCommand('copy');
        console.log('Copied!');

        // スクリプトIDがコピーされた場合はカウントを増加
        if (elementId === 'script-id') {
          scriptIdCopyCount++;
        }
      } catch (err) {
        console.error('Copy failed', err);
      }
    }
  }
</script>

<svelte:head>
  <title>{library.name} - AppsScriptHub</title>
  <meta name="description" content={library.description} />
</svelte:head>

<div class="container mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
  <div class="lg:grid lg:grid-cols-12 lg:gap-8">
    <!-- メインコンテンツ（左カラム） -->
    <div class="lg:col-span-9">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 sm:text-4xl">
          {library.name}
        </h1>
        <p class="mt-2 text-gray-500">{library.description}</p>
      </div>

      <!-- README セクション -->
      <MarkdownRenderer content={readmeContent} class="!p-0" />

      <!-- メソッドセクション -->
      <div class="mt-12">
        <h2 class="mb-6 border-b pb-2 text-2xl font-semibold">メソッド</h2>

        <!-- メソッド詳細カード -->
        <div id="format" class="mb-8 overflow-hidden rounded-lg border border-gray-200">
          <div class="border-b bg-gray-50 p-4">
            <h3 class="font-mono text-xl font-semibold">format(pattern)</h3>
          </div>
          <div class="p-6">
            <p class="mb-6 text-gray-700">
              Dateオブジェクトを指定されたパターン文字列に基づいてフォーマットします。
            </p>

            <!-- 引数 -->
            <h4 class="mb-2 font-semibold">引数</h4>
            <div class="overflow-x-auto">
              <table class="min-w-full rounded-md border">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="p-3 text-left font-medium">名前</th>
                    <th class="p-3 text-left font-medium">型</th>
                    <th class="p-3 text-left font-medium">説明</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-t">
                    <td class="p-3 font-mono">pattern</td>
                    <td class="p-3 font-mono text-purple-600">String</td>
                    <td class="p-3"
                      >フォーマットパターン。<code class="text-sm">YYYY/MM/DD HH:mm:ss</code> のように指定します。</td
                    >
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 戻り値 -->
            <h4 class="mt-6 mb-2 font-semibold">戻り値</h4>
            <div class="overflow-x-auto">
              <table class="min-w-full rounded-md border">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="p-3 text-left font-medium">型</th>
                    <th class="p-3 text-left font-medium">説明</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-t">
                    <td class="p-3 font-mono text-purple-600">String</td>
                    <td class="p-3">フォーマットされた日付文字列。</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- サイドバー（右カラム） -->
    <aside class="mt-8 lg:col-span-3 lg:mt-0">
      <div class="sticky top-24 space-y-6">
        <!-- インストールカード -->
        <div class="rounded-lg border p-4">
          <h3 class="mb-3 font-semibold text-gray-800">インストール</h3>
          <label for="script-id" class="text-sm font-medium text-gray-600">スクリプトID</label>
          <div class="mt-1 flex items-center">
            <input
              id="script-id"
              type="text"
              readonly
              value={library.scriptId}
              class="w-full rounded-l-md border bg-gray-50 p-2 text-xs"
            />
            <button
              on:click={() => copyToClipboard('script-id')}
              aria-label="スクリプトIDをコピー"
              class="rounded-r-md border-t border-r border-b bg-gray-200 p-2 hover:bg-gray-300"
            >
              <svg
                class="h-5 w-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                ></path>
              </svg>
            </button>
          </div>

          <label for="library-url" class="mt-4 block text-sm font-medium text-gray-600"
            >ライブラリURL</label
          >
          <div class="mt-1 flex items-center">
            <input
              id="library-url"
              type="text"
              readonly
              value={library.libraryUrl}
              class="w-full rounded-l-md border bg-gray-50 p-2 text-xs"
            />
            <button
              on:click={() => copyToClipboard('library-url')}
              aria-label="ライブラリURLをコピー"
              class="rounded-r-md border-t border-r border-b bg-gray-200 p-2 hover:bg-gray-300"
            >
              <svg
                class="h-5 w-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                ></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Aboutカード -->
        <div class="rounded-lg border p-4">
          <dl>
            <dt class="font-semibold text-gray-800">スクリプトIDコピー数</dt>
            <dd class="mb-3">
              {scriptIdCopyCount}回
            </dd>
            <dt class="font-semibold text-gray-800">作者</dt>
            <dd class="mb-3">
              <a href="/users/{library.author}" class="text-blue-600 hover:underline"
                >{library.author}</a
              >
              <div class="mt-1 text-sm text-gray-500">
                Copyright (c) 2025 {library.author}
              </div>
            </dd>

            <dt class="font-semibold text-gray-800">公開日</dt>
            <dd class="mb-3">{library.publishedDate}</dd>

            <dt class="font-semibold text-gray-800">リポジトリ</dt>
            <dd class="mb-3">
              <a href={library.repository} class="text-blue-600 hover:underline">GitHub</a>
            </dd>

            <dt class="font-semibold text-gray-800">Homepage</dt>
            <dd class="mb-3">
              <a href={library.homepage} class="text-blue-600 hover:underline">example.com</a>
            </dd>

            <dt class="font-semibold text-gray-800">ライセンス</dt>
            <dd class="mb-3">
              <a
                href="https://opensource.org/licenses/MIT"
                class="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                MIT License
              </a>
            </dd>

            <dt class="font-semibold text-gray-800">バージョン</dt>
            <dd>{library.version}</dd>
          </dl>
        </div>
      </div>
    </aside>
  </div>
</div>
