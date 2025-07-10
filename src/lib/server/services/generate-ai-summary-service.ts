import { LibrarySummaryRepository } from '$lib/server/repositories/library-summary-repository.js';
import { generateId } from '$lib/server/utils/generate-id.js';
import { GenerateLibrarySummaryService } from './generate-library-summary-service.js';

/**
 * AI要約生成サービス
 */
export class GenerateAiSummaryService {
  /**
   * AI要約を生成してデータベースに保存
   *
   * 使用例:
   * ```typescript
   * await GenerateAiSummaryService.call({
   *   libraryId: 'lib123',
   *   githubUrl: 'https://github.com/owner/repo',
   *   skipOnError: true,
   *   logContext: 'ライブラリ作成時のAI要約生成'
   * });
   * ```
   *
   * 動作原理:
   * 1. GitHub URLからAI要約を生成
   * 2. 生成された要約をデータベースに保存
   * 3. skipOnErrorがtrueの場合はエラー時も処理を継続
   *
   * @param params 要約生成パラメータ
   */
  public static async call(params: {
    libraryId: string;
    githubUrl: string;
    skipOnError?: boolean;
    logContext?: string;
  }): Promise<void> {
    const { libraryId, githubUrl, skipOnError = true, logContext = 'AI要約生成' } = params;

    try {
      console.log(`${logContext}: ${libraryId}`);

      const summary = await GenerateLibrarySummaryService.call({
        githubUrl,
      });

      await LibrarySummaryRepository.upsert(libraryId, {
        id: generateId(),
        ...summary,
      });

      console.log(`${logContext}完了: ${libraryId}`);
    } catch (error) {
      const errorMessage = `${logContext}に失敗しました: ${error}`;

      if (skipOnError) {
        console.warn(errorMessage);
        // エラーが発生してもメイン処理は続行
      } else {
        console.error(errorMessage);
        throw error;
      }
    }
  }
}
