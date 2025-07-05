import { TOAST_CONFIG, TOAST_TYPE, type ToastType } from '$lib/constants/toast.js';
import { writable } from 'svelte/store';

/**
 * トーストメッセージの型定義
 */
export interface ToastMessage {
  /** 一意のID */
  id: string;
  /** メッセージ内容 */
  message: string;
  /** トーストの種類 */
  type: ToastType;
  /** 表示時間（ミリ秒）。指定しない場合はデフォルト値を使用 */
  duration?: number;
}

/**
 * トーストストアの型定義
 */
interface ToastStore {
  /** 現在のトーストメッセージ一覧 */
  toasts: ToastMessage[];
}

/**
 * 一意のID生成関数
 */
function generateToastId(): string {
  return `toast_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * トーストメッセージを管理するストア
 */
function createToastStore() {
  const { subscribe, update } = writable<ToastStore>({ toasts: [] });

  return {
    subscribe,

    /**
     * 成功メッセージのトーストを表示
     * @param message - 表示するメッセージ
     * @param duration - 表示時間（ミリ秒）。省略時はデフォルト値
     */
    success: (message: string, duration?: number) => {
      addToast({ message, type: TOAST_TYPE.SUCCESS, duration });
    },

    /**
     * エラーメッセージのトーストを表示
     * @param message - 表示するメッセージ
     * @param duration - 表示時間（ミリ秒）。省略時はデフォルト値
     */
    error: (message: string, duration?: number) => {
      addToast({ message, type: TOAST_TYPE.ERROR, duration });
    },

    /**
     * 警告メッセージのトーストを表示
     * @param message - 表示するメッセージ
     * @param duration - 表示時間（ミリ秒）。省略時はデフォルト値
     */
    warning: (message: string, duration?: number) => {
      addToast({ message, type: TOAST_TYPE.WARNING, duration });
    },

    /**
     * 情報メッセージのトーストを表示
     * @param message - 表示するメッセージ
     * @param duration - 表示時間（ミリ秒）。省略時はデフォルト値
     */
    info: (message: string, duration?: number) => {
      addToast({ message, type: TOAST_TYPE.INFO, duration });
    },

    /**
     * 指定したIDのトーストを削除
     * @param id - 削除するトーストのID
     */
    remove: (id: string) => {
      update(store => ({
        ...store,
        toasts: store.toasts.filter(toast => toast.id !== id),
      }));
    },

    /**
     * 全てのトーストをクリア
     */
    clear: () => {
      update(store => ({
        ...store,
        toasts: [],
      }));
    },
  };

  /**
   * トーストメッセージを追加する内部関数
   * @param params - トーストメッセージのパラメータ
   */
  function addToast({
    message,
    type,
    duration,
  }: {
    message: string;
    type: ToastType;
    duration?: number;
  }) {
    const toast: ToastMessage = {
      id: generateToastId(),
      message,
      type,
      duration: duration ?? TOAST_CONFIG.DURATION,
    };

    update(store => {
      // 最大表示数を超えた場合は古いトーストを削除
      const newToasts = [...store.toasts, toast];
      if (newToasts.length > TOAST_CONFIG.MAX_TOASTS) {
        newToasts.splice(0, newToasts.length - TOAST_CONFIG.MAX_TOASTS);
      }

      return {
        ...store,
        toasts: newToasts,
      };
    });

    // 指定時間後に自動削除
    setTimeout(() => {
      update(store => ({
        ...store,
        toasts: store.toasts.filter(t => t.id !== toast.id),
      }));
    }, toast.duration);
  }
}

/**
 * グローバルトーストストア
 *
 * 使用例:
 * ```typescript
 * import { toastStore } from '$lib/stores/toast-store.js';
 *
 * // 成功メッセージ
 * toastStore.success('コピーしました');
 *
 * // エラーメッセージ
 * toastStore.error('エラーが発生しました');
 *
 * // カスタム表示時間
 * toastStore.info('情報メッセージ', 5000);
 * ```
 */
export const toastStore = createToastStore();
