import type { ScraperConfig } from '$lib/types/github-scraper.js';

/**
 * デフォルトのスクリプトID抽出パターン
 */
export const DEFAULT_SCRIPT_ID_PATTERNS: RegExp[] = [
  /スクリプトID[：:\s]*([A-Za-z0-9_-]{20,})/gi,
  /Script[\s]*ID[：:\s]*([A-Za-z0-9_-]{20,})/gi,
  /script[\s]*id[：:\s]*['"`]([A-Za-z0-9_-]{20,})['"`]/gi,
  /https:\/\/script\.google\.com\/macros\/d\/([A-Za-z0-9_-]{20,})/gi,
  /script\.google\.com\/.*?\/([A-Za-z0-9_-]{20,})/gi,
  /\b1[A-Za-z0-9_-]{20,}\b/g,
];

/**
 * GASライブラリスクレイパーのデフォルト設定
 */
export const DEFAULT_SCRAPER_CONFIG: ScraperConfig = {
  rateLimit: {
    maxRequestsPerHour: 60, // 認証なしの場合
    delayBetweenRequests: 1200, // ms
  },
  scriptIdPatterns: DEFAULT_SCRIPT_ID_PATTERNS,
  gasTags: ['google-apps-script', 'apps-script', 'google-workspace', 'google-sheets', 'clasp'],
  verbose: true,
};
