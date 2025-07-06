<script lang="ts">
  import { browser, dev } from '$app/environment';

  // 本番環境でのみGoogleアナリティクスを読み込む
  const shouldLoadGA = browser && !dev;
</script>

<svelte:head>
  {#if shouldLoadGA}
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-DQ4L0NYB3W"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        dataLayer.push(arguments);
      }
      gtag('js', new Date());

      gtag('config', 'G-DQ4L0NYB3W');
    </script>
  {/if}
</svelte:head>
