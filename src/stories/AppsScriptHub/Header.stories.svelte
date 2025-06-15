<script module>
	import Header from '$lib/components/Header.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	// AppsScriptHubのヘッダーコンポーネントのStorybook設定
	const { Story } = defineMeta({
		title: 'AppsScriptHub/Header',
		component: Header,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen'
		}
	});
</script>

<!-- デフォルトのヘッダー表示 -->
<Story name="Default" />

<!-- モバイル表示用 -->
<Story
	name="Mobile"
	parameters={{
		viewport: {
			defaultViewport: 'mobile1'
		}
	}}
/>