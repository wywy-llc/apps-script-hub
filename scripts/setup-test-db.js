#!/usr/bin/env node

/**
 * テスト用データベースのセットアップスクリプト
 * E2Eテスト実行前にテスト専用のデータベースを作成・初期化する
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
};

async function setupTestDatabase() {
  console.log('🔧 テスト用データベースのセットアップを開始...');

  // 1. PostgreSQLサーバーに接続（デフォルトDBに接続）
  const adminClient = new Client({
    ...POSTGRES_CONFIG,
    database: 'postgres', // デフォルトDB
  });

  try {
    await adminClient.connect();
    console.log('✅ PostgreSQLサーバーに接続しました');

    // 2. テスト用データベースが存在する場合は削除
    try {
      await adminClient.query(`DROP DATABASE IF EXISTS "${TEST_DB_NAME}"`);
      console.log(`🗑️  既存のテストDB "${TEST_DB_NAME}" を削除しました`);
    } catch (error) {
      console.log('ℹ️  テストDBは存在しませんでした');
    }

    // 3. テスト用データベースを新規作成
    await adminClient.query(`CREATE DATABASE "${TEST_DB_NAME}"`);
    console.log(`✅ テストDB "${TEST_DB_NAME}" を作成しました`);
  } catch (error) {
    console.error('❌ データベース作成エラー:', error);
    throw error;
  } finally {
    await adminClient.end();
  }

  // 4. テスト用データベースに接続してスキーマを作成
  const testClient = new Client({
    ...POSTGRES_CONFIG,
    database: TEST_DB_NAME,
  });

  try {
    await testClient.connect();
    console.log(`✅ テストDB "${TEST_DB_NAME}" に接続しました`);

    // 5. Drizzle ORMでスキーマを作成
    const db = drizzle(testClient);

    // スキーマを手動で作成（マイグレーションファイルがない場合）
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "user" (
        "id" text PRIMARY KEY NOT NULL,
        "age" integer
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "session" (
        "id" text PRIMARY KEY NOT NULL,
        "user_id" text NOT NULL,
        "expires_at" timestamp with time zone NOT NULL,
        FOREIGN KEY ("user_id") REFERENCES "user"("id")
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "library" (
        "id" text PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "script_id" text NOT NULL,
        "repository_url" text NOT NULL,
        "author_url" text NOT NULL,
        "author_name" text,
        "description" text,
        "readme_content" text,
        "star_count" integer DEFAULT 0,
        "status" text DEFAULT 'pending' NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      );
    `);

    console.log('✅ データベーススキーマを作成しました');
  } catch (error) {
    console.error('❌ スキーマ作成エラー:', error);
    throw error;
  } finally {
    await testClient.end();
  }

  console.log('🎉 テスト用データベースのセットアップが完了しました');
}

async function main() {
  try {
    await setupTestDatabase();
    process.exit(0);
  } catch (error) {
    console.error('❌ セットアップに失敗しました:', error);
    process.exit(1);
  }
}

// スクリプトが直接実行された場合のみ実行
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { setupTestDatabase };
