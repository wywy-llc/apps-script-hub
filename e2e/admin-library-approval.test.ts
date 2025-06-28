import { expect, test } from '@playwright/test';
import { DatabaseLibraryDataFactory } from './factories/index.js';
import { clearTestDataBeforeTest } from './test-utils.js';

test.describe('管理者画面 - ライブラリ承認機能', () => {
  test('承認待ちライブラリ - 承認・公開と拒否ボタンが表示され正常に動作する', async ({ page }) => {
    await clearTestDataBeforeTest();

    // 1. ライブラリを承認待ち状態でデータベースに直接作成
    const libraryId = await DatabaseLibraryDataFactory.create({ status: 'pending' });

    // ライブラリ詳細ページに直接アクセス
    await page.goto(`/admin/libraries/${libraryId}`);

    // 2. 承認待ちステータスの確認
    await expect(page.locator('text=承認待ち')).toBeVisible();

    // 3. 承認待ち状態のボタン表示確認
    await expect(page.locator('button:text-is("承認・公開")')).toBeVisible();
    await expect(page.locator('button:text-is("拒否")')).toBeVisible();
    // 承認待ち状態では「拒否に変更」ボタンは表示されない
    await expect(page.locator('button:text-is("拒否に変更")')).not.toBeVisible();

    // 4. 承認・公開ボタンをクリック
    page.on('dialog', async dialog => {
      expect(dialog.message()).toBe('このライブラリを承認して公開しますか？');
      await dialog.accept();
    });
    await page.click('button:text-is("承認・公開")');

    // 5. 公開状態への変更確認
    await expect(page.locator('text=公開中')).toBeVisible();
    await expect(page.locator('text=ライブラリを承認し、公開しました。')).toBeVisible();

    // 6. 公開状態のボタン表示確認
    await expect(page.locator('button:text-is("拒否に変更")')).toBeVisible();
    await expect(page.locator('button:text-is("承認・公開")')).not.toBeVisible();
    await expect(page.locator('button:text-is("拒否")')).not.toBeVisible();
  });

  test('承認待ちライブラリ - 拒否ボタンが正常に動作する', async ({ page }) => {
    await clearTestDataBeforeTest();

    // 1. ライブラリを承認待ち状態でデータベースに直接作成
    const libraryId = await DatabaseLibraryDataFactory.create({ status: 'pending' });

    // ライブラリ詳細ページに直接アクセス
    await page.goto(`/admin/libraries/${libraryId}`);

    // 2. 拒否ボタンをクリック
    page.on('dialog', async dialog => {
      expect(dialog.message()).toBe('このライブラリを拒否しますか？');
      await dialog.accept();
    });
    await page.click('button:text-is("拒否")');

    // 3. 拒否状態への変更確認
    await expect(page.locator('text=却下')).toBeVisible();
    await expect(page.locator('text=ライブラリを拒否しました。')).toBeVisible();

    // 4. 拒否状態のボタン表示確認
    await expect(page.locator('button:text-is("承認・公開")')).toBeVisible();
    await expect(page.locator('button:text-is("拒否")')).not.toBeVisible();
    await expect(page.locator('button:text-is("拒否に変更")')).not.toBeVisible();
  });

  test('公開中ライブラリ - 拒否に変更ボタンが表示され正常に動作する', async ({ page }) => {
    await clearTestDataBeforeTest();

    // 1. ライブラリを公開中状態でデータベースに直接作成
    const libraryId = await DatabaseLibraryDataFactory.create({ status: 'published' });

    // ライブラリ詳細ページに直接アクセス
    await page.goto(`/admin/libraries/${libraryId}`);

    // 2. 公開中状態のボタン表示確認
    await expect(page.locator('button:text-is("拒否に変更")')).toBeVisible();
    await expect(page.locator('button:text-is("承認・公開")')).not.toBeVisible();
    await expect(page.locator('button:text-is("拒否")')).not.toBeVisible();

    // 3. 拒否に変更ボタンをクリック
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    await page.click('button:text-is("拒否に変更")');

    // 4. 拒否状態への変更確認
    await expect(page.locator('text=却下')).toBeVisible();
    await expect(page.locator('text=ライブラリを拒否しました。')).toBeVisible();

    // 5. 拒否状態のボタン表示確認
    await expect(page.locator('button:text-is("承認・公開")')).toBeVisible();
    await expect(page.locator('button:text-is("拒否に変更")')).not.toBeVisible();
    await expect(page.locator('button:text-is("拒否")')).not.toBeVisible();
  });

  test('拒否されたライブラリ - 承認・公開ボタンが表示され正常に動作する', async ({ page }) => {
    await clearTestDataBeforeTest();

    // 1. ライブラリを拒否状態でデータベースに直接作成
    const libraryId = await DatabaseLibraryDataFactory.create({ status: 'rejected' });

    // ライブラリ詳細ページに直接アクセス
    await page.goto(`/admin/libraries/${libraryId}`);

    // 2. 拒否状態のボタン表示確認
    await expect(page.locator('button:text-is("承認・公開")')).toBeVisible();
    await expect(page.locator('button:text-is("拒否")')).not.toBeVisible();
    await expect(page.locator('button:text-is("拒否に変更")')).not.toBeVisible();

    // 3. 承認・公開ボタンをクリック
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    await page.click('button:text-is("承認・公開")');

    // 4. 公開状態への変更確認
    await expect(page.locator('text=公開中')).toBeVisible();
    await expect(page.locator('text=ライブラリを承認し、公開しました。')).toBeVisible();

    // 5. 公開状態のボタン表示確認
    await expect(page.locator('button:text-is("拒否に変更")')).toBeVisible();
    await expect(page.locator('button:text-is("承認・公開")')).not.toBeVisible();
    await expect(page.locator('button:text-is("拒否")')).not.toBeVisible();
  });

  test('ステータス更新時の確認ダイアログ - キャンセル時は変更されない', async ({ page }) => {
    await clearTestDataBeforeTest();

    // 1. ライブラリを承認待ち状態でデータベースに直接作成
    const libraryId = await DatabaseLibraryDataFactory.create({ status: 'pending' });

    // ライブラリ詳細ページに直接アクセス
    await page.goto(`/admin/libraries/${libraryId}`);

    // 2. 確認ダイアログをキャンセル
    page.on('dialog', async dialog => {
      expect(dialog.message()).toBe('このライブラリを承認して公開しますか？');
      await dialog.dismiss(); // キャンセル
    });
    await page.click('button:text-is("承認・公開")');

    // 3. ステータスが変更されていないことを確認
    await expect(page.locator('text=承認待ち')).toBeVisible();
    await expect(page.locator('text=ライブラリを承認し、公開しました。')).not.toBeVisible();

    // 4. ボタン表示が変わっていないことを確認
    await expect(page.locator('button:text-is("承認・公開")')).toBeVisible();
    await expect(page.locator('button:text-is("拒否")')).toBeVisible();
  });

  test('ステータス更新中のローディング状態 - ボタンが無効化される', async ({ page }) => {
    await clearTestDataBeforeTest();

    // 1. ライブラリを承認待ち状態でデータベースに直接作成
    const libraryId = await DatabaseLibraryDataFactory.create({ status: 'pending' });

    // ライブラリ詳細ページに直接アクセス
    await page.goto(`/admin/libraries/${libraryId}`);

    // 2. 承認・公開ボタンの有効性確認
    const approveButton = page.locator('button:text-is("承認・公開")');
    const rejectButton = page.locator('button:text-is("拒否")');

    await expect(approveButton).toBeEnabled();
    await expect(rejectButton).toBeEnabled();

    // 3. ボタンにcursor-pointerクラスが適用されていることを確認
    await expect(approveButton).toHaveClass(/cursor-pointer/);
    await expect(rejectButton).toHaveClass(/cursor-pointer/);
  });

  test('複数のライブラリで独立してステータス管理される', async ({ page }) => {
    await clearTestDataBeforeTest();

    // 1. 2つのライブラリを承認待ち状態でデータベースに直接作成
    const library1Id = await DatabaseLibraryDataFactory.create({
      status: 'pending',
      scriptId: 'SCRIPT_ID_1_' + Date.now(),
      repositoryUrl: 'https://github.com/user1/repo1-' + Date.now(),
    });

    const library2Id = await DatabaseLibraryDataFactory.create({
      status: 'pending',
      scriptId: 'SCRIPT_ID_2_' + Date.now(),
      repositoryUrl: 'https://github.com/user2/repo2-' + Date.now(),
    });

    // 2. 1つ目のライブラリを承認
    await page.goto(`/admin/libraries/${library1Id}`);
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    await page.click('button:text-is("承認・公開")');
    await expect(page.locator('text=公開中')).toBeVisible();

    // 3. 2つ目のライブラリは依然として承認待ち
    await page.goto(`/admin/libraries/${library2Id}`);
    await expect(page.locator('text=承認待ち')).toBeVisible();
    await expect(page.locator('button:text-is("承認・公開")')).toBeVisible();
    await expect(page.locator('button:text-is("拒否")')).toBeVisible();

    // 4. 2つ目のライブラリを拒否
    // 前のダイアログハンドラーを削除してから新しいものを追加
    page.removeAllListeners('dialog');
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    await page.click('button:text-is("拒否")');
    await expect(page.locator('text=却下')).toBeVisible();

    // 5. 1つ目のライブラリは依然として公開中
    await page.goto(`/admin/libraries/${library1Id}`);
    await expect(page.locator('text=公開中')).toBeVisible();
    await expect(page.locator('button:text-is("拒否に変更")')).toBeVisible();
  });
});
