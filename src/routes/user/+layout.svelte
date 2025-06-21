<script lang="ts">
  import Footer from '$lib/components/Footer.svelte';
  import Header from '$lib/components/Header.svelte';

  // ユーザー向けページ用レイアウト
  // 多言語対応のヘッダーとフッターを含む

  let { children } = $props();
</script>

<div class="min-h-screen flex flex-col">
  <Header />
  <main class="flex-1">
    {@render children()}
  </main>
  <Footer />
</div>