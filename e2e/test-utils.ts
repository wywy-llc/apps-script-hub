import { clearTestData } from '../scripts/clear-test-data.js';

/**
 * E2Eテスト用のユーティリティ関数
 */

/**
 * テストデータをクリアする
 * テストの前に呼び出して、データベースの状態をリセットする
 */
export async function clearTestDataBeforeTest() {
  try {
    await clearTestData();
    console.log('🧹 テストデータをクリアしました');
  } catch (error) {
    console.error('❌ テストデータのクリアに失敗しました:', error);
    throw error;
  }
}