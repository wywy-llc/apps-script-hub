import { clearTestData } from '../scripts/clear-test-data.js';

async function globalSetup() {
  console.log('🔧 E2Eテスト前のセットアップを開始...');

  try {
    // テストデータをクリア
    await clearTestData();
    console.log('✅ E2Eテストのセットアップが完了しました');
  } catch (error) {
    console.error('❌ E2Eテストのセットアップに失敗しました:', error);
    throw error;
  }
}

export default globalSetup;
