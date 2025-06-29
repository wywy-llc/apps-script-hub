<script lang="ts">
  import MarkdownRenderer from '$lib/components/MarkdownRenderer.svelte';
  import StatusUpdateButtons from '$lib/components/admin/StatusUpdateButtons.svelte';
  import {
    LIBRARY_STATUS_BADGE_CLASS,
    LIBRARY_STATUS_TEXT,
    type LibraryStatus,
  } from '$lib/constants/library-status.js';
  import { truncateUrl } from '$lib/helpers/url.js';

  interface Library {
    id: string;
    name: string;
    scriptId: string;
    repositoryUrl: string;
    authorUrl: string;
    authorName: string;
    description: string;
    readmeContent?: string;
    licenseType?: string;
    licenseUrl?: string;
    starCount?: number;
    copyCount?: number;
    lastCommitAt: Date;
    status: LibraryStatus;
    createdAt: Date;
    updatedAt: Date;
  }

  interface Form {
    success?: boolean;
    error?: string;
    message?: string;
    newStatus?: string;
  }

  interface Props {
    library: Library;
    isAdminMode?: boolean;
    form?: Form;
    onScraping?: () => void;
    onEdit?: () => void;
    onStatusUpdate?: (status: LibraryStatus) => void;
    isScrapingInProgress?: boolean;
    scrapingMessage?: string;
    isStatusUpdateInProgress?: boolean;
    statusMessage?: string;
    displayCopyCount?: number;
    onCopyScriptId?: () => Promise<void>;
  }

  let {
    library,
    isAdminMode = false,
    form,
    onScraping,
    onEdit,
    onStatusUpdate,
    isScrapingInProgress = false,
    scrapingMessage = '',
    isStatusUpdateInProgress = false,
    statusMessage = '',
    displayCopyCount = library.copyCount || 0,
    onCopyScriptId,
  }: Props = $props();

  // ライブラリメソッドを生成
  const libraryUrl = `https://script.google.com/macros/library/d/${library.scriptId}/0`;
  const gasProjectUrl = `https://script.google.com/u/1/home/projects/${library.scriptId}/edit`;

  // クリップボードにコピー
  async function copyToClipboard(elementId: string) {
    const input = document.getElementById(elementId) as HTMLInputElement;
    if (input && input.value) {
      try {
        await navigator.clipboard.writeText(input.value);
        console.log('Copied!');

        // スクリプトIDがコピーされた場合はコールバックを実行
        if (elementId === 'script-id' && onCopyScriptId) {
          await onCopyScriptId();
        }
      } catch (err) {
        console.error('Copy failed', err);
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

  function getStatusBadge(status: string) {
    return (
      LIBRARY_STATUS_BADGE_CLASS[status as LibraryStatus] ||
      'px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800'
    );
  }

  function getStatusText(status: string) {
    return LIBRARY_STATUS_TEXT[status as LibraryStatus] || '不明';
  }
</script>

<div class="container mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
  {#if isAdminMode}
    <!-- 管理者モード: ヘッダーにアクションボタン -->
    <div class="mx-auto max-w-3xl">
      <div class="mb-8 flex items-center justify-between">
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
            onclick={onScraping}
            disabled={isScrapingInProgress}
            class="inline-flex cursor-pointer justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isScrapingInProgress ? 'スクレイピング中...' : 'スクレイピング実行'}
          </button>
          <button
            type="button"
            onclick={onEdit}
            class="inline-flex cursor-pointer justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            編集
          </button>
          <!-- ステータス更新ボタン -->
          {#if onStatusUpdate}
            <StatusUpdateButtons {library} {isStatusUpdateInProgress} {onStatusUpdate} />
          {/if}
        </div>
      </div>

      <!-- スクレイピングメッセージ -->
      {#if scrapingMessage}
        <div class="mb-6 rounded-md bg-blue-50 p-4 text-blue-800">
          {scrapingMessage}
        </div>
      {/if}

      <!-- ステータス更新メッセージ -->
      {#if statusMessage}
        <div
          class="mb-6 rounded-md p-4 {form?.success
            ? 'bg-green-50 text-green-800'
            : 'bg-red-50 text-red-800'}"
        >
          {statusMessage}
        </div>
      {/if}
    </div>
  {/if}

  <div class="lg:grid lg:grid-cols-12 lg:gap-8 {isAdminMode ? 'mx-auto max-w-none' : ''}">
    <!-- メインコンテンツ（左カラム） -->
    <div class="lg:col-span-9">
      {#if !isAdminMode}
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-gray-900 sm:text-4xl">
            {library.name}
          </h1>
          <p class="mt-2 text-gray-500">{library.description}</p>
        </div>
      {/if}

      <!-- README セクション -->
      {#if library.readmeContent}
        <div class="mt-8">
          <h2
            class="mb-6 {isAdminMode
              ? 'text-2xl font-bold'
              : 'border-b pb-2 text-2xl font-semibold'}"
          >
            {isAdminMode ? '詳細' : 'README'}
          </h2>
          {#if isAdminMode}
            <div class="overflow-hidden rounded-lg bg-white shadow-md">
              <div class="px-6">
                <MarkdownRenderer
                  content={library.readmeContent}
                  repositoryUrl={library.repositoryUrl}
                />
              </div>
            </div>
          {:else}
            <MarkdownRenderer
              content={library.readmeContent}
              repositoryUrl={library.repositoryUrl}
              class="!p-0"
            />
          {/if}
        </div>
      {:else}
        <div
          class="mt-8 {isAdminMode
            ? 'overflow-hidden rounded-lg bg-white shadow-md'
            : 'rounded-lg bg-gray-50 p-8 text-center'}"
        >
          <div class={isAdminMode ? 'px-6 py-8 text-center text-gray-500' : 'text-gray-500'}>
            <p>README が{isAdminMode ? '見つかりませんでした' : '利用できません'}。</p>
            {#if isAdminMode}
              <p class="mt-2 text-sm">スクレイピングを実行してREADMEを取得してください。</p>
            {/if}
          </div>
        </div>
      {/if}

      {#if isAdminMode}
        <!-- 管理者モード: 概要セクション -->
        <div class="mt-12">
          <h2 class="mb-6 text-2xl font-bold text-gray-900">概要</h2>
          <div class="overflow-hidden rounded-lg bg-white shadow-md">
            <div class="px-6 py-8">
              <dl class="space-y-8">
                <div>
                  <dt class="text-sm font-medium text-gray-500">ライブラリ名</dt>
                  <dd class="mt-1 text-lg font-semibold text-gray-900">
                    {library.name}
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">GAS スクリプトID</dt>
                  <dd class="mt-1 font-mono text-base break-all text-gray-900">
                    {library.scriptId}
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">GitHub リポジトリURL</dt>
                  <dd class="mt-1 text-base text-blue-600 hover:underline">
                    <a href={library.repositoryUrl} target="_blank" rel="noopener noreferrer">
                      {library.repositoryUrl}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">GASメソッド</dt>
                  <dd class="mt-1 text-base text-blue-600 hover:underline">
                    <a
                      href={libraryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={libraryUrl}
                    >
                      https://script.google.com/macros/library/d/{library.scriptId.slice(-8)}...
                    </a>
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">GASプロジェクト</dt>
                  <dd class="mt-1 text-base text-blue-600 hover:underline">
                    <a
                      href={gasProjectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={gasProjectUrl}
                    >
                      https://script.google.com/projects/{library.scriptId.slice(-8)}...
                    </a>
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">GitHub 作者</dt>
                  <dd class="mt-1 text-base">
                    {#if library.authorName}
                      <a
                        href={library.authorUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-blue-600 hover:underline"
                      >
                        {library.authorName}
                      </a>
                    {:else}
                      <a
                        href={library.authorUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-blue-600 hover:underline"
                      >
                        {library.authorUrl}
                      </a>
                    {/if}
                  </dd>
                </div>
                {#if library.description}
                  <div>
                    <dt class="text-sm font-medium text-gray-500">説明</dt>
                    <dd class="mt-1 text-base text-gray-900">
                      {library.description}
                    </dd>
                  </div>
                {/if}
                <div>
                  <dt class="text-sm font-medium text-gray-500">ライセンス</dt>
                  <dd class="mt-1 text-base">
                    {#if library.licenseUrl && library.licenseUrl !== 'unknown'}
                      <a
                        href={library.licenseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-blue-600 hover:underline"
                      >
                        {library.licenseType || 'ライセンス情報'}
                      </a>
                    {:else}
                      <span class="text-gray-900">
                        {library.licenseType || '不明'}
                      </span>
                    {/if}
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

          <!-- ライセンス情報 -->
          <div class="mt-4 border-t border-gray-200 pt-4">
            <dt class="mb-1 text-sm font-medium text-gray-600">ライセンス</dt>
            <dd class="text-sm">
              {#if library.licenseUrl && library.licenseUrl !== 'unknown'}
                <a
                  href={library.licenseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-blue-600 hover:text-blue-900 hover:underline"
                >
                  {library.licenseType || 'ライセンス情報'}
                </a>
              {:else}
                <span class="text-gray-700">
                  {library.licenseType || '不明'}
                </span>
              {/if}
            </dd>
          </div>
        </div>

        <!-- Aboutカード -->
        <div class="rounded-lg border p-4">
          <dl>
            {#if !isAdminMode}
              <dt class="font-semibold text-gray-800">スクリプトIDコピー数</dt>
              <dd class="mb-3">
                {displayCopyCount}回
              </dd>
            {/if}

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

            <!-- GASプロジェクトを追加 -->
            <dt class="font-semibold text-gray-800">GASプロジェクト</dt>
            <dd class="mb-3">
              <a
                href={gasProjectUrl}
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-600 hover:underline"
                title={gasProjectUrl}
              >
                {truncateUrl(gasProjectUrl)}
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
                {library.starCount?.toLocaleString() || 0}
              </span>
            </dd>

            <dt class="font-semibold text-gray-800">ステータス</dt>
            <dd class="mb-3">
              {#if isAdminMode}
                <span class={getStatusBadge(library.status)}>
                  {getStatusText(library.status)}
                </span>
              {:else}
                <span
                  class="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800"
                >
                  公開中
                </span>
              {/if}
            </dd>

            <dt class="font-semibold text-gray-800">最終更新日時</dt>
            <dd>{formatDate(library.lastCommitAt)}</dd>
          </dl>
        </div>
      </div>
    </aside>
  </div>
</div>
