<script lang="ts">
  import { notifications } from '$lib/paraglide/messages.js';
  import { toastStore } from '$lib/stores/toast-store.js';
  import Toast from './Toast.svelte';
</script>

<!-- 
  トーストコンテナ
  画面右上に固定表示され、全てのトーストメッセージを管理する
-->
{#if $toastStore.toasts.length > 0}
  <div
    class="fixed top-4 right-4 z-50 w-full max-w-sm space-y-2"
    role="alert"
    aria-live="polite"
    aria-label={notifications()}
  >
    {#each $toastStore.toasts as toast (toast.id)}
      <Toast {toast} />
    {/each}
  </div>
{/if}
