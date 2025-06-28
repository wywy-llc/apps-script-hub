<script lang="ts">
  import type { Library } from '$lib/server/db/schema.js';

  interface Props {
    library: Library;
    isStatusUpdateInProgress: boolean;
    onStatusUpdate: (status: 'published' | 'rejected' | 'pending') => void;
  }

  let { library, isStatusUpdateInProgress, onStatusUpdate }: Props = $props();

  function handleStatusUpdate(newStatus: 'published' | 'rejected' | 'pending') {
    const confirmMessages = {
      published: 'このライブラリを承認して公開しますか？',
      rejected: 'このライブラリを拒否しますか？',
      pending: 'このライブラリを承認待ちに戻しますか？',
    };

    if (confirm(confirmMessages[newStatus])) {
      onStatusUpdate(newStatus);
    }
  }
</script>

<!-- ステータス更新ボタン -->
{#if library.status === 'pending'}
  <button
    type="button"
    onclick={() => handleStatusUpdate('published')}
    disabled={isStatusUpdateInProgress}
    class="inline-flex cursor-pointer justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
  >
    承認・公開
  </button>
  <button
    type="button"
    onclick={() => handleStatusUpdate('rejected')}
    disabled={isStatusUpdateInProgress}
    class="inline-flex cursor-pointer justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
  >
    拒否
  </button>
{:else if library.status === 'published'}
  <button
    type="button"
    onclick={() => handleStatusUpdate('rejected')}
    disabled={isStatusUpdateInProgress}
    class="inline-flex cursor-pointer justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
  >
    拒否に変更
  </button>
{:else if library.status === 'rejected'}
  <button
    type="button"
    onclick={() => handleStatusUpdate('published')}
    disabled={isStatusUpdateInProgress}
    class="inline-flex cursor-pointer justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
  >
    承認・公開
  </button>
{/if}
