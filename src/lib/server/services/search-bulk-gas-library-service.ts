import { type GitHubSearchSortOption } from '$lib/constants/github-search.js';
import { DEFAULT_SCRAPER_CONFIG } from '$lib/constants/scraper-config.js';
import { GitHubApiUtils } from '$lib/server/utils/github-api-utils.js';
import type { BulkScrapeResult, ScrapeResult, ScraperConfig } from '$lib/types/github-scraper.js';
import { ScrapeGASLibraryService } from './scrape-gas-library-service.js';

/**
 * GASライブラリ一括検索サービス
 * GitHubタグによる検索とスクレイピングの基本機能を提供
 *
 * 使用例:
 * ```typescript
 * // 基本検索
 * const result = await SearchBulkGASLibraryService.call(10, duplicateChecker);
 *
 * // ページ範囲指定検索
 * const result = await SearchBulkGASLibraryService.callWithPageRange(1, 3, 10);
 * ```
 *
 * 動作原理:
 * 1. GitHub APIでGASタグ付きリポジトリを検索
 * 2. 各リポジトリに対してスクレイピングを実行
 * 3. 結果を集約して返却
 */
export class SearchBulkGASLibraryService {
  /**
   * GASタグでリポジトリを検索し、一括でスクレイピング
   *
   * @param maxResults - 検索する最大リポジトリ数（デフォルト: 10）
   * @param duplicateChecker - 重複チェック関数（省略可）
   * @param config - スクレイパー設定（省略時はデフォルト設定を使用）
   * @returns 一括スクレイピング結果
   */
  public static async call(
    maxResults: number = 10,
    duplicateChecker?: (scriptId: string) => Promise<boolean>,
    config: ScraperConfig = DEFAULT_SCRAPER_CONFIG
  ): Promise<BulkScrapeResult> {
    try {
      // GitHub APIでGASタグ付きリポジトリを検索
      const searchResult = await GitHubApiUtils.searchRepositoriesByTags(config, maxResults);

      if (!searchResult.success) {
        return {
          success: false,
          results: [
            {
              success: false,
              error: searchResult.error || 'GitHub検索に失敗しました',
            },
          ],
          total: 0,
          successCount: 0,
          errorCount: 1,
          duplicateCount: 0,
        };
      }

      const results: ScrapeResult[] = [];
      let duplicateCount = 0;

      // 各リポジトリに対してスクレイピングを実行
      for (const repo of searchResult.repositories) {
        try {
          const result = await ScrapeGASLibraryService.call(repo.html_url);

          // 重複チェック（スクレイピング後にscriptIdを確認）
          if (result.success && result.data && duplicateChecker) {
            const isDuplicate = await duplicateChecker(result.data.scriptId);
            if (isDuplicate) {
              duplicateCount++;
              if (config.verbose) {
                console.log(`重複スキップ: ${repo.name} (Script ID: ${result.data.scriptId})`);
              }
              continue;
            }
          }

          results.push(result);

          // GitHub API制限対策: 各リクエスト間に待機
          await new Promise(resolve => setTimeout(resolve, config.rateLimit.delayBetweenRequests));
        } catch (error) {
          results.push({
            success: false,
            error: `${repo.name}: ${error instanceof Error ? error.message : 'スクレイピングに失敗しました'}`,
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const errorCount = results.filter(r => !r.success).length;

      // 処理完了ログを出力
      if (config.verbose) {
        console.log(
          `GAS一括検索処理が完了しました。成功: ${successCount}件 / 処理済み: ${searchResult.processedCount}件`
        );
      }

      return {
        success: successCount > 0,
        results,
        total: searchResult.processedCount,
        successCount,
        errorCount,
        duplicateCount,
      };
    } catch (error) {
      console.error('一括スクレイピングエラー:', error);
      return {
        success: false,
        results: [
          {
            success: false,
            error: error instanceof Error ? error.message : '一括スクレイピングに失敗しました',
          },
        ],
        total: 0,
        successCount: 0,
        errorCount: 1,
        duplicateCount: 0,
      };
    }
  }

  /**
   * GASタグでリポジトリを検索し、ページ範囲指定で一括スクレイピング
   *
   * @param startPage - 開始ページ（1から開始）
   * @param endPage - 終了ページ
   * @param perPage - ページあたりの結果数
   * @param duplicateChecker - 重複チェック関数（省略可）
   * @param sortOption - ソート条件（省略時はconfig.github.sortByを使用）
   * @param config - スクレイパー設定（省略時はデフォルト設定を使用）
   * @returns 一括スクレイピング結果
   */
  public static async callWithPageRange(
    startPage: number,
    endPage: number,
    perPage: number,
    duplicateChecker?: (scriptId: string) => Promise<boolean>,
    sortOption?: GitHubSearchSortOption,
    config: ScraperConfig = DEFAULT_SCRAPER_CONFIG
  ): Promise<BulkScrapeResult> {
    try {
      // GitHub APIでGASタグ付きリポジトリを検索（ページ範囲指定）
      const searchResult = await GitHubApiUtils.searchRepositoriesByPageRange(
        config,
        startPage,
        endPage,
        perPage,
        sortOption
      );

      if (!searchResult.success) {
        return {
          success: false,
          results: [
            {
              success: false,
              error: searchResult.error || 'GitHub検索に失敗しました',
            },
          ],
          total: 0,
          successCount: 0,
          errorCount: 1,
          duplicateCount: 0,
        };
      }

      const results: ScrapeResult[] = [];
      let duplicateCount = 0;

      // 各リポジトリに対してスクレイピングを実行
      for (const repo of searchResult.repositories) {
        try {
          const result = await ScrapeGASLibraryService.call(repo.html_url);

          // 重複チェック（スクレイピング後にscriptIdを確認）
          if (result.success && result.data && duplicateChecker) {
            const isDuplicate = await duplicateChecker(result.data.scriptId);
            if (isDuplicate) {
              duplicateCount++;
              if (config.verbose) {
                console.log(`重複スキップ: ${repo.name} (Script ID: ${result.data.scriptId})`);
              }
              continue;
            }
          }

          results.push(result);

          // GitHub API制限対策: 各リクエスト間に待機
          await new Promise(resolve => setTimeout(resolve, config.rateLimit.delayBetweenRequests));
        } catch (error) {
          results.push({
            success: false,
            error: `${repo.name}: ${error instanceof Error ? error.message : 'スクレイピングに失敗しました'}`,
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const errorCount = results.filter(r => !r.success).length;

      // 処理完了ログを出力
      if (config.verbose) {
        console.log(
          `GAS一括検索処理が完了しました。成功: ${successCount}件 / 処理済み: ${searchResult.processedCount}件`
        );
      }

      return {
        success: successCount > 0,
        results,
        total: searchResult.processedCount,
        successCount,
        errorCount,
        duplicateCount,
      };
    } catch (error) {
      console.error('一括スクレイピングエラー:', error);
      return {
        success: false,
        results: [
          {
            success: false,
            error: error instanceof Error ? error.message : '一括スクレイピングに失敗しました',
          },
        ],
        total: 0,
        successCount: 0,
        errorCount: 1,
        duplicateCount: 0,
      };
    }
  }
}
