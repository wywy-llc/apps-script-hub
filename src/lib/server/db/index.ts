import { DATABASE_URL } from '$env/static/private';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

// PostgreSQL接続プールの作成
const pool = new Pool({
  connectionString: DATABASE_URL,
});

// Drizzle ORMの初期化
export const db = drizzle(pool, { schema });

// 接続テスト関数
export async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connection successful:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}
