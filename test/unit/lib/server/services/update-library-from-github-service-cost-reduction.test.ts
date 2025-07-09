import { beforeEach, describe, expect, test, vi } from 'vitest';

// モック設定（変数宣言前にmockを定義）
vi.mock('../../../../../src/lib/server/db/index.js', () => ({
  db: {
    select: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('../../../../../src/lib/server/services/base/index.js', () => ({
  BaseRepositoryService: {
    findFirstOrThrow: vi.fn(),
  },
  BaseGitHubOperations: {
    parseGitHubUrl: vi.fn(),
    fetchFullRepoData: vi.fn(),
  },
  BaseAiSummaryManager: {
    exists: vi.fn(),
    generateForUpdate: vi.fn(),
    generateManual: vi.fn(),
  },
}));

// importを後に配置
import { db } from '../../../../../src/lib/server/db/index.js';
import {
  BaseAiSummaryManager,
  BaseGitHubOperations,
  BaseRepositoryService,
} from '../../../../../src/lib/server/services/base/index.js';
import { UpdateLibraryFromGithubService } from '../../../../../src/lib/server/services/update-library-from-github-service.js';

// モックされたインスタンスを取得
const mockDb = vi.mocked(db);
const mockBaseRepositoryService = vi.mocked(BaseRepositoryService);
const mockBaseGitHubOperations = vi.mocked(BaseGitHubOperations);
const mockBaseAiSummaryManager = vi.mocked(BaseAiSummaryManager);

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
    const mockSelectChain = {
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockLibraryData]),
        }),
      }),
    };
    mockDb.select.mockReturnValue(mockSelectChain as unknown as ReturnType<typeof mockDb.select>);

    const mockUpdateChain = {
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    };
    mockDb.update.mockReturnValue(mockUpdateChain as unknown as ReturnType<typeof mockDb.update>);

    // Base classのモック設定
    mockBaseRepositoryService.findFirstOrThrow.mockResolvedValue(mockLibraryData);
    mockBaseGitHubOperations.parseGitHubUrl.mockReturnValue({ owner: 'test', repo: 'repo' });
    mockBaseGitHubOperations.fetchFullRepoData.mockResolvedValue(mockRepoData);
    mockBaseAiSummaryManager.exists.mockResolvedValue(false);
    mockBaseAiSummaryManager.generateForUpdate.mockResolvedValue(undefined);
  });

  test('lastCommitAtが同じ場合、AI要約生成をスキップする', async () => {
    // lastCommitAtが既存のデータと同じ
    const repoDataForTest = {
      ...mockRepoData,
      lastCommitAt: sameLastCommitAt,
    };

    // library_summaryが既に存在する場合をシミュレート
    mockBaseAiSummaryManager.exists.mockResolvedValue(true);
    mockBaseGitHubOperations.fetchFullRepoData.mockResolvedValue(repoDataForTest);

    await UpdateLibraryFromGithubService.call(libraryId);

    // AI要約生成サービスが呼び出されないことを確認
    expect(mockBaseAiSummaryManager.generateForUpdate).not.toHaveBeenCalled();
  });

  test('lastCommitAtが異なる場合、AI要約生成を実行する', async () => {
    // lastCommitAtが既存のデータと異なる
    const repoDataForTest = {
      ...mockRepoData,
      lastCommitAt: newLastCommitAt,
    };

    // library_summaryが既に存在していてもlastCommitAtに変化がある場合は生成する
    mockBaseAiSummaryManager.exists.mockResolvedValue(true);
    mockBaseGitHubOperations.fetchFullRepoData.mockResolvedValue(repoDataForTest);

    await UpdateLibraryFromGithubService.call(libraryId);

    // AI要約生成サービスが呼び出されることを確認
    expect(mockBaseAiSummaryManager.generateForUpdate).toHaveBeenCalledWith(
      libraryId,
      repoDataForTest.repoInfo.repositoryUrl,
      'lastCommitAtが変更されたため'
    );
  });

  test('library_summaryが存在しない場合、lastCommitAtに変化がなくてもAI要約生成を実行する', async () => {
    // lastCommitAtが既存のデータと同じ
    const repoDataForTest = {
      ...mockRepoData,
      lastCommitAt: sameLastCommitAt,
    };

    // library_summaryが存在しない場合をシミュレート
    mockBaseAiSummaryManager.exists.mockResolvedValue(false);
    mockBaseGitHubOperations.fetchFullRepoData.mockResolvedValue(repoDataForTest);

    await UpdateLibraryFromGithubService.call(libraryId);

    // AI要約生成サービスが呼び出されることを確認
    expect(mockBaseAiSummaryManager.generateForUpdate).toHaveBeenCalledWith(
      libraryId,
      repoDataForTest.repoInfo.repositoryUrl,
      'library_summaryが存在しないため'
    );
  });
});
