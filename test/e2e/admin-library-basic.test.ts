import { expect, test } from '@playwright/test';
import { clearTestDataBeforeTest } from './test-utils.js';

test.describe('Admin Screen - Library Functions (Basic)', () => {
  test('今回のケース: googleworkspace/apps-script-oauth2の登録テスト', async ({ page }) => {
    await clearTestDataBeforeTest();
    // 実際に報告されたケースと同じデータでテスト
    const testData = {
      scriptId: '1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF',
      repoUrl: 'googleworkspace/apps-script-oauth2',
      expectedName: 'apps-script-oauth2',
      expectedAuthor: 'googleworkspace',
      expectedDescription: 'An OAuth2 library for Google Apps Script.',
    };

    // 1. 新規ライブラリ追加ページにアクセス
    await page.goto('/admin/libraries/new');

    // 2. 実際のデータでフォーム入力
    await page.fill('input[name="scriptId"]', testData.scriptId);
    await page.fill('input[name="repoUrl"]', testData.repoUrl);

    // 3. フォーム送信
    await page.click('button[type="submit"]');

    // 4. 成功メッセージの確認
    await expect(page.locator('text=Library has been successfully registered')).toBeVisible({
      timeout: 10000,
    });

    // 5. 詳細ページへのリダイレクトを待機
    await page.waitForURL(/\/admin\/libraries\/[^/]+$/, { timeout: 15000 });

    // 6. 詳細ページの重要な情報を確認
    // ライブラリ名
    await expect(page.locator('h1:has-text("Library Details")')).toBeVisible();
    await expect(
      page.locator('dd').filter({ hasText: testData.expectedName }).first()
    ).toBeVisible();

    // GAS スクリプトID（長いIDなので部分一致で確認）
    await expect(page.locator(`text=${testData.scriptId.substring(0, 20)}`).first()).toBeVisible();

    // GitHub情報
    await expect(page.locator(`text=${testData.expectedAuthor}`).first()).toBeVisible();
    await expect(page.locator(`text=${testData.expectedDescription}`).first()).toBeVisible();

    // ステータス（ヘッダー部分のみ）
    await expect(
      page.locator('h1:has-text("Library Details") + div span.bg-gray-100:has-text("未公開")')
    ).toBeVisible();

    // 7. ライブラリ詳細情報が正常に表示されているか確認
    await expect(page.locator('h2:has-text("概要")')).toBeVisible();

    // 8. 管理者機能ボタンの確認
    await expect(page.locator('button:has-text("Execute Scraping")')).toBeVisible();
    await expect(page.locator('button:has-text("Edit")')).toBeVisible();
    await expect(page.locator('button.bg-green-600:has-text("Publish")')).toBeVisible();
  });

  test('簡単なケース: googleworkspace/apps-script-oauth2の登録テスト', async ({ page }) => {
    await clearTestDataBeforeTest();
    const testData = {
      scriptId: '1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF',
      repoUrl: 'googleworkspace/apps-script-oauth2',
    };

    await page.goto('/admin/libraries/new');
    await page.fill('input[name="scriptId"]', testData.scriptId);
    await page.fill('input[name="repoUrl"]', testData.repoUrl);
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Library has been successfully registered')).toBeVisible({
      timeout: 10000,
    });
    await page.waitForURL(/\/admin\/libraries\/[^/]+$/, { timeout: 15000 });

    // apps-script-oauth2ライブラリの基本情報確認
    await expect(
      page.locator('dd').filter({ hasText: 'apps-script-oauth2' }).first()
    ).toBeVisible();
    await expect(page.locator('text=googleworkspace').first()).toBeVisible();
    await expect(
      page.locator('h1:has-text("Library Details") + div span.bg-gray-100:has-text("未公開")')
    ).toBeVisible();
  });

  test('管理者トップページのリダイレクト確認', async ({ page }) => {
    await clearTestDataBeforeTest();
    // /admin にアクセス
    await page.goto('/admin');

    // /admin/libraries にリダイレクトされることを確認
    await expect(page).toHaveURL('/admin/libraries');
  });
});
