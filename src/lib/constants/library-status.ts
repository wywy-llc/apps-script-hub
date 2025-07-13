/**
 * ライブラリのステータス定数
 */
export const LIBRARY_STATUS = {
  PENDING: 'pending',
  PUBLISHED: 'published',
  REJECTED: 'rejected',
} as const;

/**
 * ライブラリステータスの型
 */
export type LibraryStatus = (typeof LIBRARY_STATUS)[keyof typeof LIBRARY_STATUS];

/**
 * ステータスに対応する表示テキスト
 */
export const LIBRARY_STATUS_TEXT = {
  [LIBRARY_STATUS.PENDING]: '未公開',
  [LIBRARY_STATUS.PUBLISHED]: '公開',
  [LIBRARY_STATUS.REJECTED]: '却下',
} as const;

/**
 * ステータスに対応するバッジのCSSクラス
 */
export const LIBRARY_STATUS_BADGE_CLASS = {
  [LIBRARY_STATUS.PENDING]:
    'px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800',
  [LIBRARY_STATUS.PUBLISHED]:
    'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800',
  [LIBRARY_STATUS.REJECTED]: 'px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800',
} as const;

/**
 * ステータス更新時の確認メッセージ
 */
export const LIBRARY_STATUS_CONFIRM_MESSAGES = {
  [LIBRARY_STATUS.PUBLISHED]: 'このライブラリを公開しますか？',
  [LIBRARY_STATUS.PENDING]: 'このライブラリを未公開にしますか？',
  [LIBRARY_STATUS.REJECTED]: 'このライブラリを却下しますか？',
} as const;
