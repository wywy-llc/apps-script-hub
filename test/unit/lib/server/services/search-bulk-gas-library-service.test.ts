import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { ScrapeGASLibraryService } from '../../../../../src/lib/server/services/scrape-gas-library-service.js';
import { SearchBulkGASLibraryService } from '../../../../../src/lib/server/services/search-bulk-gas-library-service.js';
import { GitHubApiUtils } from '../../../../../src/lib/server/utils/github-api-utils.js';
import type { TagSearchResult } from '../../../../../src/lib/types/github-scraper.js';
import {
  GitHubRepositoryTestDataFactories,
  ScrapeResultTestDataFactories,
  ScraperConfigTestDataFactories,
} from '../../../../factories/index.js';

// モックの設定
vi.mock('../../../../../src/lib/server/utils/github-api-utils.js');
vi.mock('../../../../../src/lib/server/services/scrape-gas-library-service.js');

const mockedGitHubApiUtils = vi.mocked(GitHubApiUtils);
const mockedScrapeGASLibraryService = vi.mocked(ScrapeGASLibraryService);

describe('SearchBulkGASLibraryService', () => {
  const mockConfig = ScraperConfigTestDataFactories.default.build();
  const testRepo1 = GitHubRepositoryTestDataFactories.default.build();
  const testRepo2 = GitHubRepositoryTestDataFactories.oauthLibrary.build();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('call', () => {
    test('正常な検索結果で一括スクレイピングを実行できる', async () => {
      // GitHub検索のモック
      const mockSearchResult: TagSearchResult = {
        success: true,
        repositories: [testRepo1, testRepo2],
        totalFound: 2,
        processedCount: 2,
      };
      mockedGitHubApiUtils.searchRepositoriesByTags.mockResolvedValue(mockSearchResult);

      // スクレイピング結果のモック
      const mockScrapeResult1 = ScrapeResultTestDataFactories.success.build();
      const mockScrapeResult2 = ScrapeResultTestDataFactories.successWithOAuth.build();

      mockedScrapeGASLibraryService.call
        .mockResolvedValueOnce(mockScrapeResult1)
        .mockResolvedValueOnce(mockScrapeResult2);

      // テスト実行
      const promise = SearchBulkGASLibraryService.call(2, undefined, mockConfig);

      // タイマーを進めてレート制限の待機時間をスキップ
      await vi.advanceTimersByTimeAsync(200);

      const result = await promise;

      // 検証
      expect(mockedGitHubApiUtils.searchRepositoriesByTags).toHaveBeenCalledWith(mockConfig, 2);
      expect(mockedScrapeGASLibraryService.call).toHaveBeenCalledTimes(2);
      expect(mockedScrapeGASLibraryService.call).toHaveBeenNthCalledWith(1, testRepo1.html_url);
      expect(mockedScrapeGASLibraryService.call).toHaveBeenNthCalledWith(2, testRepo2.html_url);

      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.successCount).toBe(2);
      expect(result.errorCount).toBe(0);
      expect(result.duplicateCount).toBe(0);
    });

    test('重複チェック機能が正常に動作する', async () => {
      // GitHub検索のモック
      const mockSearchResult: TagSearchResult = {
        success: true,
        repositories: [testRepo1],
        totalFound: 1,
        processedCount: 1,
      };
      mockedGitHubApiUtils.searchRepositoriesByTags.mockResolvedValue(mockSearchResult);

      // スクレイピング結果のモック（成功）
      const mockScrapeResult = ScrapeResultTestDataFactories.success.build();
      mockedScrapeGASLibraryService.call.mockResolvedValue(mockScrapeResult);

      // 重複チェック関数（重複と判定）
      const duplicateChecker = vi.fn().mockResolvedValue(true);

      // テスト実行
      const promise = SearchBulkGASLibraryService.call(1, duplicateChecker, mockConfig);
      await vi.advanceTimersByTimeAsync(100);
      const result = await promise;

      // 検証
      expect(duplicateChecker).toHaveBeenCalledWith(mockScrapeResult.data!.scriptId);
      expect(result.success).toBe(false);
      expect(result.results).toHaveLength(0); // 重複でスキップされたため結果なし
      expect(result.duplicateCount).toBe(1);
      expect(result.successCount).toBe(0);
      expect(result.errorCount).toBe(0);
    });

    test('スクレイピングエラーを適切に処理する', async () => {
      // GitHub検索のモック
      const mockSearchResult: TagSearchResult = {
        success: true,
        repositories: [testRepo1, testRepo2],
        totalFound: 2,
        processedCount: 2,
      };
      mockedGitHubApiUtils.searchRepositoriesByTags.mockResolvedValue(mockSearchResult);

      // スクレイピング結果のモック（1つ目は成功、2つ目はエラー）
      const mockScrapeResult = ScrapeResultTestDataFactories.success.build();

      mockedScrapeGASLibraryService.call
        .mockResolvedValueOnce(mockScrapeResult)
        .mockRejectedValueOnce(new Error('スクレイピングに失敗しました'));

      // テスト実行
      const promise = SearchBulkGASLibraryService.call(2, undefined, mockConfig);
      await vi.advanceTimersByTimeAsync(200);
      const result = await promise;

      // 検証
      expect(result.success).toBe(true); // 1つでも成功すればtrue
      expect(result.results).toHaveLength(2);
      expect(result.successCount).toBe(1);
      expect(result.errorCount).toBe(1);
      expect(result.results[1].success).toBe(false);
      expect(result.results[1].error).toContain(testRepo2.name + ': スクレイピングに失敗しました');
    });

    test('GitHub検索が失敗した場合のエラーハンドリング', async () => {
      // GitHub検索のモック（失敗）
      const mockSearchResult: TagSearchResult = {
        success: false,
        repositories: [],
        totalFound: 0,
        processedCount: 0,
        error: 'GitHub API Error: 403 Forbidden',
      };
      mockedGitHubApiUtils.searchRepositoriesByTags.mockResolvedValue(mockSearchResult);

      // テスト実行
      const result = await SearchBulkGASLibraryService.call(10, undefined, mockConfig);

      // 検証
      expect(result.success).toBe(false);
      expect(result.results).toHaveLength(1);
      expect(result.results[0].success).toBe(false);
      expect(result.results[0].error).toBe('GitHub API Error: 403 Forbidden');
      expect(result.total).toBe(0);
      expect(result.successCount).toBe(0);
      expect(result.errorCount).toBe(1);
      expect(result.duplicateCount).toBe(0);
    });

    test('デフォルトパラメータで実行できる', async () => {
      const mockSearchResult: TagSearchResult = {
        success: true,
        repositories: [],
        totalFound: 0,
        processedCount: 0,
      };
      mockedGitHubApiUtils.searchRepositoriesByTags.mockResolvedValue(mockSearchResult);

      // テスト実行（全パラメータデフォルト）
      const result = await SearchBulkGASLibraryService.call();

      // 検証
      expect(mockedGitHubApiUtils.searchRepositoriesByTags).toHaveBeenCalledWith(
        expect.objectContaining({
          gasTags: expect.arrayContaining(['google-apps-script']),
          verbose: true,
        }),
        10
      );
      expect(result.success).toBe(false); // 結果が0件なのでfalse
      expect(result.total).toBe(0);
    });
  });

  describe('callWithPageRange', () => {
    test('ページ範囲指定で検索・スクレイピングを実行できる', async () => {
      // GitHub検索のモック
      const mockSearchResult: TagSearchResult = {
        success: true,
        repositories: [testRepo1],
        totalFound: 1,
        processedCount: 1,
      };
      mockedGitHubApiUtils.searchRepositoriesByPageRange.mockResolvedValue(mockSearchResult);

      // スクレイピング結果のモック
      const mockScrapeResult = ScrapeResultTestDataFactories.success.build();
      mockedScrapeGASLibraryService.call.mockResolvedValue(mockScrapeResult);

      // テスト実行
      const promise = SearchBulkGASLibraryService.callWithPageRange(
        1,
        2,
        10,
        undefined,
        'stars',
        mockConfig
      );
      await vi.advanceTimersByTimeAsync(100);
      const result = await promise;

      // 検証
      expect(mockedGitHubApiUtils.searchRepositoriesByPageRange).toHaveBeenCalledWith(
        mockConfig,
        1,
        2,
        10,
        'stars'
      );
      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(1);
      expect(result.successCount).toBe(1);
    });
  });
});
