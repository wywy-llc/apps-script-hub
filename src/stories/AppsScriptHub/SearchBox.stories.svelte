<script module>
	import SearchBox from '$lib/components/SearchBox.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	// GASライブラリ検索コンポーネントのStorybook設定
	// 異なるサイズ、プレースホルダー、初期値のバリエーションを表示
	const { Story } = defineMeta({
		title: 'AppsScriptHub/SearchBox',
		component: SearchBox,
		tags: ['autodocs'],
		argTypes: {
			placeholder: {
				control: 'text',
				description: '検索ボックスのプレースホルダーテキスト'
			},
			value: {
				control: 'text',
				description: '検索ボックスの初期値'
			},
			size: {
				control: 'select',
				options: ['small', 'large'],
				description: '検索ボックスのサイズ'
			}
		},
		parameters: {
			docs: {
				description: {
					component: 'GASライブラリを検索するための共通コンポーネント。トップページと検索ページで使用されます。'
				}
			}
		}
	});
</script>

<!-- デフォルトの検索ボックス（大きいサイズ） -->
<Story 
	name="Default"
	args={{
		placeholder: 'GASライブラリを検索',
		value: '',
		size: 'large'
	}}
/>

<!-- 小さいサイズの検索ボックス -->
<Story 
	name="Small" 
	args={{
		placeholder: 'GASライブラリを検索',
		value: '',
		size: 'small'
	}}
/>

<!-- 初期値がある検索ボックス -->
<Story 
	name="WithValue" 
	args={{
		placeholder: 'GASライブラリを検索',
		value: 'Logger',
		size: 'large'
	}}
/>

<!-- カスタムプレースホルダー -->
<Story 
	name="CustomPlaceholder" 
	args={{
		placeholder: 'ライブラリ名を入力してください',
		value: '',
		size: 'large'
	}}
/>

<!-- モバイル表示用（小さいサイズ） -->
<Story
	name="Mobile"
	args={{
		placeholder: 'GASライブラリを検索',
		value: '',
		size: 'small'
	}}
	parameters={{
		viewport: {
			defaultViewport: 'mobile1'
		}
	}}
/>