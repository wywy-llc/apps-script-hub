import type { StorybookConfig } from '@storybook/sveltekit';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|ts|svelte)'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
    '@storybook/addon-svelte-csf',
  ],
  framework: {
    name: '@storybook/sveltekit',
    options: {},
  },
  core: {
    disableWhatsNewNotifications: true,
  },
  docs: {
    defaultName: 'Docs',
  },
  viteFinal: async config => {
    // Tailwind CSSの設定を確実に読み込む
    return config;
  },
};

export default config;
