import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';

const config = {
  preprocess: [vitePreprocess(), mdsvex()],
  kit: {
    adapter: adapter({
      // Vercel最適化設定
      runtime: 'nodejs20.x',
      regions: ['nrt1'], // 東京リージョン (日本向け)
      memory: 1024, // メモリ設定 (MB)
      maxDuration: 10, // 10秒タイムアウト
      split: false, // 単一関数として統合デプロイ
    }),
  },
  extensions: ['.svelte', '.svx'],
};

export default config;
