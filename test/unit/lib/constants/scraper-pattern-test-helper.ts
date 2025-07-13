import {
  DEFAULT_SCRIPT_ID_PATTERNS,
  SCRIPT_ID_EXCLUSION_PATTERNS,
} from '../../../../src/lib/constants/scraper-config.js';

/**
 * パターンマッチ結果の型定義
 */
export interface PatternMatchResult {
  patternIndex: number;
  pattern: RegExp;
  matches: string[];
}

/**
 * 候補文字列が除外パターンに一致するかチェック
 *
 * @param candidate - チェック対象の文字列
 * @param content - 元のコンテンツ（コンテキストチェック用）
 * @returns 除外すべき場合true
 */
function shouldExcludeCandidate(candidate: string, content: string): boolean {
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
 * スクリプトIDパターンマッチング共通ヘルパー関数
 *
 * @param content - マッチング対象の文字列
 * @param applyExclusions - 除外パターンを適用するかどうか（デフォルト: true）
 * @returns マッチした結果の配列
 */
export function matchScriptIdPatterns(
  content: string,
  applyExclusions: boolean = true
): PatternMatchResult[] {
  const foundMatches: PatternMatchResult[] = [];

  DEFAULT_SCRIPT_ID_PATTERNS.forEach((pattern, index) => {
    // 正規表現のlastIndexプロパティをリセット
    pattern.lastIndex = 0;

    const matches: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(content)) !== null) {
      // グループ1がある場合はそれを、ない場合は全体マッチを取得
      const matchedString: string = match[1] || match[0];

      // 除外パターンチェック
      if (!applyExclusions || !shouldExcludeCandidate(matchedString, content)) {
        matches.push(matchedString);
      }

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
 * @param applyExclusions - 除外パターンを適用するかどうか（デフォルト: true）
 * @returns マッチした全ての文字列の配列
 */
export function extractAllMatches(content: string, applyExclusions: boolean = true): string[] {
  const matchResults = matchScriptIdPatterns(content, applyExclusions);
  return matchResults.flatMap(result => result.matches);
}

/**
 * 特定のIDが抽出されるかをチェック
 *
 * @param content - マッチング対象の文字列
 * @param expectedId - 期待されるID
 * @param applyExclusions - 除外パターンを適用するかどうか（デフォルト: true）
 * @returns 期待されるIDが抽出されるかどうか
 */
export function containsExpectedId(
  content: string,
  expectedId: string,
  applyExclusions: boolean = true
): boolean {
  const extractedIds = extractAllMatches(content, applyExclusions);
  return extractedIds.includes(expectedId);
}

/**
 * 誤検知がないことをチェック（何もマッチしないことを確認）
 *
 * @param content - マッチング対象の文字列
 * @param applyExclusions - 除外パターンを適用するかどうか（デフォルト: true）
 * @returns マッチする文字列が存在しないかどうか
 */
export function hasNoFalsePositives(content: string, applyExclusions: boolean = true): boolean {
  const extractedIds = extractAllMatches(content, applyExclusions);
  return extractedIds.length === 0;
}
