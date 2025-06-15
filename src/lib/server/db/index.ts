import { dev } from '$app/environment';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Vercel/SvelteKit環境変数の取得
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

// Vercel Edge Runtime用のコネクションプール設定
let pool: Pool;

if (dev) {
  // 開発環境: ローカルPostgreSQL
  pool = new Pool({
    connectionString: DATABASE_URL,
  });
} else {
  // 本番環境: Vercel最適化設定
  pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    allowExitOnIdle: true,
  });
}

export const db = drizzle(pool, { schema });
