import { PAGINATION } from '$lib/constants/app-config';
import {
  GITHUB_SEARCH_SORT_OPTIONS,
  type GitHubSearchSortOption,
} from '$lib/constants/github-search';
import { DEFAULT_SCRAPER_CONFIG } from '$lib/constants/scraper-config';
import { db } from '$lib/server/db';
import { library, librarySummary } from '$lib/server/db/schema';
import {
  ProcessBulkGASLibraryWithSaveService,
  type LibrarySaveWithSummaryCallback,
} from '$lib/server/services/process-bulk-gas-library-with-save-service.js';
import { fail } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load = (async () => {
  // ライブラリ一覧をデータベースから取得
  const libraries = await db
    .select({
      id: library.id,
      name: library.name,
      scriptId: library.scriptId,
      authorName: library.authorName,
      authorUrl: library.authorUrl,
      status: library.status,
      updatedAt: library.updatedAt,
      starCount: library.starCount,
      description: library.description,
      lastCommitAt: library.lastCommitAt,
    })
    .from(library)
    .orderBy(desc(library.updatedAt));

  return {
    libraries,
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  /**
   * GASタグによる自動検索・一括新規追加アクション
   * GitHubのGASタグを持つリポジトリを自動検索してライブラリ情報をスクレイピング・一括登録
   */
  bulkAddByTags: async ({ request }) => {
    try {
      const formData = await request.formData();
      const startPageStr = formData.get('startPage') as string;
      const endPageStr = formData.get('endPage') as string;
      const perPageStr = formData.get('perPage') as string;
      const sortOptionStr = formData.get('sortOption') as string;
      const selectedTags = formData.getAll('selectedTags') as string[];

      // パラメータの基本検証
      if (
        !startPageStr?.trim() ||
        !endPageStr?.trim() ||
        !perPageStr?.trim() ||
        !sortOptionStr?.trim() ||
        !selectedTags?.length
      ) {
        return fail(400, { error: 'ページ範囲またはタグの設定が不正です。' });
      }

      const startPage = parseInt(startPageStr, 10);
      const endPage = parseInt(endPageStr, 10);
      const perPage = parseInt(perPageStr, 10);
      const sortOption = sortOptionStr as GitHubSearchSortOption;

      // 数値範囲の検証
      if (isNaN(startPage) || isNaN(endPage) || isNaN(perPage)) {
        return fail(400, { error: 'ページ範囲の値が不正です。' });
      }

      if (startPage < PAGINATION.MIN_PAGE || startPage > PAGINATION.MAX_PAGE) {
        return fail(400, {
          error: `開始ページは${PAGINATION.MIN_PAGE}から${PAGINATION.MAX_PAGE}の間で入力してください。`,
        });
      }

      if (endPage < PAGINATION.MIN_PAGE || endPage > PAGINATION.MAX_PAGE) {
        return fail(400, {
          error: `終了ページは${PAGINATION.MIN_PAGE}から${PAGINATION.MAX_PAGE}の間で入力してください。`,
        });
      }

      if (startPage > endPage) {
        return fail(400, { error: '開始ページは終了ページ以下である必要があります。' });
      }

      if (!(PAGINATION.PER_PAGE_OPTIONS as readonly number[]).includes(perPage)) {
        return fail(400, {
          error: `1ページあたりの件数は${PAGINATION.PER_PAGE_OPTIONS.join(', ')}のいずれかを選択してください。`,
        });
      }

      // 並び順の検証
      if (!GITHUB_SEARCH_SORT_OPTIONS[sortOption]) {
        return fail(400, {
          error: '並び順の設定が不正です。',
        });
      }

      // 総検索件数の計算と制限チェック
      const totalResults = (endPage - startPage + 1) * perPage;
      if (totalResults > PAGINATION.MAX_TOTAL_RESULTS) {
        return fail(400, {
          error: `検索総件数が${PAGINATION.MAX_TOTAL_RESULTS}件を超えています。ページ範囲を調整してください。`,
        });
      }

      // 重複チェック関数
      const duplicateChecker = async (scriptId: string): Promise<boolean> => {
        const existing = await db
          .select({ id: library.id })
          .from(library)
          .where(eq(library.scriptId, scriptId))
          .limit(1);
        return existing.length > 0;
      };

      // ライブラリ保存コールバック関数（ページごとにDB保存）
      const saveCallback: LibrarySaveWithSummaryCallback = async (
        libraryData,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _generateSummary
      ) => {
        try {
          const [inserted] = await db
            .insert(library)
            .values({
              id: crypto.randomUUID(),
              name: libraryData.name,
              scriptId: libraryData.scriptId,
              repositoryUrl: libraryData.repositoryUrl,
              authorUrl: libraryData.authorUrl,
              authorName: libraryData.authorName,
              description: libraryData.description,
              licenseType: libraryData.licenseType || 'unknown',
              licenseUrl: libraryData.licenseUrl || 'unknown',
              starCount: libraryData.starCount || 0,
              copyCount: 0,
              lastCommitAt: libraryData.lastCommitAt,
              status: 'pending',
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .returning({ id: library.id });

          return { success: true, id: inserted.id };
        } catch (error) {
          console.error('データベース挿入エラー:', error);
          return {
            success: false,
            error: error instanceof Error ? error.message : '不明なエラー',
          };
        }
      };

      // カスタムスクレイパー設定（選択されたタグのみ使用）
      const customConfig = {
        ...DEFAULT_SCRAPER_CONFIG,
        gasTags: selectedTags,
      };

      // GASタグによる一括スクレイピング実行（ページごとにDB保存 + AI要約生成）
      const result = await ProcessBulkGASLibraryWithSaveService.call(
        startPage,
        endPage,
        perPage,
        duplicateChecker,
        saveCallback,
        sortOption,
        true, // generateSummary
        customConfig
      );

      // 結果メッセージの生成
      const messages = [
        `自動検索・処理完了: ${result.total}件のリポジトリ中 ${result.successCount}件を登録しました。`,
      ];

      if (result.errorCount > 0) {
        messages.push(`エラー: ${result.errorCount}件`);
      }

      if (result.duplicateCount > 0) {
        messages.push(`重複スキップ: ${result.duplicateCount}件`);
      }

      return {
        success: true,
        message: messages.join(' '),
        details: {
          total: result.total,
          inserted: result.successCount,
          errors: result.errorCount,
          duplicates: result.duplicateCount,
          results: result.results,
        },
      };
    } catch (error) {
      console.error('自動検索・一括追加エラー:', error);
      return fail(500, {
        error: '自動検索・一括追加処理中にエラーが発生しました。',
      });
    }
  },

  /**
   * ライブラリ削除アクション
   * ライブラリとその関連する要約データを削除
   */
  delete: async ({ request }) => {
    try {
      const formData = await request.formData();
      const libraryId = formData.get('libraryId') as string;

      // パラメータの基本検証
      if (!libraryId?.trim()) {
        return fail(400, { error: 'ライブラリIDが指定されていません。' });
      }

      // ライブラリの存在確認
      const existingLibrary = await db
        .select({ id: library.id, name: library.name })
        .from(library)
        .where(eq(library.id, libraryId))
        .limit(1);

      if (existingLibrary.length === 0) {
        return fail(404, { error: '指定されたライブラリが見つかりません。' });
      }

      // トランザクションで関連データを削除
      await db.transaction(async tx => {
        // 1. 関連するライブラリ要約を削除
        await tx.delete(librarySummary).where(eq(librarySummary.libraryId, libraryId));

        // 2. ライブラリ本体を削除
        await tx.delete(library).where(eq(library.id, libraryId));
      });

      return {
        success: true,
        message: `ライブラリ「${existingLibrary[0].name}」を削除しました。`,
      };
    } catch (error) {
      console.error('ライブラリ削除エラー:', error);
      return fail(500, {
        error: 'ライブラリの削除処理中にエラーが発生しました。',
      });
    }
  },
};
