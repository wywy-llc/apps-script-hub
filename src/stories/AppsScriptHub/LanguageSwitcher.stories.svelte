<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';

  // 言語切り替えコンポーネントのStorybook設定
  // モダンなドロップダウンデザインで多言語対応機能を提供
  const { Story } = defineMeta({
    title: 'AppsScriptHub/LanguageSwitcher',
    component: LanguageSwitcher,
    tags: ['autodocs'],
    parameters: {
      docs: {
        description: {
          component:
            '多言語対応の言語切り替えコンポーネント。ドロップダウン形式で言語を選択できます。',
        },
      },
    },
  });
</script>

<!-- Default -->
<Story name="Default">
  <div class="p-4">
    <LanguageSwitcher />
  </div>
</Story>

<!-- In Header Context -->
<Story name="In Header">
  <div class="border-b border-gray-200 bg-white p-4">
    <div class="flex items-center justify-between">
      <div class="text-xl font-bold text-gray-900">GAS Library Hub</div>
      <div class="flex items-center space-x-4">
        <LanguageSwitcher />
        <button class="text-sm font-medium text-gray-600">Sign in</button>
        <button class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white"
          >Sign up</button
        >
      </div>
    </div>
  </div>
</Story>

<!-- Dark Background -->
<Story name="On Dark Background">
  <div class="bg-gray-800 p-4">
    <LanguageSwitcher />
  </div>
</Story>

<!-- Compact Layout -->
<Story name="Compact Layout">
  <div class="max-w-md rounded-lg border border-gray-200 p-4">
    <div class="flex items-center justify-between">
      <span class="text-sm text-gray-600">Language:</span>
      <LanguageSwitcher />
    </div>
  </div>
</Story>
