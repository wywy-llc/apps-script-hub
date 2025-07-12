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
      console.log(`${logContext}開始: libraryId=${libraryId}, githubUrl=${githubUrl}`);

      // AI要約生成
      const summary = await GenerateLibrarySummaryService.call({
        githubUrl,
      });

      console.log(`${logContext} - AI要約生成成功: ${libraryId}`);

      // データベースに保存するためのデータ変換
      const saveData = {
        id: generateId(),
        libraryId,
        // basicInfo → フラット構造に変換
        libraryNameJa: summary.basicInfo.libraryName.ja,
        libraryNameEn: summary.basicInfo.libraryName.en,
        purposeJa: summary.basicInfo.purpose.ja,
        purposeEn: summary.basicInfo.purpose.en,
        targetUsersJa: summary.basicInfo.targetUsers.ja,
        targetUsersEn: summary.basicInfo.targetUsers.en,
        tagsJa: summary.basicInfo.tags.ja,
        tagsEn: summary.basicInfo.tags.en,
        // functionality → フラット構造に変換
        coreProblemJa: summary.functionality.coreProblem.ja,
        coreProblemEn: summary.functionality.coreProblem.en,
        mainBenefits: summary.functionality.mainBenefits,
        usageExampleJa: summary.functionality.usageExample.ja,
        usageExampleEn: summary.functionality.usageExample.en,
        // seoInfo → フラット構造に変換
        seoTitleJa: summary.seoInfo.title.ja,
        seoTitleEn: summary.seoInfo.title.en,
        seoDescriptionJa: summary.seoInfo.description.ja,
        seoDescriptionEn: summary.seoInfo.description.en,
      };

      console.log(`${logContext} - データベース保存開始: ${libraryId}`);

      await LibrarySummaryRepository.upsert(libraryId, saveData);

      console.log(`${logContext}完了: ${libraryId}`);
    } catch (error) {
      const errorMessage = `${logContext}に失敗しました: ${error}`;

      console.error(`${logContext}エラー詳細:`, errorMessage);

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
