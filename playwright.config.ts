import { defineConfig } from '@playwright/test';
import { config } from 'dotenv';

// .envファイルを読み込み
config();

export default defineConfig({
  webServer: {
    command: 'npm run build && npm run preview',
    port: 4173,
    env: {
      DATABASE_URL: process.env.DATABASE_URL || '',
      POSTGRES_USER: process.env.POSTGRES_USER || '',
      POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD || '',
      POSTGRES_DB: process.env.POSTGRES_DB || '',
    },
  },
  testDir: 'e2e',
});
