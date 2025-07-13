import type { GitHubSearchSortOption } from '$lib/constants/github-search.js';
import {
  DEFAULT_SCRIPT_ID_PATTERNS,
  DEFAULT_WEB_APP_PATTERNS,
} from '$lib/constants/scraper-config.js';
import { db } from '$lib/server/db/index.js';
import { library } from '$lib/server/db/schema.js';
import { CreateLibraryService } from '$lib/server/services/create-library-service.js';
import { ProcessBulkGASLibraryWithSaveService } from '$lib/server/services/process-bulk-gas-library-with-save-service.js';
import { ActionErrorHandler } from '$lib/server/utils/action-error-handler.js';
import { validateApiAuth } from '$lib/server/utils/api-auth.js';
import { ErrorUtils } from '$lib/server/utils/error-utils.js';
import type { ScrapedLibraryData } from '$lib/types/github-scraper.js';
import type { BulkRegisterResponse } from '$lib/types/index.js';
import { json, type RequestHandler } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

/**
 * 汎用ライブラリ一括登録APIエンドポイント
 * cron実行と管理画面からの実行の両方に対応
 *
 * 使用例:
 *
 * POST /api/libraries/bulk-register
 * Authorization: Bearer YOUR_AUTH_SECRET
 * Content-Type: application/json
 *
 * {
 *   "tags": ["google-apps-script"],
 *   "maxPages": 3,
 *   "perPage": 10,
 *   "generateSummary": true
 * }
 *
 * 動作原理:
 * 1. 認証チェック（AUTH_SECRET認証）
 * 2. 指定されたタグでGitHub検索を実行
 * 3. 2年以内に更新されたリポジトリのみ対象
 * 4. 重複チェックを実行（Script IDベース）
 * 5. データベースに保存
 * 6. AI要約を生成
 *
 * crontab設定例:
 *
 * # 毎日午前2時に google-apps-script タグで一括登録
 * 0 2 * * * /usr/bin/curl -X POST http://localhost:5173/api/libraries/bulk-register -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_AUTH_SECRET" -d '{"tags":["google-apps-script"],"maxPages":3,"perPage":10,"generateSummary":true}' >> /var/log/gas-library-cron.log 2>&1
 *
 * # 毎日午前3時に google-sheets タグで一括登録
 * 0 3 * * * /usr/bin/curl -X POST http://localhost:5173/api/libraries/bulk-register -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_AUTH_SECRET" -d '{"tags":["google-sheets"],"maxPages":2,"perPage":10,"generateSummary":true}' >> /var/log/gas-library-cron.log 2>&1
 *
 * # 毎週日曜日午前4時に library タグで一括登録（週1回）
 * 0 4 * * 0 /usr/bin/curl -X POST http://localhost:5173/api/libraries/bulk-register -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_AUTH_SECRET" -d '{"tags":["library"],"maxPages":5,"perPage":15,"generateSummary":true}' >> /var/log/gas-library-cron.log 2>&1
 */

interface BulkRegisterRequest {
  // 必須パラメータ
  tags: string[];
  generateSummary?: boolean;

  // cron用パラメータ（シンプル）
  maxPages?: number;
  perPage?: number;

  // 管理画面用パラメータ（詳細設定）
  startPage?: number;
  endPage?: number;
  sortOption?: GitHubSearchSortOption;
}

