import { isHttpError } from '@sveltejs/kit';

/**
 * エラーハンドリング用のユーティリティクラス
 */
export class ErrorUtils {
  /**
   * エラーオブジェクトから適切なHTTPステータスコードを取得する
   * @param error エラーオブジェクト
   * @returns HTTPステータスコード（デフォルト: 500）
   */
  static getHttpStatus(error: unknown): number {
    if (isHttpError(error)) {
      return error.status;
    }
    if (
      error &&
      typeof error === 'object' &&
      'status' in error &&
      typeof error.status === 'number'
    ) {
      return error.status;
    }
    return 500;
  }

  /**
   * エラーメッセージを安全に取得する
   * @param error エラーオブジェクト
   * @param defaultMessage デフォルトメッセージ
   * @returns エラーメッセージ
   */
  static getMessage(error: unknown, defaultMessage = '不明なエラーが発生しました'): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (error && typeof error === 'object' && 'message' in error) {
      return String(error.message);
    }
    return defaultMessage;
  }

  /**
   * エラーオブジェクトからスタックトレースを取得する
   * @param error エラーオブジェクト
   * @returns スタックトレース
   */
  static getStackTrace(error: unknown): string | undefined {
    if (error instanceof Error) {
      return error.stack;
    }
    return undefined;
  }
}
