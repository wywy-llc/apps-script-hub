<script lang="ts">
  import '../app.css';
  import ToastContainer from '$lib/components/ToastContainer.svelte';

  // ルートレイアウト - 最小限の設定のみ
  // 各サブディレクトリで独自のレイアウトを定義

  let { children } = $props();
</script>

{@render children()}
s
<!-- グローバルトーストコンテナ -->
<ToastContainer />
