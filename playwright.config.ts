import { defineConfig } from '@playwright/test';
import { config } from 'dotenv';

// 環境変数を読み込み
config();

export default defineConfig({
  webServer: {
    command: 'npm run build && npm run preview',
    port: 4173,
    env: {
      DATABASE_URL:
        process.env.DATABASE_TEST_URL || process.env.DATABASE_URL || '',
      POSTGRES_USER: process.env.POSTGRES_USER || '',
      POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD || '',
      POSTGRES_DB:
        process.env.POSTGRES_TEST_DB || process.env.POSTGRES_DB || '',
      NODE_ENV: 'test',
      GITHUB_TOKEN: process.env.GITHUB_TOKEN || '',
    },
  },
  testDir: 'e2e',
});
