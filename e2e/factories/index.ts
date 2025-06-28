/**
 * Factory共通エクスポートファイル
 * 全てのfactoryを一箇所でインポートできるようにする
 */

// 基底クラスとユーティリティ
export {
  closeDbConnection,
  createDatabaseFactory,
  createDbConnection,
  createPresetFactories,
  createTestDataFactory,
  generateUniqueId,
  POSTGRES_CONFIG,
} from './base.factory';

// ライブラリ関連のfactory
export {
  AlternativeLibraryTestDataFactory,
  DatabaseLibraryDataFactory,
  LibraryTestDataFactories,
  LibraryTestDataFactory,
  type DatabaseLibraryData,
  type LibraryTestData,
} from './library-test-data.factory';

// ユーザー関連のfactory
export {
  DatabaseUserDataFactory,
  UserTestDataFactories,
  UserTestDataFactory,
  type DatabaseUserData,
  type UserTestData,
} from './user-test-data.factory';

/**
 * 使用例:
 *
 * ```typescript
 * import {
 *   LibraryTestDataFactories,
 *   UserTestDataFactories,
 *   DatabaseLibraryDataFactory,
 *   DatabaseUserDataFactory
 * } from '@/e2e/factories';
 *
 * // テストデータ生成
 * const libraryData = LibraryTestDataFactories.default.build();
 * const userData = UserTestDataFactories.admin.build();
 *
 * // データベースに直接作成
 * const libraryId = await DatabaseLibraryDataFactory.create();
 * const userId = await DatabaseUserDataFactory.create();
 * ```
 */
