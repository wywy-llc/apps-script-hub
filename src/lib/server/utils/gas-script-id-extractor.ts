import type { ScraperConfig } from '$lib/types/github-scraper.js';

/**
 * GASスクリプトID抽出ユーティリティクラス
 * READMEからGoogleAppsScriptのスクリプトIDを抽出する機能を提供
 */
export class GASScriptIdExtractor {
  /**
   * デフォルトのスクリプトID抽出パターン
   */
  public static readonly DEFAULT_SCRIPT_ID_PATTERNS = [
    /スクリプトID[：:\s]*([A-Za-z0-9_-]{20,})/gi,
    /Script[\s]*ID[：:\s]*([A-Za-z0-9_-]{20,})/gi,
    /script[\s]*id[：:\s]*['"`]([A-Za-z0-9_-]{20,})['"`]/gi,
    /https:\/\/script\.google\.com\/macros\/d\/([A-Za-z0-9_-]{20,})/gi,
    /script\.google\.com\/.*?\/([A-Za-z0-9_-]{20,})/gi,
    /\b1[A-Za-z0-9_-]{20,}\b/g,
  ];

  /**
   * READMEからGASスクリプトIDを抽出
   *
   * @param readme - README内容
   * @param patterns - 抽出パターン（省略時はデフォルトパターンを使用）
   * @returns 抽出されたスクリプトID、見つからない場合はundefined
   */
  public static extractScriptId(
    readme: string,
    patterns: RegExp[] = this.DEFAULT_SCRIPT_ID_PATTERNS
  ): string | undefined {
    for (const pattern of patterns) {
      const matches = readme.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].length >= 20) {
          return match[1];
        }
      }
    }

    return undefined;
  }

  /**
   * ScraperConfigから抽出パターンを使用してスクリプトIDを抽出
   *
   * @param readme - README内容
   * @param config - スクレイパー設定
   * @returns 抽出されたスクリプトID、見つからない場合はundefined
   */
  public static extractScriptIdFromConfig(
    readme: string,
    config: ScraperConfig
  ): string | undefined {
    return this.extractScriptId(readme, config.scriptIdPatterns);
  }
}
