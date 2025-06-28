import { Factory } from 'fishery';

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
export const AlternativeLibraryTestDataFactory =
  Factory.define<LibraryTestData>(() => ({
    scriptId: '1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890',
    repoUrl: 'example/sample-library',
    expectedName: 'sample-library',
    expectedAuthor: 'example',
  }));
