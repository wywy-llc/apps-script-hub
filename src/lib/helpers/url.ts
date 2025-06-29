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
 * @param maxLength 最大文字数（デフォルト: 30）
 * @returns 短縮されたURL
 */
export function truncateUrl(url: string, maxLength: number = 30): string {
  if (url.length <= maxLength) {
    return url;
  }
  return url.slice(0, maxLength - 3) + '...';
}
