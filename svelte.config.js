import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';

const config = {
  preprocess: [vitePreprocess(), mdsvex()],
  kit: {
    adapter: adapter({
      // Vercel最適化設定
      runtime: 'nodejs22.x',
      regions: ['pdx1', 'iad1', 'hnd1'], // 東京リージョン (日本向け)
      maxDuration: 300, // 300秒タイムアウト
      split: true, // 関数を分割してデプロイ
      edge: false, // エッジ関数ではなく、通常のサーバーレス関数としてデプロイ
      external: ['pg-native', 'cloudflare:sockets'],
    }),
  },
  extensions: ['.svelte', '.svx'],
};

export default config;
