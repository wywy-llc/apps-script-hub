<script lang="ts">
  import Footer from '$lib/components/Footer.svelte';
  import Header from '$lib/components/Header.svelte';
  import UserHeader from '$lib/components/UserHeader.svelte';

  // ユーザー向けページ用レイアウト
  // ログイン状態に応じてヘッダーを切り替え

  let { children, data } = $props();

  let session = $derived(data.session);
  let user = $derived(data.user);
  let isLoggedIn = $derived(session && user);
</script>

<div class="flex min-h-screen flex-col">
  {#if isLoggedIn}
    <UserHeader
      user={user && 'name' in user && 'email' in user && 'picture' in user
        ? {
            name: String(user.name),
            email: String(user.email),
            image: typeof user.picture === 'string' ? user.picture : undefined,
          }
        : { name: '', email: '', image: '' }}
      showAdminLink={false}
    />
  {:else}
    <Header />
  {/if}
  <main class="flex-1">
    {@render children()}
  </main>
  <Footer />
</div>
