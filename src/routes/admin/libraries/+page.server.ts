import { db } from '$lib/server/db';
import { library } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { BulkGASLibrarySearchService } from '$lib/server/services/bulk-gas-library-search-service.js';
import type { PageServerLoad, Actions } from './$types';

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
      const maxResultsStr = formData.get('maxResults') as string;

      if (!maxResultsStr?.trim()) {
        return fail(400, { error: '検索数を入力してください。' });
      }

      const maxResults = parseInt(maxResultsStr, 10);

      if (isNaN(maxResults) || maxResults < 1 || maxResults > 100) {
        return fail(400, { error: '検索数は1から100の間で入力してください。' });
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

      // GASタグによる一括スクレイピング実行
      const result = await BulkGASLibrarySearchService.call(maxResults, duplicateChecker);

      // 成功したデータをデータベースに保存
      const insertedLibraries = [];
      for (const scrapeResult of result.results) {
        if (scrapeResult.success && scrapeResult.data) {
          try {
            const [inserted] = await db
              .insert(library)
              .values({
                id: crypto.randomUUID(),
                name: scrapeResult.data.name,
                scriptId: scrapeResult.data.scriptId,
                repositoryUrl: scrapeResult.data.repositoryUrl,
                authorUrl: scrapeResult.data.authorUrl,
                authorName: scrapeResult.data.authorName,
                description: scrapeResult.data.description,
                readmeContent: scrapeResult.data.readmeContent || '',
                licenseType: scrapeResult.data.licenseType || 'unknown',
                licenseUrl: scrapeResult.data.licenseUrl || 'unknown',
                starCount: scrapeResult.data.starCount || 0,
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date(),
              })
              .returning({ id: library.id });

            insertedLibraries.push(inserted);
          } catch (error) {
            console.error('データベース挿入エラー:', error);
          }
        }
      }

      // 結果メッセージの生成
      const messages = [
        `自動検索・処理完了: ${result.total}件のリポジトリ中 ${insertedLibraries.length}件を登録しました。`,
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
          inserted: insertedLibraries.length,
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
