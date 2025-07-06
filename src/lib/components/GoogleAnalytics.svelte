<script lang="ts">
  import { browser } from '$app/environment';
  import { env } from '$env/dynamic/public';
  import { onMount } from 'svelte';

  const trackingId = env.PUBLIC_GOOGLE_ANALYTICS_ID;

  onMount(() => {
    if (!browser || !trackingId) return;

    // windowオブジェクトの型安全な参照
    const windowObject = window as unknown as Window & {
      dataLayer: unknown[];
      gtag: (...args: unknown[]) => void;
    };

    // dataLayerの初期化
    windowObject.dataLayer = windowObject.dataLayer || [];
    function gtag(...args: unknown[]) {
      windowObject.dataLayer.push(args);
    }

    // Google Analytics外部スクリプトの追加
    const gtagScript = document.createElement('script');
    gtagScript.async = true;
    gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
    document.head.appendChild(gtagScript);

    // 初期化スクリプトの追加（内容のあるスクリプトタグを作成）
    const initScript = document.createElement('script');
    initScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${trackingId}');
    `;
    document.head.appendChild(initScript);

    // グローバルにgtag関数を設定
    windowObject.gtag = gtag;
  });
</script>
