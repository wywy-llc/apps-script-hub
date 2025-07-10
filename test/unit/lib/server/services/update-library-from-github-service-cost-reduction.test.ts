import { beforeEach, describe, expect, test, vi } from 'vitest';

// モック設定（変数宣言前にmockを定義）
vi.mock('../../../../../src/lib/server/db/index.js', () => ({
  db: {
    select: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('../../../../../src/lib/server/repositories/library-repository.js', () => ({
  LibraryRepository: {
    findById: vi.fn(),
  },
}));

vi.mock('../../../../../src/lib/server/repositories/library-summary-repository.js', () => ({
  LibrarySummaryRepository: {
    exists: vi.fn(),
  },
}));

vi.mock('../../../../../src/lib/server/services/fetch-github-repo-data-service.js', () => ({
  FetchGitHubRepoDataService: {
    call: vi.fn(),
  },
}));

vi.mock('../../../../../src/lib/server/services/generate-ai-summary-service.js', () => ({
  GenerateAiSummaryService: {
    call: vi.fn(),
  },
}));

vi.mock('../../../../../src/lib/server/utils/github-api-utils.js', () => ({
  GitHubApiUtils: {
    parseGitHubUrl: vi.fn(),
  },
}));

vi.mock('../../../../../src/lib/server/utils/service-error-util.js', () => ({
  ServiceErrorUtil: {
    assertCondition: vi.fn(),
  },
}));

// importを後に配置
import { db } from '../../../../../src/lib/server/db/index.js';
import { LibraryRepository } from '../../../../../src/lib/server/repositories/library-repository.js';
import { LibrarySummaryRepository } from '../../../../../src/lib/server/repositories/library-summary-repository.js';
import { FetchGitHubRepoDataService } from '../../../../../src/lib/server/services/fetch-github-repo-data-service.js';
import { GenerateAiSummaryService } from '../../../../../src/lib/server/services/generate-ai-summary-service.js';
import { UpdateLibraryFromGithubService } from '../../../../../src/lib/server/services/update-library-from-github-service.js';
import { GitHubApiUtils } from '../../../../../src/lib/server/utils/github-api-utils.js';
import { ServiceErrorUtil } from '../../../../../src/lib/server/utils/service-error-util.js';

// モックされたインスタンスを取得
const mockDb = vi.mocked(db);
const mockLibraryRepository = vi.mocked(LibraryRepository);
const mockLibrarySummaryRepository = vi.mocked(LibrarySummaryRepository);
const mockFetchGitHubRepoDataService = vi.mocked(FetchGitHubRepoDataService);
const mockGenerateAiSummaryService = vi.mocked(GenerateAiSummaryService);
const mockGitHubApiUtils = vi.mocked(GitHubApiUtils);
const mockServiceErrorUtil = vi.mocked(ServiceErrorUtil);

describe('UpdateLibraryFromGithubService - コスト削減機能', () => {
  const libraryId = 'test_lib_123';
  const existingLastCommitAt = new Date('2024-01-10T10:00:00Z');
  const sameLastCommitAt = new Date('2024-01-10T10:00:00Z');
  const newLastCommitAt = new Date('2024-01-15T10:00:00Z');

  const mockLibraryData = {
    id: libraryId,
    repositoryUrl: 'https://github.com/test/repo',
    lastCommitAt: existingLastCommitAt,
  };

  const mockRepoData = {
    repoInfo: {
      name: 'test-repo',
      description: 'Test repository',
      repositoryUrl: 'https://github.com/test/repo',
      authorName: 'test-owner',
      authorUrl: 'https://github.com/test-owner',
      starCount: 10,
    },
    licenseInfo: {
      type: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
    lastCommitAt: sameLastCommitAt,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // 基本的なモック設定
    const mockUpdateChain = {
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    };
    mockDb.update.mockReturnValue(mockUpdateChain as unknown as ReturnType<typeof mockDb.update>);

    // 新しい構造のモック設定
    mockLibraryRepository.findById.mockResolvedValue(mockLibraryData);
    mockGitHubApiUtils.parseGitHubUrl.mockReturnValue({ owner: 'test', repo: 'repo' });
    mockFetchGitHubRepoDataService.call.mockResolvedValue(mockRepoData);
    mockLibrarySummaryRepository.exists.mockResolvedValue(false);
    mockGenerateAiSummaryService.call.mockResolvedValue(undefined);
    mockServiceErrorUtil.assertCondition.mockImplementation(() => {});
  });

  test('lastCommitAtが同じ場合、AI要約生成をスキップする', async () => {
    // lastCommitAtが既存のデータと同じ
    const repoDataForTest = {
      ...mockRepoData,
      lastCommitAt: sameLastCommitAt,
    };

    // library_summaryが既に存在する場合をシミュレート
    mockLibrarySummaryRepository.exists.mockResolvedValue(true);
    mockFetchGitHubRepoDataService.call.mockResolvedValue(repoDataForTest);

    await UpdateLibraryFromGithubService.call(libraryId);

    // AI要約生成サービスが呼び出されないことを確認
    expect(mockGenerateAiSummaryService.call).not.toHaveBeenCalled();
  });

  test('lastCommitAtが異なる場合、AI要約生成を実行する', async () => {
    // lastCommitAtが既存のデータと異なる
    const repoDataForTest = {
      ...mockRepoData,
      lastCommitAt: newLastCommitAt,
    };

    // library_summaryが既に存在していてもlastCommitAtに変化がある場合は生成する
    mockLibrarySummaryRepository.exists.mockResolvedValue(true);
    mockFetchGitHubRepoDataService.call.mockResolvedValue(repoDataForTest);

    await UpdateLibraryFromGithubService.call(libraryId);

    // AI要約生成サービスが呼び出されることを確認
    expect(mockGenerateAiSummaryService.call).toHaveBeenCalledWith({
      libraryId,
      githubUrl: repoDataForTest.repoInfo.repositoryUrl,
      skipOnError: true,
      logContext: 'lastCommitAtが変更されたため',
    });
  });

  test('library_summaryが存在しない場合、lastCommitAtに変化がなくてもAI要約生成を実行する', async () => {
    // lastCommitAtが既存のデータと同じ
    const repoDataForTest = {
      ...mockRepoData,
      lastCommitAt: sameLastCommitAt,
    };

    // library_summaryが存在しない場合をシミュレート
    mockLibrarySummaryRepository.exists.mockResolvedValue(false);
    mockFetchGitHubRepoDataService.call.mockResolvedValue(repoDataForTest);

    await UpdateLibraryFromGithubService.call(libraryId);

    // AI要約生成サービスが呼び出されることを確認
    expect(mockGenerateAiSummaryService.call).toHaveBeenCalledWith({
      libraryId,
      githubUrl: repoDataForTest.repoInfo.repositoryUrl,
      skipOnError: true,
      logContext: 'library_summaryが存在しないため',
    });
  });
});
