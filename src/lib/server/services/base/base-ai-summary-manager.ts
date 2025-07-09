import { GenerateLibrarySummaryService } from '../generate-library-summary-service.js';
import { SaveLibrarySummaryService } from '../save-library-summary-service.js';

/**
 * AI要約生成の共通管理クラス
 * 重複するAI要約生成処理を統一化
 */
export class BaseAiSummaryManager {
  /**
   * AI要約を生成してデータベースに保存
   * @param libraryId ライブラリID
   * @param githubUrl GitHub URL
   * @param options オプション設定
   */
  static async generateAndSave(
    libraryId: string,
    githubUrl: string,
    options: {
      skipOnError?: boolean; // エラー時にスキップするか（デフォルト: true）
      logContext?: string; // ログコンテキスト
    } = {}
  ): Promise<void> {
    const { skipOnError = true, logContext = 'AI要約生成' } = options;

    try {
      console.log(`${logContext}: ${libraryId}`);

      const summary = await GenerateLibrarySummaryService.call({
        githubUrl,
      });

      await SaveLibrarySummaryService.call(libraryId, summary);

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

  /**
   * 手動でAI要約を生成（エラー時は例外を投げる）
   * @param libraryId ライブラリID
   * @param githubUrl GitHub URL
   */
  static async generateManual(libraryId: string, githubUrl: string): Promise<void> {
    return this.generateAndSave(libraryId, githubUrl, {
      skipOnError: false,
      logContext: '手動でAI要約を生成',
    });
  }

  /**
   * 新規ライブラリ作成時のAI要約生成
   * @param libraryId ライブラリID
   * @param githubUrl GitHub URL
   */
  static async generateForNewLibrary(libraryId: string, githubUrl: string): Promise<void> {
    return this.generateAndSave(libraryId, githubUrl, {
      skipOnError: true,
      logContext: '新規ライブラリのAI要約を生成',
    });
  }

  /**
   * ライブラリ更新時のAI要約生成
   * @param libraryId ライブラリID
   * @param githubUrl GitHub URL
   * @param reason 生成理由
   */
  static async generateForUpdate(
    libraryId: string,
    githubUrl: string,
    reason: string
  ): Promise<void> {
    return this.generateAndSave(libraryId, githubUrl, {
      skipOnError: true,
      logContext: `${reason}のため、AI要約を生成`,
    });
  }

  /**
   * AI要約が存在するかチェック
   * @param libraryId ライブラリID
   * @returns 存在する場合はtrue
   */
  static async exists(libraryId: string): Promise<boolean> {
    return SaveLibrarySummaryService.exists(libraryId);
  }

  /**
   * 条件付きAI要約生成
   * @param libraryId ライブラリID
   * @param githubUrl GitHub URL
   * @param condition 生成条件
   * @param reason 生成理由
   */
  static async generateConditional(
    libraryId: string,
    githubUrl: string,
    condition: boolean,
    reason: string
  ): Promise<void> {
    if (condition) {
      await this.generateForUpdate(libraryId, githubUrl, reason);
    } else {
      console.log(`AI要約生成をスキップします: ${libraryId} - ${reason}`);
    }
  }

  /**
   * 複数ライブラリのAI要約を並列生成
   * @param libraries ライブラリ配列
   * @param options オプション設定
   */
  static async generateMultiple(
    libraries: Array<{ libraryId: string; githubUrl: string }>,
    options: {
      concurrency?: number; // 並列実行数（デフォルト: 3）
      skipOnError?: boolean;
      logContext?: string;
    } = {}
  ): Promise<void> {
    const { concurrency = 3, skipOnError = true, logContext = 'AI要約一括生成' } = options;

    // 並列実行数を制限して処理
    for (let i = 0; i < libraries.length; i += concurrency) {
      const batch = libraries.slice(i, i + concurrency);
      const promises = batch.map(({ libraryId, githubUrl }) =>
        this.generateAndSave(libraryId, githubUrl, { skipOnError, logContext })
      );

      await Promise.all(promises);

      // バッチ間の待機（レート制限対策）
      if (i + concurrency < libraries.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
}
