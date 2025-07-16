/**
 * OGP画像生成の定数定義
 */

export const OGP_IMAGE_CONFIG = {
  // 画像サイズ（Open Graph推奨サイズ）
  WIDTH: 1200,
  HEIGHT: 630,

  // フォントサイズ
  FONT_SIZE: {
    TITLE: 56,
    AUTHOR: 28,
    SITE_NAME: 20,
    LOGO_TEXT: 24,
  },

  // レイアウト設定
  PADDING: 60,
  LOGO_SIZE: 80,

  // カラーパレット
  COLORS: {
    // 基本パレット
    BACKGROUND_SECONDARY: '#1a1f36', // 深い藍色
    BACKGROUND_GRADIENT_END: '#2a2f4a', // グラデーション終点
    TITLE: '#f5f5f5', // 純白ではなく、やや温かみのある白
    AUTHOR: '#9ca3af', // 落ち着いたグレー
    ACCENT: '#6366f1', // 洗練された紫藍色（現代的な日本の色彩）
    LOGO_BACKGROUND: '#6366f1',
    LOGO_TEXT: '#ffffff',
  },

  // テキスト制限
  MAX_TITLE_LENGTH: 40,
  TRUNCATE_SUFFIX: '...',

  // キャッシュ設定
  CACHE_DURATION: 3600, // 1時間（秒）
} as const;

/**
 * OGP画像生成のメッセージ定数
 */
export const OGP_IMAGE_MESSAGES = {
  LIBRARY_NOT_FOUND: 'Library not found',
  GENERATION_FAILED: 'OGP画像の生成に失敗しました',
  GENERATION_ERROR_LOG: 'OGP画像生成エラー:',
  SITE_NAME: 'GAS Library Hub',
  AUTHOR_PREFIX: 'by ',
  LOGO_TEXT: 'GAS',
} as const;

/**
 * OGP画像のMIMEタイプとヘッダー設定
 */
export const OGP_IMAGE_HEADERS = {
  CONTENT_TYPE: 'image/png',
  CACHE_CONTROL: `public, max-age=${OGP_IMAGE_CONFIG.CACHE_DURATION}`,
} as const;
