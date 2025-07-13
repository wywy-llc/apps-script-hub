import {
  DEFAULT_SCRIPT_ID_PATTERNS,
  SCRIPT_ID_EXCLUSION_PATTERNS,
} from '$lib/constants/scraper-config.js';
import type { ScraperConfig } from '$lib/types/github-scraper.js';

/**
 * GASスクリプトID抽出ユーティリティクラス
 * READMEからGoogleAppsScriptのスクリプトIDを抽出する機能を提供
 */
export class GASScriptIdExtractor {
  /**
   * デフォルトのスクリプトID抽出パターン
   */
  public static readonly DEFAULT_SCRIPT_ID_PATTERNS = DEFAULT_SCRIPT_ID_PATTERNS;

  /**
   * 候補文字列が除外パターンに一致するかチェック
   *
   * @param candidate - チェック対象の文字列
   * @param content - 元のコンテンツ（コンテキストチェック用）
   * @returns 除外すべき場合true
   */
  private static shouldExcludeCandidate(candidate: string, content: string): boolean {
    for (const exclusionPattern of SCRIPT_ID_EXCLUSION_PATTERNS) {
      exclusionPattern.lastIndex = 0; // グローバル正規表現をリセット

      // 除外パターンの直接的なマッチをチェック
      const matches = content.matchAll(new RegExp(exclusionPattern.source, exclusionPattern.flags));
      for (const match of matches) {
        // マッチした文字列に候補が含まれている場合は除外
        if (match[0].includes(candidate)) {
          return true;
        }
      }
    }
    return false;
  }

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
      pattern.lastIndex = 0; // グローバル正規表現をリセット
      const matches = readme.matchAll(pattern);
      for (const match of matches) {
        const candidateId: string = match[1] || '';
        if (candidateId && candidateId.length >= 20) {
          // 除外パターンチェック
          if (!this.shouldExcludeCandidate(candidateId, readme)) {
            return candidateId;
          }
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
