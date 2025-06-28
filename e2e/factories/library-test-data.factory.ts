import { sql } from 'drizzle-orm';
import { createDatabaseFactory, createPresetFactories, generateUniqueId } from './base.factory';

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
 * ライブラリテストデータのFactory群
 * プリセットパターンを使用して複数のテストケースを簡単に生成
 *
 * 使用例:
 * ```typescript
 * // デフォルトの正常系データを生成
 * const testData = LibraryTestDataFactories.default.build();
 *
 * // 代替ライブラリデータを生成
 * const altData = LibraryTestDataFactories.alternative.build();
 *
 * // 特定の値を上書きして生成
 * const customTestData = LibraryTestDataFactories.default.build({
 *   scriptId: 'custom-script-id',
 *   expectedName: 'custom-name'
 * });
 * ```
 */
export const LibraryTestDataFactories = createPresetFactories<LibraryTestData>({
  default: () => ({
    scriptId: '1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF',
    repoUrl: 'googleworkspace/apps-script-oauth2',
    expectedName: 'apps-script-oauth2',
    expectedAuthor: 'googleworkspace',
  }),
  alternative: () => ({
    scriptId: '1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890',
    repoUrl: 'example/sample-library',
    expectedName: 'sample-library',
    expectedAuthor: 'example',
  }),
});

// 後方互換性のため古いファクトリ名をエクスポート
export const LibraryTestDataFactory = LibraryTestDataFactories.default;
export const AlternativeLibraryTestDataFactory = LibraryTestDataFactories.alternative;

/**
 * データベース作成用のライブラリデータFactory
 * 共通化されたcreateDatabaseFactoryを使用してデータベースに直接ライブラリを作成
 */
export const DatabaseLibraryDataFactory = createDatabaseFactory<DatabaseLibraryData>(
  'library',
  () => {
    const timestamp = Date.now();
    return {
      id: generateUniqueId('lib'),
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
  },
  async (db, libraryData) => {
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
  }
);

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
