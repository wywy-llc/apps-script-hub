#!/usr/bin/env node

/**
 * テスト用データベースのクリーンアップスクリプト
 * E2Eテスト実行後にテスト専用のデータベースを削除する
 */

import { config } from 'dotenv';
import { Client } from 'pg';

// 環境変数を読み込み
config();

const TEST_DB_NAME = process.env.POSTGRES_TEST_DB || 'apps_script_hub_test_db';
const POSTGRES_CONFIG = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5433', 10),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
};

async function cleanupTestDatabase() {
  console.log('🧹 テスト用データベースのクリーンアップを開始...');

  // PostgreSQLサーバーに接続（デフォルトDBに接続）
  const adminClient = new Client({
    ...POSTGRES_CONFIG,
    database: 'postgres', // デフォルトDB
  });

  try {
    await adminClient.connect();
    console.log('✅ PostgreSQLサーバーに接続しました');

    // テスト用データベースを削除
    try {
      // アクティブな接続を強制終了してからデータベースを削除
      await adminClient.query(`
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE datname = '${TEST_DB_NAME}' AND pid <> pg_backend_pid()
      `);

      await adminClient.query(`DROP DATABASE IF EXISTS "${TEST_DB_NAME}"`);
      console.log(`🗑️  テストDB "${TEST_DB_NAME}" を削除しました`);
    } catch (error) {
      console.log('ℹ️  テストDBは存在しませんでした');
    }
  } catch (error) {
    console.error('❌ データベース削除エラー:', error);
    throw error;
  } finally {
    await adminClient.end();
  }

  console.log('✅ テスト用データベースのクリーンアップが完了しました');
}

async function main() {
  try {
    await cleanupTestDatabase();
    process.exit(0);
  } catch (error) {
    console.error('❌ クリーンアップに失敗しました:', error);
    process.exit(1);
  }
}

// スクリプトが直接実行された場合のみ実行
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { cleanupTestDatabase };
