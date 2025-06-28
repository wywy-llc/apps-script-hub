<script lang="ts">
  import {
    LIBRARY_STATUS,
    LIBRARY_STATUS_CONFIRM_MESSAGES,
    type LibraryStatus,
  } from '$lib/constants/library-status.js';
  import type { Library } from '$lib/server/db/schema.js';

  interface Props {
    library: Library;
    isStatusUpdateInProgress: boolean;
    onStatusUpdate: (status: LibraryStatus) => void;
  }

  let { library, isStatusUpdateInProgress, onStatusUpdate }: Props = $props();

  function handleStatusUpdate(newStatus: LibraryStatus) {
    if (confirm(LIBRARY_STATUS_CONFIRM_MESSAGES[newStatus])) {
      onStatusUpdate(newStatus);
    }
  }
</script>

<!-- ステータス更新ボタン -->
{#if library.status === LIBRARY_STATUS.PENDING}
  <button
    type="button"
    onclick={() => handleStatusUpdate(LIBRARY_STATUS.PUBLISHED)}
    disabled={isStatusUpdateInProgress}
    class="inline-flex cursor-pointer justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
  >
    承認・公開
  </button>
  <button
    type="button"
    onclick={() => handleStatusUpdate(LIBRARY_STATUS.REJECTED)}
    disabled={isStatusUpdateInProgress}
    class="inline-flex cursor-pointer justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
  >
    拒否
  </button>
{:else if library.status === LIBRARY_STATUS.PUBLISHED}
  <button
    type="button"
    onclick={() => handleStatusUpdate(LIBRARY_STATUS.REJECTED)}
    disabled={isStatusUpdateInProgress}
    class="inline-flex cursor-pointer justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
  >
    拒否に変更
  </button>
{:else if library.status === LIBRARY_STATUS.REJECTED}
  <button
    type="button"
    onclick={() => handleStatusUpdate(LIBRARY_STATUS.PUBLISHED)}
    disabled={isStatusUpdateInProgress}
    class="inline-flex cursor-pointer justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
  >
    承認・公開
  </button>
{/if}
