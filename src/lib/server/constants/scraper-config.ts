import { GASScriptIdExtractor } from '$lib/server/utils/gas-script-id-extractor.js';
import type { ScraperConfig } from '$lib/types/github-scraper.js';

/**
 * GASライブラリスクレイパーのデフォルト設定
 */
export const DEFAULT_SCRAPER_CONFIG: ScraperConfig = {
  rateLimit: {
    maxRequestsPerHour: 60, // 認証なしの場合
    delayBetweenRequests: 1200, // ms
  },
  scriptIdPatterns: GASScriptIdExtractor.DEFAULT_SCRIPT_ID_PATTERNS,
  gasTags: ['google-apps-script', 'apps-script'],
  verbose: true,
};
