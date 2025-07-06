/**
 * アプリケーション全体で使用する定数
 */

// ドメイン関連
export const APP_CONFIG = {
  SITE_NAME: 'Apps Script Hub',
  DOMAIN: 'appscripthub.com',
  BASE_URL: 'https://appscripthub.com',
  LOGO_PATH: '/logo.png',
} as const;

// ライブラリスクレイピング設定
export const LIBRARY_SCRAPING = {
  // 最後のコミットがこの年数より古いライブラリはスキップする（年）
  SKIP_THRESHOLD_YEARS: 2,
} as const;

// ページング設定
export const PAGINATION = {
  // 管理画面での一括検索時のページ範囲制限
  MIN_PAGE: 1,
  MAX_PAGE: 100,
  // 1ページあたりの件数選択肢
  PER_PAGE_OPTIONS: [10, 25, 50, 100],
  // 最大検索総件数
  MAX_TOTAL_RESULTS: 1000,
} as const;

// URL生成ヘルパー
export const createAppUrl = (path: string = '') => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${APP_CONFIG.BASE_URL}${cleanPath}`;
};

// ロゴURL生成ヘルパー
export const getLogoUrl = () => {
  return createAppUrl(APP_CONFIG.LOGO_PATH);
};

// パス定数
export const APP_PATHS = {
  HOME: '/user',
  SEARCH: '/user/search',
  ADMIN: '/admin',
  LOGIN: '/auth/login',
} as const;

// URL生成ヘルパー（フルURL）
export const createFullUrl = (path: keyof typeof APP_PATHS | string) => {
  const actualPath = typeof path === 'string' ? path : APP_PATHS[path];
  return createAppUrl(actualPath);
};
