import type { ScraperConfig } from '$lib/types/github-scraper.js';

/**
 * Google Apps Script スクリプトID抽出パターン
 *
 * Google Apps ScriptのスクリプトIDは以下の特徴があります：
 * - 長さ: 通常20文字以上（可変長）
 * - 文字種: 英数字、ハイフン、アンダースコア
 * - 先頭: 必ず「1」で始まる
 *
 * パターンの優先順位（上から順に適用）:
 * 1. Google Script URL形式（最も信頼性が高い）
 * 2. 明示的な「スクリプトID」「Script ID」ラベル付き
 * 3. script.google.comドメインの一般URL
 * 4. コード内の文字列リテラル
 * 5. 1で始まる長い文字列（最も広範囲だが誤検出リスクあり）
 */
export const DEFAULT_SCRIPT_ID_PATTERNS: RegExp[] = [
  // 1. Google Script URL形式（最高精度）
  /https:\/\/script\.google\.com\/macros\/d\/([A-Za-z0-9_-]{20,})\/edit/gi,
  /https:\/\/script\.google\.com\/macros\/d\/([A-Za-z0-9_-]{20,})/gi,

  // 2. 明示的ラベル付き（高精度）
  /(?:スクリプト|script)\s*(?:id|ID)[：:\s=]*['"`]?([A-Za-z0-9_-]{20,})['"`]?/gi,
  /(?:gas|GAS)\s*(?:id|ID)[：:\s=]*['"`]?([A-Za-z0-9_-]{20,})['"`]?/gi,

  // 3. script.google.comドメインの一般URL（中精度）
  /script\.google\.com\/.*?\/([A-Za-z0-9_-]{20,})/gi,

  // 4. コード内文字列リテラル（中精度）
  /['"`]1([A-Za-z0-9_-]{19,})['"`]/g,

  // 5. 1で始まる長い文字列（低精度だが包括的）
  /\b1[A-Za-z0-9_-]{19,}\b/g,
];

/**
 * Google Apps Scriptでよく使われるタグリスト
 * 実際のGitHubリポジトリ調査に基づく優先度順
 *
 * 調査日: 2025-07-12
 * 調査元: https://github.com/topics/google-apps-script
 */
export const DEFAULT_GAS_TAGS = [
  'google-apps-script',

  'google-sheets',
  'gmail',
  'google-workspace',
  'google-drive',
  'google-docs',
  'apps-script',
  'javascript',
  'typescript',
  'library',
  'gas',
] as const;

/**
 * GASライブラリスクレイパーのデフォルト設定
 */
export const DEFAULT_SCRAPER_CONFIG: ScraperConfig = {
  rateLimit: {
    maxRequestsPerHour: 60, // 認証なしの場合
    delayBetweenRequests: 1200, // ms
  },
  scriptIdPatterns: DEFAULT_SCRIPT_ID_PATTERNS,
  gasTags: DEFAULT_GAS_TAGS.slice(0, 5), // 上位5つのタグを使用
  verbose: true,
};
