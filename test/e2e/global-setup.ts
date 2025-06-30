import { clearTestData } from '../scripts/clear-test-data.js';

async function globalSetup() {
  console.log('🔧 E2Eテスト前のセットアップを開始...');

  try {
    // E2Eテスト環境変数を設定（OpenAI API モックを有効化）
    process.env.PLAYWRIGHT_TEST_MODE = 'true';
    process.env.OPENAI_API_KEY = 'mock-api-key-for-e2e-testing';

    console.log('🤖 E2EテストモードでOpenAI APIモックを有効化しました');

    // テストデータをクリア
    await clearTestData();
    console.log('✅ E2Eテストのセットアップが完了しました');
  } catch (error) {
    console.error('❌ E2Eテストのセットアップに失敗しました:', error);
    throw error;
  }
}

export default globalSetup;
