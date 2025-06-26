/**
 * サポートされているロケールの型定義
 */
export type Locale = 'en' | 'ja';

/**
 * 言語名の表示用マッピング
 */
export const LANGUAGE_NAMES: Record<Locale, string> = {
  en: 'English',
  ja: '日本語',
} as const;

/**
 * サポートされているロケールのリスト
 */
export const SUPPORTED_LOCALES: readonly Locale[] = ['en', 'ja'] as const;

/**
 * デフォルトのロケール
 */
export const DEFAULT_LOCALE: Locale = 'en';
