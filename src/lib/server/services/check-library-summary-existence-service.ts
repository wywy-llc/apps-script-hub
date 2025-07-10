import { LibrarySummaryRepository } from '$lib/server/repositories/library-summary-repository.js';

/**
 * ライブラリ要約存在確認サービス
 */
export class CheckLibrarySummaryExistenceService {
  /**
   * ライブラリ要約の存在確認
   *
   * 使用例:
   * ```typescript
   * const exists = await CheckLibrarySummaryExistenceService.call('lib123');
   * if (exists) {
   *   console.log('AI要約が存在します');
   * }
   * ```
   *
   * 動作原理:
   * 1. ライブラリIDを使用してlibrary_summaryテーブルを検索
   * 2. 該当レコードが存在するかどうかを返す
   *
   * @param libraryId ライブラリID
   * @returns 要約が存在する場合はtrue
   */
  public static async call(libraryId: string): Promise<boolean> {
    return LibrarySummaryRepository.exists(libraryId);
  }
}
