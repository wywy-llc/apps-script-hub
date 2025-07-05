<script lang="ts">
  import { onMount } from 'svelte';
  import LibraryDetail from '$lib/components/LibraryDetail.svelte';
  import { copy_count_update_failed } from '$lib/paraglide/messages.js';
  import { getLocale } from '$lib/paraglide/runtime.js';
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
    return `${library.name} - AppsScriptHub`;
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

  // JSON-LD構造化データを動的に生成
  const generateJsonLd = () => {
    const baseUrl = 'https://app-script-hub.example.com';
    const pageUrl = `${baseUrl}/user/libraries/${library.id}`;

    // Software Application Schema
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: getSeoTitle(),
      description: getSeoDescription(),
      url: pageUrl,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Any',
      programmingLanguage: 'JavaScript',
      author: {
        '@type': 'Person',
        name: library.authorName,
        url: library.authorUrl,
      },
      codeRepository: library.repositoryUrl,
      license: library.licenseUrl,
      dateCreated: library.createdAt.toISOString(),
      dateModified: library.updatedAt.toISOString(),
      ...(library.starCount && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: Math.min(5, Math.max(1, Math.round((library.starCount / 100) * 5))),
          bestRating: 5,
          worstRating: 1,
          ratingCount: library.starCount,
        },
      }),
      downloadUrl: `https://script.google.com/d/${library.scriptId}/edit`,
      installUrl: `https://script.google.com/d/${library.scriptId}/edit`,
      ...(librarySummary?.tagsJa &&
        currentLocale === 'ja' && {
          keywords: librarySummary.tagsJa.join(', '),
        }),
      ...(librarySummary?.tagsEn &&
        currentLocale === 'en' && {
          keywords: librarySummary.tagsEn.join(', '),
        }),
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
      publisher: {
        '@type': 'Organization',
        name: 'AppsScriptHub',
        url: baseUrl,
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

  <!-- Open Graph tags -->
  <meta property="og:title" content={getSeoTitle()} />
  <meta property="og:description" content={getSeoDescription()} />
  <meta property="og:type" content="website" />
  <meta
    property="og:url"
    content="https://app-script-hub.example.com/user/libraries/{library.id}"
  />
  <meta property="og:site_name" content="AppsScriptHub" />

  <!-- Twitter Card tags -->
  <meta name="twitter:title" content={getSeoTitle()} />
  <meta name="twitter:description" content={getSeoDescription()} />
  <meta name="twitter:card" content="summary" />
</svelte:head>

<LibraryDetail
  {library}
  librarySummary={data.librarySummary}
  isAdminMode={false}
  {displayCopyCount}
  onCopyScriptId={handleCopyScriptId}
/>
