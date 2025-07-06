import { createAppUrl, APP_CONFIG } from '$lib/constants/app-config.js';
import { company_name } from '$lib/paraglide/messages.js';
import type { LibrarySummaryRecord } from '$lib/types/library-summary.js';
import type { LibraryEntity } from '$lib/types/index.js';

/**
 * SEO関連のユーティリティ関数
 * ライブラリ詳細ページのSEOメタデータを動的に生成
 */

/**
 * SEO用のタイトルを生成
 * @param library - ライブラリ情報
 * @param librarySummary - ライブラリ要約情報
 * @param currentLocale - 現在のロケール
 * @returns SEO用のタイトル
 */
export function generateSeoTitle(
  library: LibraryEntity,
  librarySummary: LibrarySummaryRecord | null,
  currentLocale: string
): string {
  if (!librarySummary) return `${library.name} - ${APP_CONFIG.SITE_NAME}`;

  if (currentLocale === 'ja' && librarySummary.seoTitleJa) {
    return librarySummary.seoTitleJa;
  } else if (currentLocale === 'en' && librarySummary.seoTitleEn) {
    return librarySummary.seoTitleEn;
  }

  // フォールバック
  return `${library.name} - ${APP_CONFIG.SITE_NAME}`;
}

/**
 * SEO用のディスクリプションを生成
 * @param library - ライブラリ情報
 * @param librarySummary - ライブラリ要約情報
 * @param currentLocale - 現在のロケール
 * @returns SEO用のディスクリプション
 */
export function generateSeoDescription(
  library: LibraryEntity,
  librarySummary: LibrarySummaryRecord | null,
  currentLocale: string
): string {
  if (!librarySummary) return library.description;

  if (currentLocale === 'ja' && librarySummary.seoDescriptionJa) {
    return librarySummary.seoDescriptionJa;
  } else if (currentLocale === 'en' && librarySummary.seoDescriptionEn) {
    return librarySummary.seoDescriptionEn;
  }

  // フォールバック
  return library.description;
}

/**
 * 重複のないキーワードを生成
 * @param librarySummary - ライブラリ要約情報
 * @param currentLocale - 現在のロケール
 * @returns カンマ区切りのキーワード文字列
 */
export function generateKeywords(
  librarySummary: LibrarySummaryRecord | null,
  currentLocale: string
): string {
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
}

/**
 * JSON-LD構造化データを生成
 * @param library - ライブラリ情報
 * @param librarySummary - ライブラリ要約情報
 * @param currentLocale - 現在のロケール
 * @returns JSON-LD構造化データ
 */
export function generateJsonLd(
  library: LibraryEntity,
  librarySummary: LibrarySummaryRecord | null,
  currentLocale: string
): object {
  const pageUrl = createAppUrl(`/user/libraries/${library.id}`);
  const seoTitle = generateSeoTitle(library, librarySummary, currentLocale);
  const seoDescription = generateSeoDescription(library, librarySummary, currentLocale);
  const keywords = generateKeywords(librarySummary, currentLocale);

  // Software Source Code Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: seoTitle,
    description: seoDescription,
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
    keywords: keywords,
    publisher: {
      '@type': 'Organization',
      name: company_name(),
      url: 'https://wywy.jp/',
    },
  };

  return jsonLd;
}

/**
 * JSON-LDスクリプトをDOMに追加
 * @param jsonLd - JSON-LDオブジェクト
 */
export function addJsonLdToHead(jsonLd: object): void {
  if (typeof window === 'undefined') return;

  // 既存のJSON-LDスクリプトがあれば削除
  const existingScript = document.querySelector('script[type="application/ld+json"]');
  if (existingScript) {
    existingScript.remove();
  }

  // 新しいJSON-LDスクリプトを作成
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(jsonLd);
  document.head.appendChild(script);
}

/**
 * JSON-LDスクリプトをDOMから削除
 */
export function removeJsonLdFromHead(): void {
  if (typeof window === 'undefined') return;

  const scriptToRemove = document.querySelector('script[type="application/ld+json"]');
  if (scriptToRemove) {
    scriptToRemove.remove();
  }
}
