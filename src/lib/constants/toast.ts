/**
 * トースト通知の設定定数
 */
export const TOAST_CONFIG = {
  /** トースト表示時間（ミリ秒） */
  DURATION: 3000,
  /** トーストアニメーション時間（ミリ秒） */
  ANIMATION_DURATION: 300,
  /** トーストの最大表示数 */
  MAX_TOASTS: 5,
} as const;

/**
 * トーストの種類
 */
export const TOAST_TYPE = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

export type ToastType = (typeof TOAST_TYPE)[keyof typeof TOAST_TYPE];

/**
 * トーストの種類別スタイルクラス
 */
export const TOAST_STYLE_CLASS = {
  [TOAST_TYPE.SUCCESS]: 'bg-green-50 border-green-200 text-green-800',
  [TOAST_TYPE.ERROR]: 'bg-red-50 border-red-200 text-red-800',
  [TOAST_TYPE.WARNING]: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  [TOAST_TYPE.INFO]: 'bg-blue-50 border-blue-200 text-blue-800',
} as const;

/**
 * トーストアイコンのSVGパス
 */
export const TOAST_ICON_PATH = {
  [TOAST_TYPE.SUCCESS]: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  [TOAST_TYPE.ERROR]: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
  [TOAST_TYPE.WARNING]:
    'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z',
  [TOAST_TYPE.INFO]: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
} as const;

/**
 * トーストアイコンの色クラス
 */
export const TOAST_ICON_COLOR = {
  [TOAST_TYPE.SUCCESS]: 'text-green-400',
  [TOAST_TYPE.ERROR]: 'text-red-400',
  [TOAST_TYPE.WARNING]: 'text-yellow-400',
  [TOAST_TYPE.INFO]: 'text-blue-400',
} as const;
