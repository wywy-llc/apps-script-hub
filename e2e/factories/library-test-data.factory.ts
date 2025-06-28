import { sql } from 'drizzle-orm';
import { LIBRARY_STATUS, LibraryStatus } from '../../src/lib/constants/library-status';
import { library } from '../../src/lib/server/db/schema';
import { createDatabaseFactory, createPresetFactories, generateUniqueId } from './base.factory';

/**
 * ライブラリステータス（constants/library-status.tsから使用）
 */
export { LIBRARY_STATUS } from '../../src/lib/constants/library-status';
export type { LibraryStatus } from '../../src/lib/constants/library-status';

/**
 * ライブラリ作成用入力データ（drizzleスキーマから推論）
 */
export type CreateLibraryInput = Omit<
  typeof library.$inferInsert,
  'id' | 'createdAt' | 'updatedAt'
>;

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
 * DDDエンティティのCreateLibraryInputを基盤とし、IDを追加
 */
export interface DatabaseLibraryData extends CreateLibraryInput {
  id: string;
  status: LibraryStatus;
}

/**
 * 検索・ステータス別テスト用のライブラリデータ
 * DDDエンティティのCreateLibraryInputを基盤
 */
export interface LibraryStatusTestData extends CreateLibraryInput {
  status: LibraryStatus;
}

/**
 * ライブラリテストデータのFactory群
 * プリセットパターンを使用して複数のテストケースを簡単に生成
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

/**
 * ステータス別ライブラリテストデータFactory群
 * search-test-data.factoryから統合
 */
export const LibraryStatusTestDataFactories = createPresetFactories<LibraryStatusTestData>({
  published: () => ({
    name: 'GasLogger',
    scriptId: '1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF',
    repositoryUrl: 'https://github.com/gas-developer/GasLogger',
    authorUrl: 'https://github.com/gas-developer',
    authorName: 'gas-developer',
    description: 'スプレッドシートやCloud Loggingに簡単・高機能なログ出力機能を追加します。',
    readmeContent: '# GasLogger\n\nGoogle Apps Script用のロギングライブラリです。',
    starCount: 847,
    status: LIBRARY_STATUS.PUBLISHED,
  }),
  pending: () => ({
    name: 'PendingLibrary',
    scriptId: '1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890',
    repositoryUrl: 'https://github.com/test-user/PendingLibrary',
    authorUrl: 'https://github.com/test-user',
    authorName: 'test-user',
    description: '承認待ちのライブラリです。検索結果には表示されません。',
    readmeContent: '# PendingLibrary\n\n承認待ちのライブラリです。',
    starCount: 10,
    status: LIBRARY_STATUS.PENDING,
  }),
  rejected: () => ({
    name: 'RejectedLibrary',
    scriptId: '1ZyXwVuTsRqPoNmLkJiHgFeDcBa0987654321',
    repositoryUrl: 'https://github.com/bad-user/RejectedLibrary',
    authorUrl: 'https://github.com/bad-user',
    authorName: 'bad-user',
    description: '拒否されたライブラリです。検索結果には表示されません。',
    readmeContent: '# RejectedLibrary\n\n拒否されたライブラリです。',
    starCount: 5,
    status: LIBRARY_STATUS.REJECTED,
  }),
  gasDateFormatter: () => ({
    name: 'GasDateFormatter',
    scriptId: '1DaTeFoRmAtTeR1234567890AbCdEfGhIjKlMnOpQrStUvWxYz',
    repositoryUrl: 'https://github.com/date-wizard/GasDateFormatter',
    authorUrl: 'https://github.com/date-wizard',
    authorName: 'date-wizard',
    description: 'Moment.jsライクな日時フォーマットライブラリ',
    readmeContent: '# GasDateFormatter\n\n日時フォーマットライブラリです。',
    starCount: 234,
    status: LIBRARY_STATUS.PUBLISHED,
  }),
  gasCalendarSync: () => ({
    name: 'GasCalendarSync',
    scriptId: '1CaLeNdArSyNc1234567890AbCdEfGhIjKlMnOpQrStUvWxYz',
    repositoryUrl: 'https://github.com/sync-expert/GasCalendarSync',
    authorUrl: 'https://github.com/sync-expert',
    authorName: 'sync-expert',
    description: 'Googleカレンダー同期ライブラリ',
    readmeContent: '# GasCalendarSync\n\nカレンダー同期ライブラリです。',
    starCount: 456,
    status: LIBRARY_STATUS.PUBLISHED,
  }),
});

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
      status: LIBRARY_STATUS.PENDING,
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
