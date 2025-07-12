import { validateCronAuth } from '$lib/server/utils/api-auth.js';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * 全タグ一括登録API
 *
 * 使用例:
 * POST /api/cron/bulk-register-all-tags
 * Content-Type: application/json
 *
 * {
 *   "maxPages": 2,
 *   "perPage": 10,
 *   "generateSummary": true
 * }
 *
 * 動作原理:
 * 1. 定義済みのGASタグリストを順次処理
 * 2. 各タグごとに一括登録APIを呼び出し
 * 3. 全体の結果をまとめて返却
 *
 * crontab設定例:
 *
 * # 毎日午前2時に全タグで一括登録（推奨）
 * 0 2 * * * /usr/bin/curl -X POST http://localhost:5173/api/cron/bulk-register-all-tags -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_AUTH_SECRET" -d '{"maxPages":2,"perPage":10,"generateSummary":true}' >> /var/log/gas-library-all-tags-cron.log 2>&1
 *
 * # 毎週日曜日午前1時に全タグで大規模一括登録（週1回）
 * 0 1 * * 0 /usr/bin/curl -X POST http://localhost:5173/api/cron/bulk-register-all-tags -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_AUTH_SECRET" -d '{"maxPages":5,"perPage":20,"generateSummary":true}' >> /var/log/gas-library-all-tags-weekly.log 2>&1
 *
 * # 平日のみ午前3時に軽量実行（業務日対応）
 * 0 3 * * 1-5 /usr/bin/curl -X POST http://localhost:5173/api/cron/bulk-register-all-tags -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_AUTH_SECRET" -d '{"maxPages":1,"perPage":5,"generateSummary":false}' >> /var/log/gas-library-weekday-cron.log 2>&1
 *
 *
 * 処理対象タグ（順次実行）:
 * 1. google-apps-script  - 最重要タグ
 * 2. google-sheets       - スプレッドシート連携
 * 3. apps-script         - 短縮形
 * 4. library             - ライブラリ専用
 * 5. gas                 - 略称
 * 6. google-workspace    - ビジネス向け
 * 7. gmail               - メール自動化
 * 8. google-drive        - ファイル操作
 * 9. developer-tools     - 開発ツール
 * 10. javascript         - 技術スタック
 *
 * 実行時間目安:
 * - maxPages=2, perPage=10: 約10-15分（10タグ × 2ページ × タグ間2秒待機）
 * - maxPages=5, perPage=20: 約20-30分（大規模実行）
 * - GitHub APIレート制限により調整される場合があります
 *
 * 推奨設定:
 * - 毎日実行する場合は maxPages=2, perPage=10 が適切
 * - 週1回の大規模実行と日次の軽量実行を組み合わせると効果的
 * - ログ監視により API レート制限エラーを検知
 * - 深夜時間帯での実行でサーバー負荷を分散
 */

interface BatchRegisterRequest {
  maxPages?: number;
  perPage?: number;
  generateSummary?: boolean;
  tags?: string[];
}

interface BatchRegisterResponse {
  success: boolean;
  message: string;
  overallResults: {
    totalTags: number;
    successTags: number;
    failedTags: number;
    totalLibraries: number;
    totalSuccess: number;
    totalErrors: number;
    totalDuplicates: number;
  };
  tagResults: Array<{
    tag: string;
    success: boolean;
    total: number;
    successCount: number;
    errorCount: number;
    duplicateCount: number;
    errors?: string[];
  }>;
}

/**
 * Google Apps Scriptでよく使われるタグリスト
 * 優先度順に並べられている
 */
const DEFAULT_GAS_TAGS = [
  'google-apps-script',
  'google-sheets',
  'apps-script',
  'library',
  'gas',
  'google-workspace',
  'gmail',
  'google-drive',
  'developer-tools',
  'javascript',
];

/**
 * 全タグ一括登録エンドポイント
 */
export const POST: RequestHandler = async ({ request, fetch }) => {
  try {
    // 認証チェック
    validateCronAuth(request);

    const body: BatchRegisterRequest = await request.json();

    const maxPages = body.maxPages || 2;
    const perPage = body.perPage || 10;
    const generateSummary = body.generateSummary !== false;
    const tags = body.tags || DEFAULT_GAS_TAGS;

    console.log(
      `🚀 全タグ一括登録開始: ${tags.length}タグ, maxPages=${maxPages}, perPage=${perPage}`
    );

    const tagResults: Array<{
      tag: string;
      success: boolean;
      total: number;
      successCount: number;
      errorCount: number;
      duplicateCount: number;
      errors?: string[];
    }> = [];

    let totalLibraries = 0;
    let totalSuccess = 0;
    let totalErrors = 0;
    let totalDuplicates = 0;
    let successTags = 0;

    // 各タグを順次処理
    for (const [index, tag] of tags.entries()) {
      try {
        console.log(`📋 処理中: ${tag} (${index + 1}/${tags.length})`);

        // 個別タグ用APIを呼び出し
        const response = await fetch('/api/libraries/bulk-register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: request.headers.get('Authorization') || '',
          },
          body: JSON.stringify({
            tag,
            maxPages,
            perPage,
            generateSummary,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        tagResults.push({
          tag,
          success: result.success,
          total: result.summary.total,
          successCount: result.summary.successCount,
          errorCount: result.summary.errorCount,
          duplicateCount: result.summary.duplicateCount,
          errors: result.errors,
        });

        if (result.success) {
          successTags++;
        }

        totalLibraries += result.summary.total;
        totalSuccess += result.summary.successCount;
        totalErrors += result.summary.errorCount;
        totalDuplicates += result.summary.duplicateCount;

        console.log(
          `✅ ${tag}完了: 成功=${result.summary.successCount}件, エラー=${result.summary.errorCount}件`
        );

        // タグ間の待機時間（レート制限対策）
        if (tags.indexOf(tag) < tags.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2秒待機
        }
      } catch (error) {
        console.error(`❌ ${tag}でエラー:`, error);

        tagResults.push({
          tag,
          success: false,
          total: 0,
          successCount: 0,
          errorCount: 1,
          duplicateCount: 0,
          errors: [error instanceof Error ? error.message : '不明なエラー'],
        });

        totalErrors++;
      }
    }

    const response: BatchRegisterResponse = {
      success: successTags > 0,
      message: `全タグ処理完了: ${successTags}/${tags.length}タグ成功、合計${totalSuccess}件のライブラリを登録`,
      overallResults: {
        totalTags: tags.length,
        successTags,
        failedTags: tags.length - successTags,
        totalLibraries,
        totalSuccess,
        totalErrors,
        totalDuplicates,
      },
      tagResults,
    };

    console.log(
      `🎉 全タグ一括登録完了: ${successTags}/${tags.length}タグ成功, 合計${totalSuccess}件登録`
    );

    return json(response);
  } catch (error) {
    console.error('全タグ一括登録APIエラー:', error);

    return json(
      {
        success: false,
        message: 'サーバーエラーが発生しました',
        overallResults: {
          totalTags: 0,
          successTags: 0,
          failedTags: 1,
          totalLibraries: 0,
          totalSuccess: 0,
          totalErrors: 1,
          totalDuplicates: 0,
        },
        tagResults: [],
      } as BatchRegisterResponse,
      { status: 500 }
    );
  }
};
