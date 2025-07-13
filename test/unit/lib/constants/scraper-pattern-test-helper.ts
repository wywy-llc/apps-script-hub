import { DEFAULT_SCRIPT_ID_PATTERNS } from '../../../../src/lib/constants/scraper-config.js';

/**
 * パターンマッチ結果の型定義
 */
export interface PatternMatchResult {
  patternIndex: number;
  pattern: RegExp;
  matches: string[];
}

/**
 * スクリプトIDパターンマッチング共通ヘルパー関数
 * 
 * @param content - マッチング対象の文字列
 * @returns マッチした結果の配列
 */
export function matchScriptIdPatterns(content: string): PatternMatchResult[] {
  const foundMatches: PatternMatchResult[] = [];

  DEFAULT_SCRIPT_ID_PATTERNS.forEach((pattern, index) => {
    // 正規表現を実行前にリセット
    pattern.lastIndex = 0;

    const matches: string[] = [];
    let match;

    while ((match = pattern.exec(content)) !== null) {
      // グループ1がある場合はそれを、ない場合は全体マッチを取得
      const matchedString = match[1] || match[0];
      matches.push(matchedString);

      // 無限ループ防止
      if (!pattern.global) break;
    }

    if (matches.length > 0) {
      foundMatches.push({
        patternIndex: index,
        pattern,
        matches,
      });
    }
  });

  return foundMatches;
}

/**
 * マッチした全ての文字列を平坦化して取得
 * 
 * @param content - マッチング対象の文字列
 * @returns マッチした全ての文字列の配列
 */
export function extractAllMatches(content: string): string[] {
  const matchResults = matchScriptIdPatterns(content);
  return matchResults.flatMap(result => result.matches);
}

/**
 * 特定のIDが抽出されるかをチェック
 * 
 * @param content - マッチング対象の文字列
 * @param expectedId - 期待されるID
 * @returns 期待されるIDが抽出されるかどうか
 */
export function containsExpectedId(content: string, expectedId: string): boolean {
  const extractedIds = extractAllMatches(content);
  return extractedIds.includes(expectedId);
}

/**
 * 誤検知がないことをチェック（何もマッチしないことを確認）
 * 
 * @param content - マッチング対象の文字列
 * @returns マッチする文字列が存在しないかどうか
 */
export function hasNoFalsePositives(content: string): boolean {
  const extractedIds = extractAllMatches(content);
  return extractedIds.length === 0;
}