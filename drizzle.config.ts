import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// .envファイルを読み込み（メッセージ非表示）
config({ quiet: true });

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

export default defineConfig({
  schema: './src/lib/server/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
