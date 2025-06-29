/**
 * URLを短縮表示するヘルパー関数
 *
 * 使用例:
 * ```typescript
 * import { truncateUrl } from '$lib/helpers/url';
 *
 * const longUrl = 'https://github.com/googleworkspace/apps-script-oauth2';
 * const shortUrl = truncateUrl(longUrl); // "https://github.com/googleworkspace/apps-script..."
 * ```
 */

/**
 * URLを短縮表示する関数
 * @param url 短縮対象のURL
 * @param maxLength 最大文字数（デフォルト: 30、最小値: 4）
 * @returns 短縮されたURL
 * @throws エラー: maxLengthが4未満の場合
 */
export function truncateUrl(url: string, maxLength: number = 25): string {
  // 入力値の検証
  if (typeof url !== 'string') {
    throw new Error('URLは文字列である必要があります');
  }

  if (typeof maxLength !== 'number' || isNaN(maxLength) || maxLength < 4) {
    throw new Error('maxLengthは4以上の数値である必要があります');
  }

  // URLが最大長以下の場合はそのまま返す
  if (url.length <= maxLength) {
    return url;
  }

  // URLを短縮して省略記号を追加
  return url.slice(0, maxLength - 3) + '...';
}
