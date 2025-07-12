import { ErrorUtils } from './error-utils.js';

/**
 * サービス共通エラーハンドリングユーティリティ
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

export class ServiceErrorUtil {
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
      error: ErrorUtils.getMessage(error, `${context}に失敗しました`),
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

  /**
   * 成功レスポンスを作成
   * @param data レスポンスデータ
   * @returns 成功レスポンス
   */
  static success<T>(data?: T): ServiceSuccess<T> {
    return {
      success: true,
      data,
    };
  }

  /**
   * エラーレスポンスを作成
   * @param message エラーメッセージ
   * @returns エラーレスポンス
   */
  static error(message: string): ServiceError {
    return {
      success: false,
      error: message,
    };
  }

  /**
   * 複数の条件をチェックして最初のエラーを返す
   * @param checks チェック配列
   * @throws Error いずれかの条件が false の場合
   */
  static assertMultipleConditions(
    checks: Array<{
      condition: boolean;
      errorMessage: string;
      context: string;
    }>
  ): void {
    for (const check of checks) {
      this.assertCondition(check.condition, check.errorMessage, check.context);
    }
  }
}
