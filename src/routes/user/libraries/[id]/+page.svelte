<script lang="ts">
  import MarkdownRenderer from '$lib/components/MarkdownRenderer.svelte';
  import { truncateUrl } from '$lib/helpers/url.js';
  import type { PageData } from './$types.js';

  // ライブラリ詳細ページコンポーネント
  // 特定のGASライブラリの詳細情報、README、メソッド一覧を表示

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  const { library } = data;

  // データベースのコピー回数を表示用の状態として管理
  let displayCopyCount = $state(library.copyCount);

  // localStorageのキー（重複カウント防止用）
  const COPIED_SCRIPTS_KEY = 'copied-script-ids';

  // ライブラリメソッドを生成
  const libraryUrl = `https://script.google.com/macros/library/d/${library.scriptId}/0`;

  // サーバーサイドでコピー回数を増加
  async function incrementCopyCount() {
    try {
      const response = await fetch(`/user/libraries/${library.id}/copy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        displayCopyCount = data.copyCount;
        markAsCopied();
      }
    } catch (err) {
      console.error('コピー回数の更新に失敗しました:', err);
    }
  }

  // このスクリプトIDが既にコピーされているかチェック
  function hasBeenCopiedBefore(): boolean {
    if (typeof window === 'undefined') return false;

    const copiedScripts = localStorage.getItem(COPIED_SCRIPTS_KEY);
    if (!copiedScripts) return false;

    try {
      const copiedScriptIds: string[] = JSON.parse(copiedScripts);
      return copiedScriptIds.includes(library.scriptId);
    } catch {
      return false;
    }
  }

  // コピー済みスクリプトIDとしてマーク
  function markAsCopied() {
    if (typeof window === 'undefined') return;

    const copiedScripts = localStorage.getItem(COPIED_SCRIPTS_KEY);
    let copiedScriptIds: string[] = [];

    if (copiedScripts) {
      try {
        copiedScriptIds = JSON.parse(copiedScripts);
      } catch {
        copiedScriptIds = [];
      }
    }

    if (!copiedScriptIds.includes(library.scriptId)) {
      copiedScriptIds.push(library.scriptId);
      localStorage.setItem(COPIED_SCRIPTS_KEY, JSON.stringify(copiedScriptIds));
    }
  }

  async function copyToClipboard(elementId: string) {
    const input = document.getElementById(elementId) as HTMLInputElement;
    if (input && input.value) {
      try {
        // モダンなClipboard APIを使用
        await navigator.clipboard.writeText(input.value);
        console.log('Copied!');

        // スクリプトIDがコピーされた場合はカウントを管理
        if (elementId === 'script-id') {
          const alreadyCopied = hasBeenCopiedBefore();

          if (!alreadyCopied) {
            // 初回コピー時のみサーバーサイドでカウントを増加
            await incrementCopyCount();
          }
        }
      } catch (err) {
        console.error('Copy failed', err);
        // クリップボードAPIが利用できない場合は、ユーザーに手動コピーを促す
        alert('コピーに失敗しました。テキストを選択して手動でコピーしてください。');
        input.select();
        input.setSelectionRange(0, 99999);
      }
    }
  }

  // 作成日時の表示用フォーマット
  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
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
      {#if library.readmeContent}
        <div class="mt-8">
          <h2 class="mb-6 border-b pb-2 text-2xl font-semibold">README</h2>
          <MarkdownRenderer content={library.readmeContent} class="!p-0" />
        </div>
      {:else}
        <div class="mt-8 rounded-lg bg-gray-50 p-8 text-center">
          <p class="text-gray-500">README が利用できません。</p>
        </div>
      {/if}
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
              onclick={() => copyToClipboard('script-id')}
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
        </div>

        <!-- Aboutカード -->
        <div class="rounded-lg border p-4">
          <dl>
            <dt class="font-semibold text-gray-800">スクリプトIDコピー数</dt>
            <dd class="mb-3">
              {displayCopyCount}回
            </dd>

            <dt class="font-semibold text-gray-800">作者</dt>
            <dd class="mb-3">
              <a
                href={library.authorUrl}
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-600 hover:underline"
              >
                {library.authorName}
              </a>
            </dd>

            <dt class="font-semibold text-gray-800">公開日</dt>
            <dd class="mb-3">{formatDate(library.createdAt)}</dd>

            <dt class="font-semibold text-gray-800">スクリプト参考</dt>
            <dd class="mb-3">
              <a
                href={libraryUrl}
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-600 hover:underline"
                title={libraryUrl}
              >
                {truncateUrl(libraryUrl)}
              </a>
            </dd>

            <dt class="font-semibold text-gray-800">GitHub リポジトリ</dt>
            <dd class="mb-3">
              <a
                href={library.repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-600 hover:underline"
                title={library.repositoryUrl}
              >
                {truncateUrl(library.repositoryUrl)}
              </a>
            </dd>

            <dt class="font-semibold text-gray-800">GitHub Stars</dt>
            <dd class="mb-3">
              <span class="inline-flex items-center">
                <svg class="mr-1 h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  ></path>
                </svg>
                {library.starCount.toLocaleString()}
              </span>
            </dd>

            <dt class="font-semibold text-gray-800">ステータス</dt>
            <dd class="mb-3">
              <span
                class="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800"
              >
                公開中
              </span>
            </dd>

            <dt class="font-semibold text-gray-800">最終更新</dt>
            <dd>{formatDate(library.updatedAt)}</dd>
          </dl>
        </div>
      </div>
    </aside>
  </div>
</div>
