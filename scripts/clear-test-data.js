#!/usr/bin/env node

/**
 * テストデータクリアスクリプト
 * E2Eテスト前にlibraryテーブルのデータをクリアする
 */

import { config } from 'dotenv';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';

// 環境変数を読み込み
config();

const TEST_DB_NAME = process.env.POSTGRES_TEST_DB || 'apps_script_hub_test_db';
const POSTGRES_CONFIG = {
  host: 'localhost',
  port: 5433,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: TEST_DB_NAME,
};

async function clearTestData() {
  const client = new Client(POSTGRES_CONFIG);

  try {
    await client.connect();
    const db = drizzle(client);

    // libraryテーブルのデータをクリア
    await db.execute(sql`DELETE FROM "library"`);
  } catch (error) {
    console.error('❌ データクリアエラー:', error);
    throw error;
  } finally {
    await client.end();
  }
}

async function main() {
  try {
    await clearTestData();
    process.exit(0);
  } catch (error) {
    console.error('❌ データクリアに失敗しました:', error);
    process.exit(1);
  }
}

// スクリプトが直接実行された場合のみ実行
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { clearTestData };
