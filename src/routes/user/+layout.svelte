<script lang="ts">
  import { page } from '$app/stores';
  import Footer from '$lib/components/Footer.svelte';
  import Header from '$lib/components/Header.svelte';
  import UserHeader from '$lib/components/UserHeader.svelte';

  // ユーザー向けページ用レイアウト
  // ログイン状態に応じてヘッダーを切り替え

  let { children } = $props();

  let session = $derived($page.data.session);
  let user = $derived($page.data.user);
  let isLoggedIn = $derived(session && user);
</script>

<div class="min-h-screen flex flex-col">
  {#if isLoggedIn}
    <UserHeader {user} showAdminLink={false} />
  {:else}
    <Header />
  {/if}
  <main class="flex-1">
    {@render children()}
  </main>
  <Footer />
</div>
