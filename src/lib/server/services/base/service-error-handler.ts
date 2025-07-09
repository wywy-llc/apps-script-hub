/**
 * サービス共通エラーハンドラー
 * 全サービスで統一されたエラーハンドリングを提供
 */
export interface ServiceError {
  success: false;
  error: string;
}

export interface ServiceSuccess<T = void> {
  success: true;
  data?: T;
}

export type ServiceResult<T = void> = ServiceSuccess<T> | ServiceError;

export class BaseServiceErrorHandler {
  /**
   * サービスエラーの統一ハンドリング
   * @param error エラーオブジェクト
   * @param context エラーコンテキスト
   * @returns 統一されたエラーレスポンス
   */
  static handleError(error: unknown, context: string): ServiceError {
    console.error(`${context}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : `${context}に失敗しました`,
    };
  }

  /**
   * 非同期サービス処理のエラーハンドリング
   * @param operation 実行する非同期処理
   * @param context エラーコンテキスト
   * @returns 成功またはエラーレスポンス
   */
  static async handleAsyncOperation<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<ServiceResult<T>> {
    try {
      const result = await operation();
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return this.handleError(error, context);
    }
  }

  /**
   * 条件付きエラーハンドリング
   * @param condition 条件
   * @param errorMessage エラーメッセージ
   * @param context エラーコンテキスト
   * @throws Error 条件が false の場合
   */
  static assertCondition(condition: boolean, errorMessage: string, context: string): void {
    if (!condition) {
      const error = new Error(errorMessage);
      console.error(`${context}:`, error);
      throw error;
    }
  }
}
