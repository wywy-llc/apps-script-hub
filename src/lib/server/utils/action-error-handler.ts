import { fail, json } from '@sveltejs/kit';
import { ErrorUtils } from './error-utils.js';

/**
 * SvelteKit Action用の共通エラーハンドリングユーティリティ
 * DRY原則に基づいて、統一されたエラーハンドリングを提供
 */
export class ActionErrorHandler {
  /**
   * catch ブロック内で使用する共通エラーハンドラー
   * @param error エラーオブジェクト
   * @param context エラーコンテキスト（例: 'ライブラリ削除'）
   * @param logPrefix ログ出力用のプレフィックス（例: 'ライブラリ削除エラー:'）
   * @returns SvelteKit fail レスポンス
   */
  static handleActionError(error: unknown, context: string, logPrefix?: string) {
    // エラーログ出力
    const prefix = logPrefix || `${context}エラー:`;
    console.error(prefix, error);

    // HTTPステータスとメッセージを取得
    const errorStatus = ErrorUtils.getHttpStatus(error);
    const errorMessage = ErrorUtils.getMessage(error, `${context}中にエラーが発生しました。`);

    // 統一されたエラーレスポンスを返す
    return fail(errorStatus, {
      error: `${context}中にエラーが発生しました。 詳細: ${errorMessage}`,
    });
  }

  /**
   * API レスポンス用の共通エラーハンドラー（JSON形式）
   * @param error エラーオブジェクト
   * @param context エラーコンテキスト
   * @param logPrefix ログ出力用のプレフィックス
   * @returns JSON エラーレスポンス
   */
  static handleApiError(error: unknown, context: string, logPrefix?: string) {
    // エラーログ出力
    const prefix = logPrefix || `${context}エラー:`;
    console.error(prefix, error);

    // HTTPステータスとメッセージを取得
    const errorStatus = ErrorUtils.getHttpStatus(error);
    const errorMessage = ErrorUtils.getMessage(error, '不明なエラー');

    return {
      status: errorStatus,
      body: {
        success: false,
        message: `${context}中にエラーが発生しました: ${errorMessage}`,
        error: errorMessage,
      },
    };
  }

  /**
   * 一括登録API用の特化エラーハンドラー
   * @param error エラーオブジェクト
   * @param logPrefix ログ出力用のプレフィックス
   * @returns 一括登録レスポンス形式のエラー
   */
  static handleBulkRegisterError(error: unknown, logPrefix: string) {
    console.error(logPrefix, error);
    const errorStatus = ErrorUtils.getHttpStatus(error);
    const errorMessage = ErrorUtils.getMessage(error, '不明なエラー');

    return json(
      {
        success: false,
        message: `サーバーエラーが発生しました: ${errorMessage}`,
        summary: {
          total: 0,
          successCount: 0,
          errorCount: 1,
          duplicateCount: 0,
          tag: 'unknown',
        },
        errors: [errorMessage],
      },
      { status: errorStatus }
    );
  }

  /**
   * カスタムメッセージでのエラーハンドリング
   * @param error エラーオブジェクト
   * @param customMessage カスタムエラーメッセージ
   * @param logPrefix ログ出力用のプレフィックス
   * @returns SvelteKit fail レスポンス
   */
  static handleActionErrorWithCustomMessage(
    error: unknown,
    customMessage: string,
    logPrefix?: string
  ) {
    // エラーログ出力
    if (logPrefix) {
      console.error(logPrefix, error);
    }

    // HTTPステータスとメッセージを取得
    const errorStatus = ErrorUtils.getHttpStatus(error);
    const errorDetails = ErrorUtils.getMessage(error, '詳細不明');

    return fail(errorStatus, {
      error: `${customMessage} 詳細: ${errorDetails}`,
    });
  }
}
