<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  // ルートページ（/）にアクセスした際に、/userにリダイレクトする
  onMount(() => {
    goto('/user', { replaceState: true });
  });
</script>
