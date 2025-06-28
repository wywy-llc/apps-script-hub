import { render, screen } from '@testing-library/svelte';
import { readable } from 'svelte/store';
import { describe, expect, it, vi } from 'vitest';

// 検索結果ページの最低限のテスト
describe('SearchPage', () => {
  // 基本的なレンダリングテスト
  it('検索ページが正常にレンダリングされる', async () => {
    // $app/stores をモック
    vi.doMock('$app/stores', () => ({
      page: readable({
        url: {
          searchParams: {
            get: () => null,
          },
        },
      }),
    }));

    // 動的インポートでコンポーネントを読み込み
    const { default: SearchPage } = await import('./+page.svelte');
    const { container } = render(SearchPage);

    // 基本要素の確認（DOM存在確認）
    expect(
      container.querySelector('input[placeholder="GASライブラリを検索"]')
    ).toBeTruthy();
    expect(container.querySelector('h1')).toBeTruthy();
    // 検索クエリがない場合は「すべてのライブラリ」が表示される
    expect(screen.getByText(/すべてのライブラリ/)).toBeDefined();
  });

  // 検索フォームの存在確認
  it('検索フォームが表示される', async () => {
    vi.doMock('$app/stores', () => ({
      page: readable({
        url: {
          searchParams: {
            get: () => null,
          },
        },
      }),
    }));

    const { default: SearchPage } = await import('./+page.svelte');
    const { container } = render(SearchPage);

    // フォーム要素の確認
    const searchForm = container.querySelector('form');
    const searchInput = container.querySelector('input[type="search"]');

    expect(searchForm).toBeTruthy();
    expect(searchInput).toBeTruthy();
    expect(searchInput?.getAttribute('placeholder')).toBe(
      'GASライブラリを検索'
    );
  });

  // コンポーネントの基本構造確認
  it('検索ページの基本構造が存在する', async () => {
    vi.doMock('$app/stores', () => ({
      page: readable({
        url: {
          searchParams: {
            get: () => null,
          },
        },
      }),
    }));

    const { default: SearchPage } = await import('./+page.svelte');
    const { container } = render(SearchPage);

    // コンテナとフォームの存在確認
    expect(container.querySelector('.container')).toBeTruthy();
    expect(container.querySelector('form')).toBeTruthy();
    expect(container.querySelector('h1')).toBeTruthy();

    // 検索アイコンの存在確認
    expect(container.querySelector('svg')).toBeTruthy();
  });
});
