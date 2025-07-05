<script lang="ts">
  import ToastContainer from '$lib/components/ToastContainer.svelte';
  import '../app.css';

  // ルートレイアウト - 最小限の設定のみ
  // 各サブディレクトリで独自のレイアウトを定義

  let { children } = $props();
</script>

{@render children()}

<!-- グローバルトーストコンテナ -->
<ToastContainer />
