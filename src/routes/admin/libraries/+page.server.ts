import { db } from '$lib/server/db';
import { library } from '$lib/server/db/schema';
import {
  BulkGASLibrarySearchService,
  type LibrarySaveCallback,
} from '$lib/server/services/bulk-gas-library-search-service.js';
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

      // パラメータの基本検証
      if (!startPageStr?.trim() || !endPageStr?.trim() || !perPageStr?.trim()) {
        return fail(400, { error: 'ページ範囲の設定が不正です。' });
      }

      const startPage = parseInt(startPageStr, 10);
      const endPage = parseInt(endPageStr, 10);
      const perPage = parseInt(perPageStr, 10);

      // 数値範囲の検証
      if (isNaN(startPage) || isNaN(endPage) || isNaN(perPage)) {
        return fail(400, { error: 'ページ範囲の値が不正です。' });
      }

      if (startPage < 1 || startPage > 10) {
        return fail(400, { error: '開始ページは1から10の間で入力してください。' });
      }

      if (endPage < 1 || endPage > 10) {
        return fail(400, { error: '終了ページは1から10の間で入力してください。' });
      }

      if (startPage > endPage) {
        return fail(400, { error: '開始ページは終了ページ以下である必要があります。' });
      }

      if (![10, 25, 50, 100].includes(perPage)) {
        return fail(400, {
          error: '1ページあたりの件数は10, 25, 50, 100のいずれかを選択してください。',
        });
      }

      // 総検索件数の計算と制限チェック
      const totalResults = (endPage - startPage + 1) * perPage;
      if (totalResults > 1000) {
        return fail(400, {
          error: '検索総件数が1000件を超えています。ページ範囲を調整してください。',
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
      const saveCallback: LibrarySaveCallback = async libraryData => {
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
              readmeContent: libraryData.readmeContent || '',
              licenseType: libraryData.licenseType || 'unknown',
              licenseUrl: libraryData.licenseUrl || 'unknown',
              starCount: libraryData.starCount || 0,
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

      // GASタグによる一括スクレイピング実行（ページごとにDB保存）
      const result = await BulkGASLibrarySearchService.callWithPageRangeAndSave(
        startPage,
        endPage,
        perPage,
        duplicateChecker,
        saveCallback
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
};
