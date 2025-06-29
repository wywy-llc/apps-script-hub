import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { BulkGASLibrarySearchService } from '../../../../../src/lib/server/services/bulk-gas-library-search-service.js';
import { GASLibraryScraper } from '../../../../../src/lib/server/services/gas-library-scraper.js';
import { GitHubApiUtils } from '../../../../../src/lib/server/utils/github-api-utils.js';
import type {
  GitHubRepository,
  ScrapeResult,
  ScraperConfig,
  TagSearchResult,
} from '../../../../../src/lib/types/github-scraper.js';
import { LibraryTestDataFactories } from '../../../../factories/library-test-data.factory.js';

// モックの設定
vi.mock('../../../../../src/lib/server/utils/github-api-utils.js');
vi.mock('../../../../../src/lib/server/services/gas-library-scraper.js');

const mockedGitHubApiUtils = vi.mocked(GitHubApiUtils);
const mockedGASLibraryScraper = vi.mocked(GASLibraryScraper);

describe('BulkGASLibrarySearchService', () => {
  const mockConfig: ScraperConfig = {
    gasTags: ['google-apps-script', 'apps-script'],
    scriptIdPatterns: [],
    rateLimit: { maxRequestsPerHour: 60, delayBetweenRequests: 100 }, // テスト用に短縮
    verbose: false,
  };

  const testRepo1: GitHubRepository = {
    name: 'test-repo-1',
    description: 'Test repository 1',
    html_url: 'https://github.com/test/repo1',
    clone_url: 'https://github.com/test/repo1.git',
    stargazers_count: 10,
    owner: {
      login: 'test',
      html_url: 'https://github.com/test',
    },
    license: {
      name: 'MIT',
      url: 'https://github.com/test/repo1/blob/main/LICENSE',
    },
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-12-01T00:00:00Z',
  };

  const testRepo2: GitHubRepository = {
    name: 'test-repo-2',
    description: 'Test repository 2',
    html_url: 'https://github.com/test/repo2',
    clone_url: 'https://github.com/test/repo2.git',
    stargazers_count: 20,
    owner: {
      login: 'test',
      html_url: 'https://github.com/test',
    },
    license: {
      name: 'Apache-2.0',
      url: 'https://github.com/test/repo2/blob/main/LICENSE',
    },
    created_at: '2023-02-01T00:00:00Z',
    updated_at: '2023-12-02T00:00:00Z',
  };

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
      const testData1 = LibraryTestDataFactories.default.build();
      const testData2 = LibraryTestDataFactories.alternative.build();

      // GitHub検索のモック
      const mockSearchResult: TagSearchResult = {
        success: true,
        repositories: [testRepo1, testRepo2],
        totalFound: 2,
        processedCount: 2,
      };
      mockedGitHubApiUtils.searchRepositoriesByTags.mockResolvedValue(mockSearchResult);

      // スクレイピング結果のモック
      const mockScrapeResult1: ScrapeResult = {
        success: true,
        data: {
          name: testData1.name,
          scriptId: testData1.scriptId!,
          repositoryUrl: testData1.repositoryUrl,
          authorUrl: testData1.authorUrl,
          authorName: testData1.authorName,
          description: testData1.description || '',
          readmeContent: testData1.readmeContent,
          licenseType: testData1.licenseType,
          licenseUrl: testData1.licenseUrl,
          starCount: testData1.starCount,
          lastCommitAt: new Date('2023-12-01T00:00:00Z'),
          status: 'pending',
        },
      };

      const mockScrapeResult2: ScrapeResult = {
        success: true,
        data: {
          name: testData2.name,
          scriptId: testData2.scriptId!,
          repositoryUrl: testData2.repositoryUrl,
          authorUrl: testData2.authorUrl,
          authorName: testData2.authorName,
          description: testData2.description || '',
          readmeContent: testData2.readmeContent,
          licenseType: testData2.licenseType,
          licenseUrl: testData2.licenseUrl,
          starCount: testData2.starCount,
          lastCommitAt: new Date('2023-12-02T00:00:00Z'),
          status: 'pending',
        },
      };

      mockedGASLibraryScraper.call
        .mockResolvedValueOnce(mockScrapeResult1)
        .mockResolvedValueOnce(mockScrapeResult2);

      // テスト実行
      const promise = BulkGASLibrarySearchService.call(2, undefined, mockConfig);

      // タイマーを進めてレート制限の待機時間をスキップ
      await vi.advanceTimersByTimeAsync(200);

      const result = await promise;

      // 検証
      expect(mockedGitHubApiUtils.searchRepositoriesByTags).toHaveBeenCalledWith(mockConfig, 2);
      expect(mockedGASLibraryScraper.call).toHaveBeenCalledTimes(2);
      expect(mockedGASLibraryScraper.call).toHaveBeenNthCalledWith(1, testRepo1.html_url);
      expect(mockedGASLibraryScraper.call).toHaveBeenNthCalledWith(2, testRepo2.html_url);

      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.successCount).toBe(2);
      expect(result.errorCount).toBe(0);
      expect(result.duplicateCount).toBe(0);
    });

    test('重複チェック機能が正常に動作する', async () => {
      const testData = LibraryTestDataFactories.default.build();

      // GitHub検索のモック
      const mockSearchResult: TagSearchResult = {
        success: true,
        repositories: [testRepo1],
        totalFound: 1,
        processedCount: 1,
      };
      mockedGitHubApiUtils.searchRepositoriesByTags.mockResolvedValue(mockSearchResult);

      // スクレイピング結果のモック（成功）
      const mockScrapeResult: ScrapeResult = {
        success: true,
        data: {
          name: testData.name,
          scriptId: testData.scriptId!,
          repositoryUrl: testData.repositoryUrl,
          authorUrl: testData.authorUrl,
          authorName: testData.authorName,
          description: testData.description || '',
          lastCommitAt: new Date('2023-01-01T00:00:00Z'),
          status: 'pending',
        },
      };
      mockedGASLibraryScraper.call.mockResolvedValue(mockScrapeResult);

      // 重複チェック関数（重複と判定）
      const duplicateChecker = vi.fn().mockResolvedValue(true);

      // テスト実行
      const promise = BulkGASLibrarySearchService.call(1, duplicateChecker, mockConfig);
      await vi.advanceTimersByTimeAsync(100);
      const result = await promise;

      // 検証
      expect(duplicateChecker).toHaveBeenCalledWith(testData.scriptId);
      expect(result.success).toBe(false);
      expect(result.results).toHaveLength(1);
      expect(result.results[0].success).toBe(false);
      expect(result.results[0].error).toContain('重複');
      expect(result.duplicateCount).toBe(1);
      expect(result.successCount).toBe(0);
      expect(result.errorCount).toBe(1);
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
      const mockScrapeResult: ScrapeResult = {
        success: true,
        data: {
          name: 'test',
          scriptId: 'test-script-id',
          repositoryUrl: 'https://github.com/test/repo1',
          authorUrl: 'https://github.com/test',
          authorName: 'test',
          description: 'test description',
          lastCommitAt: new Date('2023-01-01T00:00:00Z'),
          status: 'pending',
        },
      };

      mockedGASLibraryScraper.call
        .mockResolvedValueOnce(mockScrapeResult)
        .mockRejectedValueOnce(new Error('スクレイピングに失敗しました'));

      // テスト実行
      const promise = BulkGASLibrarySearchService.call(2, undefined, mockConfig);
      await vi.advanceTimersByTimeAsync(200);
      const result = await promise;

      // 検証
      expect(result.success).toBe(true); // 1つでも成功すればtrue
      expect(result.results).toHaveLength(2);
      expect(result.successCount).toBe(1);
      expect(result.errorCount).toBe(1);
      expect(result.results[1].success).toBe(false);
      expect(result.results[1].error).toContain('test-repo-2: スクレイピングに失敗しました');
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
      const result = await BulkGASLibrarySearchService.call(10, undefined, mockConfig);

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

    test('予期しないエラーのハンドリング', async () => {
      // GitHub検索でエラーをスロー
      mockedGitHubApiUtils.searchRepositoriesByTags.mockRejectedValue(
        new Error('ネットワークエラー')
      );

      // テスト実行
      const result = await BulkGASLibrarySearchService.call(10, undefined, mockConfig);

      // 検証
      expect(result.success).toBe(false);
      expect(result.results).toHaveLength(1);
      expect(result.results[0].success).toBe(false);
      expect(result.results[0].error).toBe('ネットワークエラー');
      expect(result.total).toBe(0);
      expect(result.successCount).toBe(0);
      expect(result.errorCount).toBe(1);
      expect(result.duplicateCount).toBe(0);
    });

    test('verboseモードでログが出力される', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // GitHub検索のモック
      const mockSearchResult: TagSearchResult = {
        success: true,
        repositories: [testRepo1],
        totalFound: 10,
        processedCount: 1,
      };
      mockedGitHubApiUtils.searchRepositoriesByTags.mockResolvedValue(mockSearchResult);

      const mockScrapeResult: ScrapeResult = {
        success: true,
        data: {
          name: 'test',
          scriptId: 'test-script-id',
          repositoryUrl: 'https://github.com/test/repo1',
          authorUrl: 'https://github.com/test',
          authorName: 'test',
          description: 'test description',
          lastCommitAt: new Date('2023-01-01T00:00:00Z'),
          status: 'pending',
        },
      };
      mockedGASLibraryScraper.call.mockResolvedValue(mockScrapeResult);

      const verboseConfig = { ...mockConfig, verbose: true };

      // テスト実行
      const promise = BulkGASLibrarySearchService.call(1, undefined, verboseConfig);
      await vi.advanceTimersByTimeAsync(100);
      await promise;

      // 検証
      expect(consoleSpy).toHaveBeenCalledWith('GitHub検索結果: 10件中1件を処理');

      consoleSpy.mockRestore();
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
      const result = await BulkGASLibrarySearchService.call();

      // 検証
      expect(mockedGitHubApiUtils.searchRepositoriesByTags).toHaveBeenCalledWith(
        expect.objectContaining({
          gasTags: expect.arrayContaining(['google-apps-script', 'apps-script']),
          verbose: true, // DEFAULT_SCRAPER_CONFIGではverbose: trueが設定されている
        }),
        10 // デフォルトのmaxResults
      );
      expect(result.success).toBe(false); // 結果が0件なのでfalse
      expect(result.total).toBe(0);
    });

    test('レート制限の待機時間が適用される', async () => {
      const mockSearchResult: TagSearchResult = {
        success: true,
        repositories: [testRepo1, testRepo2],
        totalFound: 2,
        processedCount: 2,
      };
      mockedGitHubApiUtils.searchRepositoriesByTags.mockResolvedValue(mockSearchResult);

      const mockScrapeResult: ScrapeResult = {
        success: true,
        data: {
          name: 'test',
          scriptId: 'test-script-id',
          repositoryUrl: 'https://github.com/test/repo',
          authorUrl: 'https://github.com/test',
          authorName: 'test',
          description: 'test description',
          lastCommitAt: new Date('2023-01-01T00:00:00Z'),
          status: 'pending',
        },
      };
      mockedGASLibraryScraper.call.mockResolvedValue(mockScrapeResult);

      const configWithDelay = {
        ...mockConfig,
        rateLimit: { maxRequestsPerHour: 60, delayBetweenRequests: 500 },
      };

      // テスト実行
      const promise = BulkGASLibrarySearchService.call(2, undefined, configWithDelay);

      // 非同期処理とタイマーを全て進める
      await vi.runAllTimersAsync();

      const result = await promise;

      // 検証
      expect(result.successCount).toBe(2);
      expect(mockedGASLibraryScraper.call).toHaveBeenCalledTimes(2);
    });
  });
});
