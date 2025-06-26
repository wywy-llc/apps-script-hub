<script lang="ts">
  import { page } from '$app/state';
  import AdminHeader from '$lib/components/AdminHeader.svelte';
  import { onMount } from 'svelte';

  // 管理者画面 - ライブラリ詳細ページ
  // ライブラリの詳細情報表示、スクレイピング実行、編集・公開機能

  let libraryId = '';
  let library = {
    name: '',
    scriptId: '',
    repositoryUrl: '',
    authorUrl: '',
    status: 'pending' as 'pending' | 'published' | 'rejected',
    createdAt: '',
    updatedAt: '',
  };

  let isScrapingInProgress = false;
  let scrapingMessage = '';

  // モックデータ（実際の実装では API から取得）
  const mockLibraries = {
    '1': {
      name: 'GasLogger',
      scriptId: '1mbq56Ik4-I_4rnVlr9lTxJoXHStkjHYDyMHjmDWiRiJR3MDl-ThHwnbg',
      repositoryUrl: 'https://github.com/wywy-llc/apps-script-hub',
      authorUrl: 'https://github.com/wywy-llc',
      status: 'pending' as const,
      createdAt: '2025-06-21T10:00:00Z',
      updatedAt: '2025-06-21T12:30:00Z',
    },
    '2': {
      name: 'GasDateFormatter',
      scriptId: '1mbq56Ik4-I_4rnVlr9lTxJoXHStkjHYDyMHjmDWiRiJR3MDl-ThHwnbg',
      repositoryUrl: 'https://github.com/user-name/gas-date-formatter',
      authorUrl: 'https://github.com/user-name',
      status: 'published' as const,
      createdAt: '2025-05-28T10:00:00Z',
      updatedAt: '2025-05-28T14:00:00Z',
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

  function handleScraping() {
    if (isScrapingInProgress) return;

    isScrapingInProgress = true;
    scrapingMessage = 'GitHubリポジトリから情報を取得中...';

    // 実際の実装では GitHub API からスクレイピング
    setTimeout(() => {
      scrapingMessage = 'スクレイピングが完了しました。';
      isScrapingInProgress = false;

      // 3秒後にメッセージを消去
      setTimeout(() => {
        scrapingMessage = '';
      }, 3000);
    }, 2000);
  }

  function handlePublish() {
    if (confirm('このライブラリを公開しますか？')) {
      library.status = 'published';
      // 実際の実装では API にPATCHリクエストを送信
      console.log('ライブラリを公開:', libraryId);
    }
  }

  function handleEdit() {
    // 編集ページに遷移
    window.location.href = `/admin/libraries/${libraryId}/edit`;
  }

  function handleSignOut() {
    // サインアウト処理
    console.log('サインアウト');
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'published':
        return 'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800';
      case 'pending':
        return 'px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800';
      default:
        return 'px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800';
    }
  }

  function getStatusText(status: string) {
    switch (status) {
      case 'published':
        return '公開中';
      case 'pending':
        return '承認待ち';
      case 'rejected':
        return '却下';
      default:
        return '不明';
    }
  }

  // Markdownをシンプルにレンダリング
  function renderMarkdown(content: string): string {
    return content
      .replace(
        /```javascript\n([\s\S]*?)\n```/g,
        '<pre><code class="language-javascript">$1</code></pre>'
      )
      .replace(
        /`([^`]+)`/g,
        '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>'
      )
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(
        /^### (.*$)/gm,
        '<h3 class="text-lg font-semibold mt-6 mb-3">$1</h3>'
      )
      .replace(
        /^## (.*$)/gm,
        '<h2 class="text-xl font-semibold mt-8 mb-4">$1</h2>'
      )
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br>')
      .replace(/^(.*)/, '<p class="mb-4">$1')
      .replace(/(.*?)$/, '$1</p>');
  }
</script>

<svelte:head>
  <title>管理画面 - ライブラリ詳細 - AppsScriptHub</title>
  <meta
    name="description"
    content="AppsScriptHub管理者画面 - ライブラリの詳細情報と管理機能"
  />
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <AdminHeader onSignOut={handleSignOut} />

  <main class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
    <div class="max-w-3xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">ライブラリ詳細</h1>
          <div class="mt-2 flex items-center space-x-3">
            <p class="text-sm text-gray-500">{library.name}</p>
            <span class={getStatusBadge(library.status)}>
              {getStatusText(library.status)}
            </span>
          </div>
        </div>
        <div class="flex space-x-2">
          <button
            type="button"
            onclick={handleScraping}
            disabled={isScrapingInProgress}
            class="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isScrapingInProgress
              ? 'スクレイピング中...'
              : 'スクレイピング実行'}
          </button>
          <button
            type="button"
            onclick={handleEdit}
            class="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            編集
          </button>
          {#if library.status !== 'published'}
            <button
              type="button"
              onclick={handlePublish}
              class="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              公開する
            </button>
          {/if}
        </div>
      </div>

      <!-- スクレイピングメッセージ -->
      {#if scrapingMessage}
        <div class="mb-6 p-4 rounded-md bg-blue-50 text-blue-800">
          {scrapingMessage}
        </div>
      {/if}

      <!-- Library Details -->
      <h2 class="text-2xl font-bold text-gray-900 mb-6">概要</h2>
      <div class="bg-white shadow-md rounded-lg overflow-hidden">
        <div class="px-6 py-8">
          <dl class="space-y-8">
            <div>
              <dt class="text-sm font-medium text-gray-500">ライブラリ名</dt>
              <dd class="mt-1 text-lg font-semibold text-gray-900">
                {library.name}
              </dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">
                GAS スクリプトID
              </dt>
              <dd class="mt-1 text-base text-gray-900 font-mono break-all">
                {library.scriptId}
              </dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">
                GitHub リポジトリURL
              </dt>
              <dd class="mt-1 text-base text-blue-600 hover:underline">
                <a
                  href={library.repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {library.repositoryUrl}
                </a>
              </dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">GitHub 作者URL</dt>
              <dd class="mt-1 text-base text-blue-600 hover:underline">
                <a
                  href={library.authorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {library.authorUrl}
                </a>
              </dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">作成日時</dt>
              <dd class="mt-1 text-base text-gray-900">
                {new Date(library.createdAt).toLocaleString('ja-JP')}
              </dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">更新日時</dt>
              <dd class="mt-1 text-base text-gray-900">
                {new Date(library.updatedAt).toLocaleString('ja-JP')}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Scraping Results -->
      <div class="mt-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">詳細</h2>
        <div class="bg-white shadow-md rounded-lg overflow-hidden">
          <div class="px-6">
            <!-- README Section -->
            <article class="markdown-body prose max-w-none">
              {@html renderMarkdown(readmeContent)}
            </article>

            <!-- Methods Section -->
            <div class="mt-12">
              <h2 class="text-2xl font-semibold border-b pb-2 mb-6">
                メソッド
              </h2>

              <!-- Method Detail Card -->
              <div
                id="format"
                class="border border-gray-200 rounded-lg overflow-hidden mb-8"
              >
                <div class="bg-gray-50 p-4 border-b">
                  <h3 class="text-xl font-mono font-semibold">
                    format(pattern)
                  </h3>
                </div>
                <div class="p-6">
                  <p class="mb-6 text-gray-700">
                    Dateオブジェクトを指定されたパターン文字列に基づいてフォーマットします。
                  </p>

                  <!-- Parameters -->
                  <h4 class="font-semibold mb-2">引数</h4>
                  <div class="overflow-x-auto">
                    <table class="min-w-full border rounded-md">
                      <thead class="bg-gray-50">
                        <tr>
                          <th class="text-left p-3 font-medium">名前</th>
                          <th class="text-left p-3 font-medium">型</th>
                          <th class="text-left p-3 font-medium">説明</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr class="border-t">
                          <td class="p-3 font-mono">pattern</td>
                          <td class="p-3 font-mono text-purple-600">String</td>
                          <td class="p-3"
                            >フォーマットパターン。<code
                              class="text-sm bg-gray-100 px-1 py-0.5 rounded"
                              >YYYY/MM/DD HH:mm:ss</code
                            > のように指定します。</td
                          >
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <!-- Return Value -->
                  <h4 class="font-semibold mt-6 mb-2">戻り値</h4>
                  <div class="overflow-x-auto">
                    <table class="min-w-full border rounded-md">
                      <thead class="bg-gray-50">
                        <tr>
                          <th class="text-left p-3 font-medium">型</th>
                          <th class="text-left p-3 font-medium">説明</th>
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
        </div>
      </div>
    </div>
  </main>

  <!-- Footer -->
  <footer class="bg-gray-50 border-t border-gray-200 mt-12">
    <div class="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div class="text-center text-sm text-gray-500">
        &copy; 2025 wywy LLC. All rights reserved.
      </div>
    </div>
  </footer>
</div>
