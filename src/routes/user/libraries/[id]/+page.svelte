<script lang="ts">
  import LibraryDetail from '$lib/components/LibraryDetail.svelte';
  import { createAppUrl, getLogoUrl } from '$lib/constants/app.js';
  import { copy_count_update_failed } from '$lib/paraglide/messages.js';
  import { getLocale } from '$lib/paraglide/runtime.js';
  import {
    addJsonLdToHead,
    generateJsonLd,
    generateKeywords,
    generateSeoDescription,
    generateSeoTitle,
    removeJsonLdFromHead,
  } from '$lib/utils/seo.js';
  import { onMount } from 'svelte';
  import type { PageData } from './$types.js';

  // ライブラリ詳細ページコンポーネント
  // 特定のGASライブラリの詳細情報、README、メソッド一覧を表示

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  const { library, librarySummary } = data;

  // 現在のロケールを取得
  const currentLocale = getLocale();

  // SEO関連のデータを取得
  const getSeoTitle = () => generateSeoTitle(library, librarySummary, currentLocale);
  const getSeoDescription = () => generateSeoDescription(library, librarySummary, currentLocale);
  const getSeoKeywords = () => generateKeywords(librarySummary, currentLocale);
  const getJsonLd = () => generateJsonLd(library, librarySummary, currentLocale);

  // コンポーネントマウント時にJSON-LDを動的に追加
  onMount(() => {
    // JSON-LDを追加
    addJsonLdToHead(getJsonLd());

    // クリーンアップ関数を返す
    return () => {
      removeJsonLdFromHead();
    };
  });

  // データベースのコピー回数を表示用の状態として管理
  let displayCopyCount = $state(library.copyCount);

  // localStorageのキー（重複カウント防止用）
  const COPIED_SCRIPTS_KEY = 'copied-script-ids';

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
      console.error(copy_count_update_failed(), err);
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

  // スクリプトIDコピー用のコールバック
  async function handleCopyScriptId() {
    const alreadyCopied = hasBeenCopiedBefore();

    if (!alreadyCopied) {
      // 初回コピー時のみサーバーサイドでカウントを増加
      await incrementCopyCount();
    }
  }
</script>

<svelte:head>
  <title>{getSeoTitle()}</title>
  <meta name="description" content={getSeoDescription()} />
  <meta name="keywords" content={getSeoKeywords()} />
  <meta name="author" content={library.authorName} />

  <!-- Open Graph tags -->
  <meta property="og:title" content={getSeoTitle()} />
  <meta property="og:description" content={getSeoDescription()} />
  <meta property="og:type" content="article" />
  <meta property="og:url" content={createAppUrl(`/user/libraries/${library.id}`)} />
  <meta property="og:site_name" content="Apps Script Hub" />
  <meta property="og:image" content={getLogoUrl()} />
  <meta property="article:author" content={library.authorName} />
  <meta property="article:section" content="Google Apps Script" />
  <meta property="article:tag" content="Google Apps Script" />
  <meta property="article:tag" content="GAS" />
  <meta property="article:tag" content="ライブラリ" />

  <!-- Twitter Card tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content={createAppUrl(`/user/libraries/${library.id}`)} />
  <meta name="twitter:title" content={getSeoTitle()} />
  <meta name="twitter:description" content={getSeoDescription()} />
  <meta name="twitter:image" content={getLogoUrl()} />
  <meta name="twitter:creator" content={`@${library.authorName}`} />

  <!-- Additional SEO Meta Tags -->
  <link rel="canonical" href={createAppUrl(`/user/libraries/${library.id}`)} />
</svelte:head>

<main>
  <article>
    <LibraryDetail
      {library}
      librarySummary={data.librarySummary}
      isAdminMode={false}
      {displayCopyCount}
      onCopyScriptId={handleCopyScriptId}
    />
  </article>
</main>
