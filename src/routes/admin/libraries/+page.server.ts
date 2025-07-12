import { createAppUrl, PAGINATION } from '$lib/constants/app-config';
import {
  GITHUB_SEARCH_SORT_OPTIONS,
  type GitHubSearchSortOption,
} from '$lib/constants/github-search';
import { db } from '$lib/server/db';
import { library, librarySummary, user } from '$lib/server/db/schema';
import { generateAuthHeader } from '$lib/server/utils/api-auth.js';
import { ActionErrorHandler } from '$lib/server/utils/action-error-handler.js';
import type { BulkRegisterResponse } from '$lib/types/index.js';
import { fail } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load = (async () => {
  // ライブラリ一覧をデータベースから取得（申請者情報も含む）
  const libraries = await db
    .select({
      id: library.id,
      name: library.name,
      scriptId: library.scriptId,
      authorName: library.authorName,
      authorUrl: library.authorUrl,
      status: library.status,
      scriptType: library.scriptType,
      updatedAt: library.updatedAt,
      starCount: library.starCount,
      description: library.description,
      lastCommitAt: library.lastCommitAt,
      requesterId: library.requesterId,
      requestNote: library.requestNote,
      requesterName: user.name,
      requesterEmail: user.email,
    })
    .from(library)
    .leftJoin(user, eq(library.requesterId, user.id))
    .orderBy(desc(library.updatedAt));

  return {
    libraries,
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  /**
   * GASタグによる自動検索・一括新規追加アクション
   * - `/api/libraries/bulk-register`
   */
  bulkAddByTags: async ({ request, fetch }) => {
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

      const apiUrl = createAppUrl('/api/libraries/bulk-register');
      const apiRequest = {
        startPage,
        endPage,
        perPage,
        sortOption,
        tags: selectedTags,
        generateSummary: true,
      };

      console.log(`管理画面から一括登録API呼び出し: ${apiUrl}`, apiRequest);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: generateAuthHeader(),
        },
        body: JSON.stringify(apiRequest),
      });

      console.log(`API呼び出し結果: status=${response.status}, ok=${response.ok}`);

      if (!response.ok) {
        let errorData;
        let responseText = '';

        try {
          responseText = await response.text();
          errorData = JSON.parse(responseText);
        } catch (parseError) {
          console.error('APIレスポンスのパースに失敗:', parseError);
          console.error('レスポンステキスト:', responseText);
          errorData = { message: `API呼び出しエラー: ${response.status} ${response.statusText}` };
        }

        const errorMessage =
          errorData.message || `API呼び出しエラー: ${response.status} ${response.statusText}`;
        console.error('API呼び出しエラー詳細:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          responseText: responseText.substring(0, 500), // 最初の500文字のみログ
        });

        throw new Error(errorMessage);
      }

      const result: BulkRegisterResponse = await response.json();

      if (!result.success) {
        // API レスポンスのエラーステータスを確認
        const errorStatus = response.status || 500;

        // エラーメッセージを構築（メインメッセージ + 詳細エラー）
        let errorMessage = result.message || 'API実行に失敗しました。';
        if (result.errors && result.errors.length > 0) {
          errorMessage += ` 詳細: ${result.errors.join(', ')}`;
        }

        return fail(errorStatus, {
          error: errorMessage,
        });
      }

      // 結果メッセージの生成
      const messages = [
        `自動検索・処理完了: ${result.summary.total}件のリポジトリ中 ${result.summary.successCount}件を登録しました。`,
      ];

      if (result.summary.errorCount > 0) {
        messages.push(`エラー: ${result.summary.errorCount}件`);
      }

      if (result.summary.duplicateCount > 0) {
        messages.push(`重複スキップ: ${result.summary.duplicateCount}件`);
      }

      return {
        success: true,
        message: messages.join(' '),
        details: {
          total: result.summary.total,
          inserted: result.summary.successCount,
          errors: result.summary.errorCount,
          duplicates: result.summary.duplicateCount,
          apiResponse: result,
        },
      };
    } catch (error) {
      return ActionErrorHandler.handleActionError(
        error,
        '自動検索・一括追加処理',
        '自動検索・一括追加エラー:'
      );
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
      return ActionErrorHandler.handleActionError(
        error,
        'ライブラリの削除処理',
        'ライブラリ削除エラー:'
      );
    }
  },
};
