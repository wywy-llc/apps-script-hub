import { db } from '$lib/server/db';
import { library } from '$lib/server/db/schema';
import { ActionErrorHandler } from '$lib/server/utils/action-error-handler.js';
import { validateCronAuth } from '$lib/server/utils/api-auth.js';
import { ErrorUtils } from '$lib/server/utils/error-utils.js';
import { json, type RequestHandler } from '@sveltejs/kit';
import { desc, ne } from 'drizzle-orm';

/**
 * 既存ライブラリ一括更新API（Cron用）
 *
 * 使用例:
 * POST /api/cron/bulk-update-existing
 * Content-Type: application/json
 *
 * {
 *   "batchSize": 10,
 *   "delayMs": 500
 * }
 *
 * 動作原理:
 * 1. データベースから既存ライブラリを取得（却下ステータス除外）
 * 2. 各ライブラリのGitHub情報（Star数、最終更新日等）を一括更新
 * 3. AI要約は更新しない（GitHub情報のみ）
 * 4. レート制限を考慮したバッチ処理で実行
 *
 * crontab設定例:
 *
 * # 毎日午前3時に既存ライブラリの情報を更新（推奨）
 * 0 3 * * * /usr/bin/curl -X POST http://localhost:5173/api/cron/bulk-update-existing -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_AUTH_SECRET" -d '{"batchSize":10,"delayMs":500}' >> /var/log/gas-library-update-cron.log 2>&1
 *
 * # 週1回日曜日午前4時に大規模更新（週次メンテナンス）
 * 0 4 * * 0 /usr/bin/curl -X POST http://localhost:5173/api/cron/bulk-update-existing -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_AUTH_SECRET" -d '{"batchSize":20,"delayMs":300}' >> /var/log/gas-library-weekly-update.log 2>&1
 *
 * # 平日のみ午前2時に軽量更新（業務日対応）
 * 0 2 * * 1-5 /usr/bin/curl -X POST http://localhost:5173/api/cron/bulk-update-existing -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_AUTH_SECRET" -d '{"batchSize":5,"delayMs":1000}' >> /var/log/gas-library-weekday-update.log 2>&1
 *
 * パラメーター:
 * - batchSize: 一度に処理するライブラリ数（デフォルト: 10）
 * - delayMs: ライブラリ間の待機時間（ms）（デフォルト: 500）
 *
 * 実行時間目安:
 * - 100ライブラリ, batchSize=10, delayMs=500: 約8-10分
 * - 500ライブラリ, batchSize=20, delayMs=300: 約12-15分
 * - GitHub APIレート制限により調整される場合があります
 *
 * 推奨設定:
 * - 毎日実行する場合は batchSize=10, delayMs=500 が適切
 * - 大量のライブラリがある場合は深夜時間帯での実行を推奨
 * - GitHub APIレート制限エラーを監視し、必要に応じて調整
 * - ログ監視により処理状況を把握
 */

interface BulkUpdateRequest {
  batchSize?: number;
  delayMs?: number;
  excludeRejected?: boolean;
}

interface BulkUpdateResponse {
  success: boolean;
  message: string;
  results: {
    totalLibraries: number;
    successCount: number;
    errorCount: number;
    skippedCount: number;
  };
  errors?: string[];
}

/**
 * 既存ライブラリ一括更新エンドポイント
 */
export const POST: RequestHandler = async ({ request, fetch }) => {
  try {
    // 認証チェック
    validateCronAuth(request);

    const body: BulkUpdateRequest = await request.json();

    const batchSize = body.batchSize || 10;
    const delayMs = body.delayMs || 500;
    const excludeRejected = body.excludeRejected !== false;

    console.log(
      `🚀 既存ライブラリ一括更新開始: batchSize=${batchSize}, delayMs=${delayMs}ms, excludeRejected=${excludeRejected}`
    );

    // 既存ライブラリをすべて取得
    const baseQuery = {
      id: library.id,
      name: library.name,
      scriptId: library.scriptId,
      status: library.status,
    };

    const orderByClause = [desc(library.updatedAt)] as const;

    let allLibraries;

    if (excludeRejected) {
      // 却下ステータスのライブラリを除外
      allLibraries = await db
        .select(baseQuery)
        .from(library)
        .where(ne(library.status, 'rejected'))
        .orderBy(...orderByClause);
    } else {
      // 全件取得
      allLibraries = await db
        .select(baseQuery)
        .from(library)
        .orderBy(...orderByClause);
    }

    const targetLibraries = allLibraries;
    console.log(`📋 対象ライブラリ数: ${targetLibraries.length}件`);

    let successCount = 0;
    let errorCount = 0;
    const skippedCount = 0;
    const errors: string[] = [];

    // バッチ処理で更新
    for (let i = 0; i < targetLibraries.length; i += batchSize) {
      const batch = targetLibraries.slice(i, i + batchSize);

      console.log(
        `📦 バッチ ${Math.floor(i / batchSize) + 1}/${Math.ceil(targetLibraries.length / batchSize)} 処理中 (${i + 1}-${Math.min(i + batchSize, targetLibraries.length)}/${targetLibraries.length})`
      );

      // バッチ内のライブラリを並列処理
      const batchPromises = batch.map(
        async (lib: { id: string; name: string; scriptId: string; status: string }) => {
          try {
            console.log(`🔄 GitHub情報を更新中: ${lib.name}`);

            const response = await fetch(`/admin/libraries/${lib.id}/scraping`, {
              method: 'POST',
              headers: {
                Authorization: request.headers.get('Authorization') || '',
              },
            });

            if (response.ok) {
              console.log(`✅ ${lib.name} の更新成功`);
              return { success: true, libraryName: lib.name };
            } else {
              const errorText = await response.text();
              const errorMessage = `${lib.name}: HTTP ${response.status} - ${errorText}`;
              console.error(`❌ ${errorMessage}`);
              return { success: false, libraryName: lib.name, error: errorMessage };
            }
          } catch (error) {
            const errorMessage = `${lib.name}: ${ErrorUtils.getMessage(error, '不明なエラー')}`;
            console.error(`❌ ${errorMessage}`);
            return { success: false, libraryName: lib.name, error: errorMessage };
          }
        }
      );

      // バッチの結果を待機
      const batchResults = await Promise.all(batchPromises);

      // 結果を集計
      batchResults.forEach((result: { success: boolean; libraryName: string; error?: string }) => {
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
          if (result.error) {
            errors.push(result.error);
          }
        }
      });

      // 次のバッチまで待機（最後のバッチ以外）
      if (i + batchSize < targetLibraries.length) {
        console.log(`⏳ ${delayMs}ms待機中...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    const response: BulkUpdateResponse = {
      success: successCount > 0,
      message: `既存ライブラリ一括更新完了: 成功=${successCount}件, エラー=${errorCount}件, スキップ=${skippedCount}件`,
      results: {
        totalLibraries: targetLibraries.length,
        successCount,
        errorCount,
        skippedCount,
      },
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined, // 最初の10件のエラーのみ返却
    };

    console.log(`🎉 既存ライブラリ一括更新完了: 成功=${successCount}件, エラー=${errorCount}件`);

    return json(response);
  } catch (error) {
    return ActionErrorHandler.handleBatchRegisterError(error, '既存ライブラリ一括更新APIエラー:');
  }
};
