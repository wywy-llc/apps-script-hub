import { config } from 'dotenv';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Factory } from 'fishery';
import { Client } from 'pg';

// 環境変数を読み込み
config();

/**
 * ライブラリテストデータのインターフェース
 */
export interface LibraryTestData {
  /** Google Apps Script ID */
  scriptId: string;
  /** GitHubリポジトリURL */
  repoUrl: string;
  /** 期待されるライブラリ名 */
  expectedName: string;
  /** 期待される作成者名 */
  expectedAuthor: string;
}

/**
 * データベース作成用のライブラリ情報
 */
export interface DatabaseLibraryData {
  id: string;
  name: string;
  scriptId: string;
  repositoryUrl: string;
  authorUrl: string;
  authorName: string;
  description: string;
  readmeContent: string;
  starCount: number;
  status: 'pending' | 'published' | 'rejected';
}

/**
 * ライブラリテストデータのFactory
 *
 * 使用例:
 * ```typescript
 * // デフォルトの正常系データを生成
 * const testData = LibraryTestDataFactory.build();
 *
 * // 特定の値を上書きして生成
 * const customTestData = LibraryTestDataFactory.build({
 *   scriptId: 'custom-script-id',
 *   expectedName: 'custom-name'
 * });
 * ```
 */
export const LibraryTestDataFactory = Factory.define<LibraryTestData>(() => ({
  scriptId: '1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF',
  repoUrl: 'googleworkspace/apps-script-oauth2',
  expectedName: 'apps-script-oauth2',
  expectedAuthor: 'googleworkspace',
}));

/**
 * 異なるライブラリ用のファクトリ
 * 複数のテストパターンを簡単に生成するためのプリセット
 */
export const AlternativeLibraryTestDataFactory = Factory.define<LibraryTestData>(() => ({
  scriptId: '1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890',
  repoUrl: 'example/sample-library',
  expectedName: 'sample-library',
  expectedAuthor: 'example',
}));

/**
 * データベース作成用のライブラリデータFactory
 * Fisheryのcreate機能を使用してデータベースに直接ライブラリを作成
 */
export const DatabaseLibraryDataFactory = Factory.define<
  DatabaseLibraryData,
  Partial<DatabaseLibraryData>,
  string
>(({ onCreate }) => {
  // onCreate: データベースに実際にレコードを作成する処理
  onCreate(async libraryData => {
    const TEST_DB_NAME = process.env.POSTGRES_TEST_DB || 'apps_script_hub_test_db';
    const POSTGRES_CONFIG = {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5433', 10),
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: TEST_DB_NAME,
    };

    const client = new Client(POSTGRES_CONFIG);

    try {
      await client.connect();
      const db = drizzle(client);

      await db.execute(sql`
          INSERT INTO "library" (
            "id", "name", "script_id", "repository_url", "author_url", 
            "author_name", "description", "readme_content", "star_count", "status"
          ) VALUES (
            ${libraryData.id}, ${libraryData.name}, ${libraryData.scriptId}, 
            ${libraryData.repositoryUrl}, ${libraryData.authorUrl}, ${libraryData.authorName}, 
            ${libraryData.description}, ${libraryData.readmeContent}, ${libraryData.starCount}, 
            ${libraryData.status}
          )
        `);

      return libraryData.id;
    } catch (error) {
      console.error('❌ ライブラリ作成エラー:', error);
      throw error;
    } finally {
      await client.end();
    }
  });

  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substr(2, 9);

  return {
    id: `lib_${timestamp}_${randomSuffix}`,
    name: 'apps-script-oauth2',
    scriptId: `1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF_${timestamp}`,
    repositoryUrl: `https://github.com/googleworkspace/apps-script-oauth2-${timestamp}`,
    authorUrl: 'https://github.com/googleworkspace',
    authorName: 'googleworkspace',
    description: 'A library for OAuth2 in Google Apps Script',
    readmeContent: '# Apps Script OAuth2\n\nOAuth2 library for Google Apps Script',
    starCount: 100,
    status: 'pending' as const,
  };
});

/**
 * DatabaseLibraryDataFactoryの使用例
 *
 * ```typescript
 * // Fisheryのcreate()メソッドを使用してデータベースにライブラリを直接作成
 *
 * // 承認待ち状態のライブラリを作成
 * const libraryId = await DatabaseLibraryDataFactory.create();
 *
 * // 特定のステータスでライブラリを作成
 * const publishedLibraryId = await DatabaseLibraryDataFactory.create({ status: 'published' });
 *
 * // カスタムデータでライブラリを作成
 * const customLibraryId = await DatabaseLibraryDataFactory.create({
 *   scriptId: 'custom-script-id',
 *   name: 'Custom Library',
 *   status: 'rejected'
 * });
 * ```
 */
