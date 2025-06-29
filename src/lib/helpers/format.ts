import { LIBRARY_STATUS_TEXT, type LibraryStatus } from '$lib/constants/library-status';

/**
 * 日付をフォーマットするヘルパー関数
 * 日本時間（JST）で表示します
 *
 * 使用例:
 * ```typescript
 * import { formatDate } from '$lib/helpers/format';
 *
 * const date = new Date('2024-01-15T10:30:00Z');
 * const formatted = formatDate(date); // "2024/01/15" (JST)
 * ```
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Tokyo',
  }).format(date);
}

/**
 * ライブラリステータスを日本語テキストに変換するヘルパー関数
 *
 * 使用例:
 * ```typescript
 * import { getStatusText } from '$lib/helpers/format';
 *
 * const statusText = getStatusText('published'); // "公開"
 * const unknownText = getStatusText('unknown'); // "不明"
 * ```
 */
export function getStatusText(status: string): string {
  return LIBRARY_STATUS_TEXT[status as LibraryStatus] || '不明';
}
