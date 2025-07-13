<script lang="ts">
  import {
    LIBRARY_STATUS,
    LIBRARY_STATUS_CONFIRM_MESSAGES,
    type LibraryStatus,
  } from '$lib/constants/library-status.js';
  import { publish, unpublish, reject } from '$lib/paraglide/messages.js';
  interface LibraryForStatus {
    status: LibraryStatus;
  }

  interface Props {
    library: LibraryForStatus;
    isStatusUpdateInProgress: boolean;
    onStatusUpdate: (status: LibraryStatus) => void;
    compact?: boolean;
  }

  let { library, isStatusUpdateInProgress, onStatusUpdate, compact = false }: Props = $props();

  function handleStatusUpdate(newStatus: LibraryStatus) {
    if (confirm(LIBRARY_STATUS_CONFIRM_MESSAGES[newStatus])) {
      onStatusUpdate(newStatus);
    }
  }

  // ボタンのクラスを動的に生成
  function getButtonClass(color: 'green' | 'gray' | 'red') {
    const baseClass =
      'inline-flex cursor-pointer justify-center rounded-md border border-transparent shadow-sm disabled:cursor-not-allowed disabled:opacity-50';
    const sizeClass = compact ? 'px-3 py-1 text-xs font-medium' : 'px-4 py-2 text-sm font-medium';

    const colorClasses = {
      green: 'bg-green-600 text-white hover:bg-green-700',
      gray: 'bg-gray-600 text-white hover:bg-gray-700',
      red: 'bg-red-600 text-white hover:bg-red-700',
    };

    return `${baseClass} ${sizeClass} ${colorClasses[color]}`;
  }
</script>

<!-- ステータス更新ボタン -->
<div class={compact ? 'flex gap-2' : 'flex gap-3'}>
  {#if library.status === LIBRARY_STATUS.PENDING}
    <!-- 未公開の場合: 公開・却下ボタンを表示 -->
    <button
      type="button"
      onclick={() => handleStatusUpdate(LIBRARY_STATUS.PUBLISHED)}
      disabled={isStatusUpdateInProgress}
      class={getButtonClass('green')}
    >
      {publish()}
    </button>
    <button
      type="button"
      onclick={() => handleStatusUpdate(LIBRARY_STATUS.REJECTED)}
      disabled={isStatusUpdateInProgress}
      class={getButtonClass('red')}
    >
      {reject()}
    </button>
  {:else if library.status === LIBRARY_STATUS.PUBLISHED}
    <!-- 公開の場合: 未公開ボタンを表示 -->
    <button
      type="button"
      onclick={() => handleStatusUpdate(LIBRARY_STATUS.PENDING)}
      disabled={isStatusUpdateInProgress}
      class={getButtonClass('gray')}
    >
      {unpublish()}
    </button>
  {:else if library.status === LIBRARY_STATUS.REJECTED}
    <!-- 却下の場合: 未公開に戻すボタンを表示 -->
    <button
      type="button"
      onclick={() => handleStatusUpdate(LIBRARY_STATUS.PENDING)}
      disabled={isStatusUpdateInProgress}
      class={getButtonClass('gray')}
    >
      {unpublish()}
    </button>
  {/if}
</div>
