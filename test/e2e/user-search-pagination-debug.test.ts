import { expect, test } from '@playwright/test';
import { clearTestDataBeforeTest } from './test-utils.js';
import { DatabaseLibraryDataFactory } from '../factories/index.js';

test.describe('ユーザー検索ページネーション - デバッグ', () => {
  test.beforeEach(async () => {
    await clearTestDataBeforeTest();
  });

  test('page=2から次へボタンの詳細確認', async ({ page }) => {
    // 30個のライブラリを作成（3ページ分）
    for (let i = 1; i <= 30; i++) {
      await DatabaseLibraryDataFactory.create({
        name: `Test Library ${i}`,
        scriptId: `1TestScript${i.toString().padStart(50, '0')}`,
        repositoryUrl: `https://github.com/test/library${i}`,
        authorName: 'Test Author',
        authorUrl: 'https://github.com/test',
        status: 'published',
      });
    }

    // 2ページ目に直接アクセス
    await page.goto('/user/search?page=2');

    // 2ページ目であることを確認
    await expect(page).toHaveURL('/user/search?page=2');
    await expect(page.locator('h1')).toContainText('All libraries (30 items)');

    // 「次へ」ボタンの存在確認
    const nextButton = page.locator('a[aria-label="次のページへ"]');
    await expect(nextButton).toBeVisible();

    // 「次へ」ボタンのhref属性を確認
    const href = await nextButton.getAttribute('href');
    console.log('Next button href:', href);

    // 「次へ」ボタンをクリック
    await nextButton.click();

    // 3ページ目に遷移することを確認
    await expect(page).toHaveURL('/user/search?page=3');
    await expect(page.locator('h1')).toContainText('All libraries (30 items)');

    // 3ページ目の内容確認（残り10件）
    const libraryCards = page.locator('article');
    await expect(libraryCards).toHaveCount(10);
  });

  test('検索クエリ付きでpage=2から次へボタンの確認', async ({ page }) => {
    // 検索にヒットするライブラリを30個作成
    for (let i = 1; i <= 30; i++) {
      await DatabaseLibraryDataFactory.create({
        name: `Logger Library ${i}`,
        scriptId: `1LoggerScript${i.toString().padStart(50, '0')}`,
        repositoryUrl: `https://github.com/test/logger${i}`,
        authorName: 'Logger Author',
        authorUrl: 'https://github.com/logger',
        status: 'published',
      });
    }

    // 検索クエリ付きで2ページ目に直接アクセス
    await page.goto('/user/search?q=Logger&page=2');

    // 2ページ目であることを確認
    await expect(page).toHaveURL('/user/search?q=Logger&page=2');
    await expect(page.locator('h1')).toContainText('Search results for "Logger": 30 items');

    // 「次へ」ボタンの存在確認
    const nextButton = page.locator('a[aria-label="次のページへ"]');
    await expect(nextButton).toBeVisible();

    // 「次へ」ボタンのhref属性を確認
    const href = await nextButton.getAttribute('href');
    console.log('Next button href with search query:', href);

    // 「次へ」ボタンをクリック
    await nextButton.click();

    // 3ページ目に遷移することを確認
    await expect(page).toHaveURL('/user/search?q=Logger&page=3');
    await expect(page.locator('h1')).toContainText('Search results for "Logger": 30 items');
  });
});
