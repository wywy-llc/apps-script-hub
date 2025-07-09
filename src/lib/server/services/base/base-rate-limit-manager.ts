/**
 * レート制限管理の共通クラス
 * API呼び出しのレート制限を統一管理
 */
export class BaseRateLimitManager {
  /**
   * 指定時間待機
   * @param ms 待機時間（ミリ秒）
   */
  static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * GitHub API用の標準待機
   * @param delayMs 待機時間（デフォルト: 200ms）
   */
  static async githubApiDelay(delayMs: number = 200): Promise<void> {
    await this.delay(delayMs);
  }

  /**
   * 設定に基づく待機
   * @param config レート制限設定
   */
  static async configBasedDelay(config: {
    rateLimit: {
      delayBetweenRequests: number;
    };
  }): Promise<void> {
    await this.delay(config.rateLimit.delayBetweenRequests);
  }

  /**
   * バッチ処理用の待機
   * @param batchIndex バッチインデックス
   * @param totalBatches 総バッチ数
   * @param delayMs バッチ間の待機時間（デフォルト: 1000ms）
   */
  static async batchDelay(
    batchIndex: number,
    totalBatches: number,
    delayMs: number = 1000
  ): Promise<void> {
    // 最後のバッチでない場合のみ待機
    if (batchIndex < totalBatches - 1) {
      await this.delay(delayMs);
    }
  }

  /**
   * 指数バックオフ待機
   * @param attempt 試行回数
   * @param baseDelay 基本待機時間（デフォルト: 1000ms）
   * @param maxDelay 最大待機時間（デフォルト: 30000ms）
   */
  static async exponentialBackoff(
    attempt: number,
    baseDelay: number = 1000,
    maxDelay: number = 30000
  ): Promise<void> {
    const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
    await this.delay(delay);
  }

  /**
   * レート制限付きの関数実行
   * @param fn 実行する関数
   * @param delayMs 実行前の待機時間
   * @returns 関数の実行結果
   */
  static async withRateLimit<T>(fn: () => Promise<T>, delayMs: number): Promise<T> {
    await this.delay(delayMs);
    return fn();
  }

  /**
   * 並列実行数制限付きの配列処理
   * @param items 処理する配列
   * @param processor 各要素を処理する関数
   * @param concurrency 並列実行数
   * @param delayMs 各バッチ間の待機時間
   * @returns 処理結果の配列
   */
  static async processWithConcurrency<T, R>(
    items: T[],
    processor: (item: T, index: number) => Promise<R>,
    concurrency: number = 3,
    delayMs: number = 1000
  ): Promise<R[]> {
    const results: R[] = [];

    for (let i = 0; i < items.length; i += concurrency) {
      const batch = items.slice(i, i + concurrency);
      const batchPromises = batch.map((item, batchIndex) => processor(item, i + batchIndex));

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // バッチ間の待機
      await this.batchDelay(i / concurrency, Math.ceil(items.length / concurrency), delayMs);
    }

    return results;
  }

  /**
   * リトライ機能付きの関数実行
   * @param fn 実行する関数
   * @param maxRetries 最大リトライ回数
   * @param baseDelay 基本待機時間
   * @returns 関数の実行結果
   */
  static async withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        if (attempt < maxRetries) {
          console.warn(`リトライ ${attempt + 1}/${maxRetries}: ${lastError.message}`);
          await this.exponentialBackoff(attempt, baseDelay);
        }
      }
    }

    throw lastError;
  }
}
