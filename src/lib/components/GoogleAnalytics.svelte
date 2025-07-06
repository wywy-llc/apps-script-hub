<script lang="ts">
  import { env } from '$env/dynamic/public';

  // 本番環境でのみGoogleアナリティクスを読み込む
  const trackingId = env.PUBLIC_GOOGLE_ANALYTICS_ID;
</script>

<svelte:head>
  {#if trackingId}
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
