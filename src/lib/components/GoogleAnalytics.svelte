<script lang="ts">
  import { browser, dev } from '$app/environment';
  import { env } from '$env/dynamic/public';

  // 本番環境でのみGoogleアナリティクスを読み込む
  const shouldLoadGA = browser && !dev && env.PUBLIC_GOOGLE_ANALYTICS_ID;
  const trackingId = env.PUBLIC_GOOGLE_ANALYTICS_ID || 'G-DQ4L0NYB3W';
</script>

<svelte:head>
  {#if shouldLoadGA}
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id={trackingId}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        dataLayer.push(arguments);
      }
      gtag('js', new Date());

      gtag('config', '{trackingId}');
    </script>
  {/if}
</svelte:head>
