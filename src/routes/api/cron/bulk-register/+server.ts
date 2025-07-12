import { db } from '$lib/server/db/index.js';
import { library } from '$lib/server/db/schema.js';
import { CreateLibraryService } from '$lib/server/services/create-library-service.js';
import { ProcessBulkGASLibraryWithSaveService } from '$lib/server/services/process-bulk-gas-library-with-save-service.js';
import type { ScrapedLibraryData } from '$lib/types/github-scraper.js';
import { json, type RequestHandler } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

/**
 * 毎日実行用一括ライブラリ登録APIエンドポイント
 *
 * 使用例:
 * POST /api/cron/bulk-register
 * Content-Type: application/json
 *
 * {
 *   "tag": "google-apps-script",
 *   "maxPages": 3,
 *   "perPage": 10,
 *   "generateSummary": true
 * }
 *
 * 動作原理:
 * 1. 指定されたタグでGitHub検索を実行（更新日時降順）
 * 2. 2年以内に更新されたリポジトリのみ対象
 * 3. 重複チェックを実行（Script IDベース）
 * 4. データベースに保存
 * 5. AI要約を生成
 *
 * crontab設定例:
 *
 * # 毎日午前2時に google-apps-script タグで一括登録
 * 0 2 * * * /usr/bin/curl -X POST http://localhost:5173/api/cron/bulk-register -H "Content-Type: application/json" -d "{\"tag\":\"google-apps-script\",\"maxPages\":10,\"perPage\":10,\"generateSummary\":true}" >> /var/log/gas-library-cron.log 2>&1
 *
 * # 毎日午前3時に google-sheets タグで一括登録
 * 0 3 * * * /usr/bin/curl -X POST http://localhost:5173/api/cron/bulk-register -H "Content-Type: application/json" -d "{\"tag\":\"google-sheets\",\"maxPages\":2,\"perPage\":10,\"generateSummary\":true}" >> /var/log/gas-library-cron.log 2>&1
 *
 * # 毎週日曜日午前4時に library タグで一括登録（週1回）
 * 0 4 * * 0 /usr/bin/curl -X POST http://localhost:5173/api/cron/bulk-register -H "Content-Type: application/json" -d "{\"tag\":\"library\",\"maxPages\":5,\"perPage\":15,\"generateSummary\":true}" >> /var/log/gas-library-cron.log 2>&1
 *
 * crontab時刻フォーマット:
 * 分(0-59) 時(0-23) 日(1-31) 月(1-12) 曜日(0-7, 0と7は日曜日)
 *
 * 推奨設定:
 * - GitHub API レート制限を考慮して時間差で実行
 * - ログファイルに出力して実行状況を監視
 * - 重要タグ（google-apps-script）は毎日、その他は週1-2回
 * - 深夜時間帯（2-6時）での実行を推奨
 */

interface BulkRegisterRequest {
  tag: string;
  maxPages?: number;
  perPage?: number;
  generateSummary?: boolean;
}

interface BulkRegisterResponse {
  success: boolean;
  message: string;
  results: {
    total: number;
    successCount: number;
    errorCount: number;
    duplicateCount: number;
    tag: string;
  };
  errors?: string[];
}

/**
 * cron用一括ライブラリ登録エンドポイント
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    const body: BulkRegisterRequest = await request.json();

    // パラメータのバリデーション
    if (!body.tag || typeof body.tag !== 'string') {
      return json(
        {
          success: false,
          message: 'tagパラメータは必須です',
          results: {
            total: 0,
            successCount: 0,
            errorCount: 1,
            duplicateCount: 0,
            tag: body.tag || 'unknown',
          },
        } as BulkRegisterResponse,
        { status: 400 }
      );
    }

    const maxPages = body.maxPages || 3;
    const perPage = body.perPage || 10;
    const generateSummary = body.generateSummary !== false; // デフォルトtrue

    console.log(
      `🤖 cron一括登録開始: tag=${body.tag}, maxPages=${maxPages}, perPage=${perPage}, AI要約=${generateSummary}`
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
          error: error instanceof Error ? error.message : '保存に失敗しました',
        };
      }
    };

    // タグ指定でのスクレイピング設定
    const customConfig = {
      rateLimit: {
        maxRequestsPerHour: 60,
        delayBetweenRequests: 1000, // 1秒間隔
      },
      scriptIdPatterns: [
        /スクリプトID[：:\s]*([A-Za-z0-9_-]{20,})/gi,
        /Script[\s]*ID[：:\s]*([A-Za-z0-9_-]{20,})/gi,
        /script[\s]*id[：:\s]*['"`]([A-Za-z0-9_-]{20,})['"`]/gi,
        /https:\/\/script\.google\.com\/macros\/d\/([A-Za-z0-9_-]{20,})/gi,
      ],
      gasTags: [body.tag], // 指定されたタグを使用
      verbose: true,
    };

    // 一括処理実行
    const result = await ProcessBulkGASLibraryWithSaveService.call(
      1, // 開始ページ
      maxPages, // 終了ページ
      perPage,
      duplicateChecker,
      saveCallback,
      'UPDATED_DESC', // 更新日時降順
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
      results: {
        total: result.total,
        successCount: result.successCount,
        errorCount: result.errorCount,
        duplicateCount: result.duplicateCount,
        tag: body.tag,
      },
      ...(errors.length > 0 && { errors }),
    };

    console.log(
      `✅ cron一括登録完了: tag=${body.tag}, 成功=${result.successCount}件, エラー=${result.errorCount}件, 重複=${result.duplicateCount}件`
    );

    return json(response);
  } catch (error) {
    console.error('一括登録APIエラー:', error);

    return json(
      {
        success: false,
        message: 'サーバーエラーが発生しました',
        results: {
          total: 0,
          successCount: 0,
          errorCount: 1,
          duplicateCount: 0,
          tag: 'unknown',
        },
        errors: [error instanceof Error ? error.message : '不明なエラー'],
      } as BulkRegisterResponse,
      { status: 500 }
    );
  }
};
