<script module>
  import Footer from '$lib/components/Footer.svelte';
  import { defineMeta } from '@storybook/addon-svelte-csf';

  // AppsScriptHubのフッターコンポーネントのStorybook設定
  const { Story } = defineMeta({
    title: 'AppsScriptHub/Footer',
    component: Footer,
    tags: ['autodocs'],
    parameters: {
      layout: 'fullscreen',
    },
  });
</script>

<!-- デフォルトのフッター表示 -->
<Story name="Default" />

<!-- モバイル表示用 -->
<Story
  name="Mobile"
  parameters={{
    viewport: {
      defaultViewport: 'mobile1',
    },
  }}
/>
