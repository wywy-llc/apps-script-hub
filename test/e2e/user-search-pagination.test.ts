import { expect, test } from '@playwright/test';
import { clearTestDataBeforeTest } from './test-utils.js';
import { DatabaseLibraryDataFactory } from '../factories/index.js';

test.describe('ユーザー検索ページネーション機能', () => {
  test.beforeEach(async () => {
    await clearTestDataBeforeTest();
  });

  test('ページネーション基本動作テスト', async ({ page }) => {
    // 複数のライブラリを作成（15個作成してページネーションをテスト）
    for (let i = 1; i <= 15; i++) {
      await DatabaseLibraryDataFactory.create({
        name: `Test Library ${i}`,
        scriptId: `1TestScript${i.toString().padStart(50, '0')}`,
        repositoryUrl: `https://github.com/test/library${i}`,
        authorName: 'Test Author',
        authorUrl: 'https://github.com/test',
        status: 'published',
      });
    }

    // 検索ページにアクセス
    await page.goto('/user/search');

    // 1ページ目の表示確認
    await expect(page.locator('h1')).toContainText('All libraries (15 items)');

    // 1ページ目には10件表示されることを確認
    const libraryCards = page.locator('article');
    await expect(libraryCards).toHaveCount(10);

    // 「次へ」ボタンが表示されることを確認
    const nextButton = page.locator('a[aria-label="次のページへ"]');
    await expect(nextButton).toBeVisible();

    // 「次へ」ボタンをクリック
    await nextButton.click();

    // 2ページ目に遷移することを確認
    await expect(page).toHaveURL('/user/search?page=2');

    // 2ページ目の内容確認
    await expect(page.locator('h1')).toContainText('All libraries (15 items)');

    // 2ページ目には残り5件が表示されることを確認
    await expect(libraryCards).toHaveCount(5);

    // 「前へ」ボタンが表示されることを確認
    const prevButton = page.locator('a[aria-label="前のページへ"]');
    await expect(prevButton).toBeVisible();

    // 「前へ」ボタンをクリック
    await prevButton.click();

    // 1ページ目に戻ることを確認
    await expect(page).toHaveURL('/user/search');
    await expect(libraryCards).toHaveCount(10);
  });

  test('検索クエリ付きページネーション', async ({ page }) => {
    // テスト用ライブラリを作成
    for (let i = 1; i <= 15; i++) {
      await DatabaseLibraryDataFactory.create({
        name: `Logger Library ${i}`,
        scriptId: `1LoggerScript${i.toString().padStart(50, '0')}`,
        repositoryUrl: `https://github.com/test/logger${i}`,
        authorName: 'Logger Author',
        authorUrl: 'https://github.com/logger',
        status: 'published',
      });
    }

    // 検索クエリでアクセス
    await page.goto('/user/search?q=Logger');

    // 検索結果の確認
    await expect(page.locator('h1')).toContainText('Search results for "Logger": 15 items');

    // 「次へ」ボタンをクリック
    const nextButton = page.locator('a[aria-label="次のページへ"]');
    await nextButton.click();

    // 2ページ目のURLに検索クエリが保持されることを確認
    await expect(page).toHaveURL('/user/search?q=Logger&page=2');

    // 検索結果のヘッダーが維持されることを確認
    await expect(page.locator('h1')).toContainText('Search results for "Logger": 15 items');
  });

  test('スクリプトタイプフィルター付きページネーション', async ({ page }) => {
    // ライブラリタイプとWebアプリタイプのテストデータを作成
    for (let i = 1; i <= 15; i++) {
      await DatabaseLibraryDataFactory.create({
        name: `Library ${i}`,
        scriptId: `1LibraryScript${i.toString().padStart(50, '0')}`,
        repositoryUrl: `https://github.com/test/lib${i}`,
        authorName: 'Test Author',
        authorUrl: 'https://github.com/test',
        status: 'published',
        scriptType: 'library',
      });
    }

    // スクリプトタイプフィルターでアクセス
    await page.goto('/user/search?scriptType=library');

    // フィルター結果の確認
    await expect(page.locator('h1')).toContainText('All libraries (15 items)');

    // 「次へ」ボタンをクリック
    const nextButton = page.locator('a[aria-label="次のページへ"]');
    await nextButton.click();

    // 2ページ目のURLにスクリプトタイプフィルターが保持されることを確認
    await expect(page).toHaveURL('/user/search?scriptType=library&page=2');
  });

  test('ページ番号直接クリック', async ({ page }) => {
    // 複数のライブラリを作成
    for (let i = 1; i <= 25; i++) {
      await DatabaseLibraryDataFactory.create({
        name: `Test Library ${i}`,
        scriptId: `1TestScript${i.toString().padStart(50, '0')}`,
        repositoryUrl: `https://github.com/test/library${i}`,
        authorName: 'Test Author',
        authorUrl: 'https://github.com/test',
        status: 'published',
      });
    }

    // 検索ページにアクセス
    await page.goto('/user/search');

    // ページ番号リンクが表示されることを確認
    const page2Link = page.locator('a[aria-label="ページ 2 へ"]');
    await expect(page2Link).toBeVisible();

    // ページ2をクリック
    await page2Link.click();

    // 2ページ目に遷移することを確認
    await expect(page).toHaveURL('/user/search?page=2');

    // ページ3をクリック
    const page3Link = page.locator('a[aria-label="ページ 3 へ"]');
    await expect(page3Link).toBeVisible();
    await page3Link.click();

    // 3ページ目に遷移することを確認
    await expect(page).toHaveURL('/user/search?page=3');
  });
});
