import { DEFAULT_SCRAPER_CONFIG } from '$lib/server/constants/scraper-config.js';
import { GitHubApiUtils } from '$lib/server/utils/github-api-utils.js';
import type {
  BulkScrapeResult,
  ScrapeResult,
  ScrapedLibraryData,
  ScraperConfig,
} from '$lib/types/github-scraper.js';
import { GASLibraryScraper } from './gas-library-scraper.js';

/**
 * ライブラリデータの保存用コールバック関数の型定義
 */
export type LibrarySaveCallback = (
  libraryData: ScrapedLibraryData
) => Promise<{ success: boolean; id?: string; error?: string }>;

/**
 * GASライブラリ一括検索サービス
 * GitHubタグによる検索機能とライブラリの一括スクレイピングを提供
 *
 * 使用例:
 * const result = await BulkGASLibrarySearchService.call(10, duplicateChecker);
 */
export class BulkGASLibrarySearchService {
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
    const results: ScrapeResult[] = [];
    let duplicateCount = 0;

    try {
      // GASタグでリポジトリを検索
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

      if (config.verbose) {
        console.log(
          `GitHub検索結果: ${searchResult.totalFound}件中${searchResult.processedCount}件を処理`
        );
      }

      // 各リポジトリを逐次処理
      for (const repo of searchResult.repositories) {
        try {
          const result = await GASLibraryScraper.call(repo.html_url);

          // 重複チェック
          if (result.success && result.data && duplicateChecker) {
            const isDuplicate = await duplicateChecker(result.data.scriptId);
            if (isDuplicate) {
              duplicateCount++;
              results.push({
                success: false,
                error: `重複: スクリプトID ${result.data.scriptId} は既に存在します (${repo.name})`,
              });
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
   * @param perPage - 1ページあたりの件数
   * @param duplicateChecker - 重複チェック関数（省略可）
   * @param config - スクレイパー設定（省略時はデフォルト設定を使用）
   * @returns 一括スクレイピング結果
   */
  public static async callWithPageRange(
    startPage: number,
    endPage: number,
    perPage: number,
    duplicateChecker?: (scriptId: string) => Promise<boolean>,
    config: ScraperConfig = DEFAULT_SCRAPER_CONFIG
  ): Promise<BulkScrapeResult> {
    const results: ScrapeResult[] = [];
    let duplicateCount = 0;

    try {
      // ページ範囲指定でリポジトリを検索
      const searchResult = await GitHubApiUtils.searchRepositoriesByPageRange(
        config,
        startPage,
        endPage,
        perPage
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

      if (config.verbose) {
        console.log(
          `GitHub検索結果: ${searchResult.totalFound}件中${searchResult.processedCount}件を処理 (ページ ${startPage}-${endPage}, ${perPage}件/ページ)`
        );
      }

      // 各リポジトリを逐次処理
      for (const repo of searchResult.repositories) {
        try {
          const result = await GASLibraryScraper.call(repo.html_url);

          // 重複チェック
          if (result.success && result.data && duplicateChecker) {
            const isDuplicate = await duplicateChecker(result.data.scriptId);
            if (isDuplicate) {
              duplicateCount++;
              results.push({
                success: false,
                error: `重複: スクリプトID ${result.data.scriptId} は既に存在します (${repo.name})`,
              });
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
          `GAS一括検索処理が完了しました。成功: ${successCount}件 / 処理済み: ${searchResult.processedCount}件 (ページ ${startPage}-${endPage})`
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
   * GASタグでリポジトリを検索し、ページごとにDB保存を実行
   *
   * @param startPage - 開始ページ（1から開始）
   * @param endPage - 終了ページ
   * @param perPage - 1ページあたりの件数
   * @param duplicateChecker - 重複チェック関数（省略可）
   * @param saveCallback - ライブラリ保存コールバック関数
   * @param config - スクレイパー設定（省略時はデフォルト設定を使用）
   * @returns 一括スクレイピング結果
   */
  public static async callWithPageRangeAndSave(
    startPage: number,
    endPage: number,
    perPage: number,
    duplicateChecker: (scriptId: string) => Promise<boolean>,
    saveCallback: LibrarySaveCallback,
    config: ScraperConfig = DEFAULT_SCRAPER_CONFIG
  ): Promise<BulkScrapeResult> {
    const allResults: ScrapeResult[] = [];
    let totalDuplicateCount = 0;
    let totalProcessedCount = 0;

    try {
      if (config.verbose) {
        console.log(
          `ページ範囲指定一括検索・保存開始: ページ ${startPage}-${endPage} (${perPage}件/ページ)`
        );
      }

      // ページごとに処理
      for (let currentPage = startPage; currentPage <= endPage; currentPage++) {
        if (config.verbose) {
          console.log(`\n=== ページ ${currentPage} の処理開始 ===`);
        }

        try {
          // 1ページ分のリポジトリを検索
          const searchResult = await GitHubApiUtils.searchRepositoriesByPageRange(
            config,
            currentPage,
            currentPage, // 1ページのみ
            perPage
          );

          if (!searchResult.success) {
            if (config.verbose) {
              console.log(`ページ ${currentPage} の検索に失敗: ${searchResult.error}`);
            }
            // 検索失敗をエラー結果として記録
            allResults.push({
              success: false,
              error: `ページ ${currentPage}: ${searchResult.error || 'GitHub検索に失敗しました'}`,
            });
            continue;
          }

          if (config.verbose) {
            console.log(
              `ページ ${currentPage}: ${searchResult.repositories.length}件のリポジトリを発見`
            );
          }

          // 検索結果が0件の場合はスキップ
          if (searchResult.repositories.length === 0) {
            if (config.verbose) {
              console.log(`ページ ${currentPage}: 検索結果が0件のためスキップ`);
            }
            continue;
          }

          const pageResults: ScrapeResult[] = [];
          let pageDuplicateCount = 0;
          let pageSuccessCount = 0;

          // ページ内の各リポジトリを処理
          for (const repo of searchResult.repositories) {
            try {
              // スクレイピング実行
              const scrapeResult = await GASLibraryScraper.call(repo.html_url);

              if (!scrapeResult.success || !scrapeResult.data) {
                pageResults.push(scrapeResult);
                continue;
              }

              // 重複チェック
              const isDuplicate = await duplicateChecker(scrapeResult.data.scriptId);
              if (isDuplicate) {
                pageDuplicateCount++;
                totalDuplicateCount++;
                pageResults.push({
                  success: false,
                  error: `重複: スクリプトID ${scrapeResult.data.scriptId} は既に存在します (${repo.name})`,
                });
                continue;
              }

              // DB保存実行
              const saveResult = await saveCallback(scrapeResult.data);
              if (saveResult.success) {
                pageSuccessCount++;
                pageResults.push({
                  success: true,
                  data: scrapeResult.data,
                });
                if (config.verbose) {
                  console.log(`  ✓ ${repo.name} (${scrapeResult.data.scriptId}) を保存しました`);
                }
              } else {
                pageResults.push({
                  success: false,
                  error: `DB保存エラー: ${saveResult.error || '不明なエラー'} (${repo.name})`,
                });
                if (config.verbose) {
                  console.log(`  ✗ ${repo.name} の保存に失敗: ${saveResult.error}`);
                }
              }

              // レート制限対策
              await new Promise(resolve =>
                setTimeout(resolve, config.rateLimit.delayBetweenRequests)
              );
            } catch (error) {
              pageResults.push({
                success: false,
                error: `${repo.name}: ${error instanceof Error ? error.message : 'スクレイピングに失敗しました'}`,
              });
            }
          }

          // ページ結果をまとめる
          allResults.push(...pageResults);
          totalProcessedCount += searchResult.repositories.length;

          if (config.verbose) {
            console.log(
              `ページ ${currentPage} 完了: 成功 ${pageSuccessCount}件, 重複 ${pageDuplicateCount}件, エラー ${pageResults.filter(r => !r.success).length - pageDuplicateCount}件`
            );
          }

          // ページ間の待機時間
          if (currentPage < endPage) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error) {
          const errorMessage = `ページ ${currentPage} 処理エラー: ${error instanceof Error ? error.message : '不明なエラー'}`;
          allResults.push({
            success: false,
            error: errorMessage,
          });
          if (config.verbose) {
            console.log(`  ✗ ${errorMessage}`);
          }
        }
      }

      const successCount = allResults.filter(r => r.success).length;
      const errorCount = allResults.filter(r => !r.success).length;

      if (config.verbose) {
        console.log(
          `\n=== 全ページ処理完了 ===\n成功: ${successCount}件, エラー: ${errorCount}件, 重複: ${totalDuplicateCount}件, 総処理数: ${totalProcessedCount}件`
        );
      }

      return {
        success: successCount > 0,
        results: allResults,
        total: totalProcessedCount,
        successCount,
        errorCount,
        duplicateCount: totalDuplicateCount,
      };
    } catch (error) {
      console.error('ページ範囲一括検索・保存エラー:', error);
      return {
        success: false,
        results: [
          {
            success: false,
            error:
              error instanceof Error ? error.message : 'ページ範囲一括検索・保存に失敗しました',
          },
        ],
        total: totalProcessedCount,
        successCount: 0,
        errorCount: 1,
        duplicateCount: totalDuplicateCount,
      };
    }
  }
}
