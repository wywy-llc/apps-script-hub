import { sql } from '@vercel/postgres';
import { drizzle } from 'drizzle-orm/vercel-postgres';
import * as schema from './schema';

// Vercel/SvelteKit環境変数の取得
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

// Vercel PostgreSQLを使用（本番・開発共通）
export const db = drizzle(sql, { schema });
