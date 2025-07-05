<script lang="ts">
  import {
    TOAST_CONFIG,
    TOAST_ICON_COLOR,
    TOAST_ICON_PATH,
    TOAST_STYLE_CLASS,
  } from '$lib/constants/toast.js';
  import { toastStore, type ToastMessage } from '$lib/stores/toast-store.js';
  import { onMount } from 'svelte';

  /**
   * 個別トーストコンポーネントの Props
   */
  interface ToastItemProps {
    toast: ToastMessage;
  }

  let { toast }: ToastItemProps = $props();

  let isVisible = $state(false);
  let isLeaving = $state(false);

  onMount(() => {
    // マウント時にフェードイン効果
    setTimeout(() => {
      isVisible = true;
    }, 10);

    // 削除前のフェードアウト効果
    const timeoutId = setTimeout(
      () => {
        isLeaving = true;

        // フェードアウト完了後に削除
        setTimeout(() => {
          toastStore.remove(toast.id);
        }, TOAST_CONFIG.ANIMATION_DURATION);
      },
      (toast.duration ?? TOAST_CONFIG.DURATION) - TOAST_CONFIG.ANIMATION_DURATION
    );

    // クリーンアップ
    return () => {
      clearTimeout(timeoutId);
    };
  });

  /**
   * 閉じるボタンクリック時の処理
   */
  function handleClose() {
    isLeaving = true;
    setTimeout(() => {
      toastStore.remove(toast.id);
    }, TOAST_CONFIG.ANIMATION_DURATION);
  }

  /**
   * トーストのスタイルクラスを取得
   */
  function getToastClass(): string {
    const baseClass = `relative mb-3 flex items-center rounded-lg border p-4 shadow-lg transition-all duration-300 ${TOAST_STYLE_CLASS[toast.type]}`;

    if (isLeaving) {
      return `${baseClass} transform translate-x-full opacity-0`;
    }

    if (isVisible) {
      return `${baseClass} transform translate-x-0 opacity-100`;
    }

    return `${baseClass} transform translate-x-full opacity-0`;
  }
</script>

<div class={getToastClass()}>
  <!-- アイコン -->
  <div class="flex-shrink-0">
    <svg
      class="h-5 w-5 {TOAST_ICON_COLOR[toast.type]}"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d={TOAST_ICON_PATH[toast.type]}
      ></path>
    </svg>
  </div>

  <!-- メッセージ -->
  <div class="ml-3 flex-1">
    <p class="text-sm font-medium">
      {toast.message}
    </p>
  </div>

  <!-- 閉じるボタン -->
  <div class="ml-4 flex-shrink-0">
    <button
      type="button"
      onclick={handleClose}
      class="inline-flex rounded-md focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-white focus:outline-none"
      aria-label="トーストを閉じる"
    >
      <svg
        class="h-4 w-4 opacity-60 hover:opacity-100"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        ></path>
      </svg>
    </button>
  </div>
</div>
