import { expect, test } from '@playwright/test';
import { clearTestDataBeforeTest } from './test-utils.js';

test.describe('ユーザー検索機能', () => {
  test.beforeEach(async () => {
    await clearTestDataBeforeTest();
  });

  test('検索ページが正常に表示される', async ({ page }) => {
    // 検索ページにアクセス
    await page.goto('/user/search');

    // ページが正常に読み込まれることを確認（多言語対応）
    await expect(page.locator('h1')).toContainText('All libraries');

    // 検索ボックスが表示されることを確認
    await expect(page.locator('input[name="q"]')).toBeVisible();

    // ライブラリがない場合の表示確認（初期状態）
    await expect(page.locator('text=0 items')).toBeVisible();
  });

  test('キーワード検索の表示確認', async ({ page }) => {
    // 検索ページでキーワード検索
    await page.goto('/user/search?q=Logger');

    // 検索結果ページが表示されることを確認（多言語対応）
    await expect(page.locator('h1')).toContainText('Search results for "Logger"');

    // 検索結果が0件の場合のメッセージ確認
    await expect(page.locator('text=0 items')).toBeVisible();
  });

  test('検索結果がない場合の表示', async ({ page }) => {
    // 存在しないキーワードで検索
    await page.goto('/user/search?q=存在しないライブラリ');

    // 検索結果ページが表示されることを確認（多言語対応）
    await expect(page.locator('h1')).toContainText(
      'Search results for "存在しないライブラリ": 0 items'
    );

    // 検索結果がない場合のメッセージが表示されることを確認（多言語対応）
    await expect(page.locator('text=No search results found')).toBeVisible();
    await expect(page.locator('text=Please try different keywords.')).toBeVisible();
  });

  test('検索ボックスから検索実行ができる', async ({ page }) => {
    // 検索ページにアクセス
    await page.goto('/user/search');

    // 検索ボックスにキーワードを入力
    await page.fill('input[name="q"]', 'Logger');

    // 検索フォームを送信
    await page.press('input[name="q"]', 'Enter');

    // 検索結果ページに遷移することを確認
    await expect(page).toHaveURL('/user/search?q=Logger');
    await expect(page.locator('h1')).toContainText('Search results for "Logger"');
  });

  test('空の検索から全ライブラリ表示への遷移', async ({ page }) => {
    // 空の検索クエリでアクセス
    await page.goto('/user/search?q=');

    // 全ライブラリ表示になることを確認（多言語対応）
    await expect(page.locator('h1')).toContainText('All libraries');
  });
});
