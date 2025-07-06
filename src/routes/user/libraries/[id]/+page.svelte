<script lang="ts">
  import LibraryDetail from '$lib/components/LibraryDetail.svelte';
  import { createAppUrl, getLogoUrl } from '$lib/constants/app.js';
  import { company_name, copy_count_update_failed } from '$lib/paraglide/messages.js';
  import { getLocale } from '$lib/paraglide/runtime.js';
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

  // SEO用のtitleとdescriptionを動的に取得
  const getSeoTitle = () => {
    if (!librarySummary) return `${library.name} - AppsScriptHub`;

    if (currentLocale === 'ja' && librarySummary.seoTitleJa) {
      return librarySummary.seoTitleJa;
    } else if (currentLocale === 'en' && librarySummary.seoTitleEn) {
      return librarySummary.seoTitleEn;
    }

    // フォールバック
    return `${library.name} - Apps Script Hub`;
  };

  const getSeoDescription = () => {
    if (!librarySummary) return library.description;

    if (currentLocale === 'ja' && librarySummary.seoDescriptionJa) {
      return librarySummary.seoDescriptionJa;
    } else if (currentLocale === 'en' && librarySummary.seoDescriptionEn) {
      return librarySummary.seoDescriptionEn;
    }

    // フォールバック
    return library.description;
  };

  // 重複のないキーワードを生成
  const generateKeywords = () => {
    const baseKeywords = ['JavaScript', 'Google Apps Script'];
    let additionalKeywords: string[] = [];

    if (librarySummary) {
      if (currentLocale === 'ja' && librarySummary.tagsJa) {
        additionalKeywords = librarySummary.tagsJa;
      } else if (currentLocale === 'en' && librarySummary.tagsEn) {
        additionalKeywords = librarySummary.tagsEn;
      }
    }

    // 重複を除去してキーワードを結合
    const allKeywords = [...baseKeywords, ...additionalKeywords];
    const uniqueKeywords = [...new Set(allKeywords)];
    return uniqueKeywords.join(', ');
  };

  // JSON-LD構造化データを動的に生成
  const generateJsonLd = () => {
    const pageUrl = createAppUrl(`/user/libraries/${library.id}`);

    // Software Source Code Schema
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareSourceCode',
      name: getSeoTitle(),
      description: getSeoDescription(),
      url: pageUrl,
      programmingLanguage: 'JavaScript',
      runtimePlatform: 'Google Apps Script',
      codeRepository: library.repositoryUrl,
      author: {
        '@type': 'Person',
        name: library.authorName,
        url: library.authorUrl,
      },
      license: library.licenseUrl,
      dateModified: library.lastCommitAt.toISOString(),
      ...(library.starCount && {
        interactionStatistic: {
          '@type': 'InteractionCounter',
          interactionType: 'https://schema.org/LikeAction',
          userInteractionCount: library.starCount,
        },
      }),
      keywords: generateKeywords(),
      publisher: {
        '@type': 'Organization',
        name: company_name(),
        url: 'https://wywy.jp/',
      },
    };

    return jsonLd;
  };

  // コンポーネントマウント時にJSON-LDを動的に追加
  onMount(() => {
    // 既存のJSON-LDスクリプトがあれば削除
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // 新しいJSON-LDスクリプトを作成
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(generateJsonLd());
    document.head.appendChild(script);

    // クリーンアップ関数を返す
    return () => {
      const scriptToRemove = document.querySelector('script[type="application/ld+json"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
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
  <meta name="keywords" content={generateKeywords()} />
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