/**
 * 汎用ライブラリ一括登録エンドポイント
 * cron実行と管理画面からの実行の両方に対応（AUTH_SECRET認証）
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    console.log('🚀 一括登録API呼び出し開始');

    // AUTH_SECRET認証チェック
    await validateApiAuth(request);
    console.log('✅ 認証成功');

    const body: BulkRegisterRequest = await request.json();
    console.log('📋 リクエストパラメータ:', JSON.stringify(body, null, 2));

    // パラメータ検証
    if (!body.tags || !Array.isArray(body.tags) || body.tags.length === 0) {
      return json(
        {
          success: false,
          message: 'tagsパラメータ（文字列配列）が必須です',
          summary: {
            total: 0,
            successCount: 0,
            errorCount: 1,
            duplicateCount: 0,
            tag: 'unknown',
          },
        } as BulkRegisterResponse,
        { status: 400 }
      );
    }

    // パラメータの正規化と検証
    const tags = body.tags;
    let startPage: number;
    let endPage: number;
    let perPage: number;
    let sortOption: GitHubSearchSortOption;
    let generateSummary: boolean;

    // その他のパラメータ設定
    if (body.startPage !== undefined && body.endPage !== undefined) {
      // 管理画面からの実行の場合
      startPage = body.startPage;
      endPage = body.endPage;
      perPage = body.perPage || 10;
      sortOption = body.sortOption || 'UPDATED_DESC';
      generateSummary = body.generateSummary !== false;
    } else {
      // cron実行の場合
      startPage = 1;
      endPage = body.maxPages || 3;
      perPage = body.perPage || 10;
      sortOption = 'UPDATED_DESC';
      generateSummary = body.generateSummary !== false;
    }

    const primaryTag = tags[0];

    console.log(
      `🤖 一括ライブラリ登録開始: tags=${tags.join(',')}, pages=${startPage}-${endPage}, perPage=${perPage}, sort=${sortOption}, AI要約=${generateSummary}`
    );

    // 重複チェック関数（Script IDベース）
    const duplicateChecker = async (scriptId: string): Promise<boolean> => {
      const existing = await db
        .select({ id: library.id })
        .from(library)
        .where(eq(library.scriptId, scriptId))
        .limit(1);

      return existing.length > 0;
    };

    // 保存処理コールバック
    const saveCallback = async (
      libraryData: ScrapedLibraryData
    ): Promise<{ success: boolean; id?: string; error?: string }> => {
      try {
        // CreateLibraryServiceの引数形式に合わせて変換
        const params = {
          scriptId: libraryData.scriptId || '',
          repoUrl: libraryData.repositoryUrl,
        };

        const libraryId = await CreateLibraryService.call(params);

        return {
          success: true,
          id: libraryId, // CreateLibraryServiceは文字列のIDを返す
        };
      } catch (error) {
        return {
          success: false,
          error: ErrorUtils.getMessage(error, '保存に失敗しました'),
        };
      }
    };

    // タグ指定でのスクレイピング設定
    const customConfig = {
      rateLimit: {
        maxRequestsPerHour: 5000,
        delayBetweenRequests: 1000, // 1秒間隔
      },
      scriptIdPatterns: DEFAULT_SCRIPT_ID_PATTERNS,
      webAppPatterns: DEFAULT_WEB_APP_PATTERNS,
      gasTags: tags, // 指定されたタグを使用
      verbose: true,
    };

    // 一括処理実行
    const result = await ProcessBulkGASLibraryWithSaveService.call(
      startPage,
      endPage,
      perPage,
      duplicateChecker,
      saveCallback,
      sortOption,
      generateSummary,
      customConfig
    );

    // エラー詳細を抽出
    const errors = result.results
      .filter(r => !r.success)
      .map(r => r.error)
      .filter(Boolean) as string[];

    const response: BulkRegisterResponse = {
      success: result.success,
      message: result.success
        ? `一括登録完了: ${result.successCount}件成功、${result.errorCount}件エラー、${result.duplicateCount}件重複`
        : `一括登録に失敗: ${result.errorCount}件エラー`,
      summary: {
        total: result.total,
        successCount: result.successCount,
        errorCount: result.errorCount,
        duplicateCount: result.duplicateCount,
        tag: primaryTag,
      },
      ...(errors.length > 0 && { errors }),
    };

    console.log(
      `✅ 一括ライブラリ登録完了: tags=${tags.join(',')}, 成功=${result.successCount}件, エラー=${result.errorCount}件, 重複=${result.duplicateCount}件`
    );

    return json(response);
  } catch (error) {
    return ActionErrorHandler.handleBulkRegisterError(error, '一括ライブラリ登録APIエラー:');
  }
};
