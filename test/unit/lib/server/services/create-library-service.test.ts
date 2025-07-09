import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { ERROR_MESSAGES } from '../../../../../src/lib/constants/error-messages.js';
import { db, testConnection } from '../../../../../src/lib/server/db/index.js';
import { CreateLibraryService } from '../../../../../src/lib/server/services/create-library-service.js';
import { FetchGithubLicenseService } from '../../../../../src/lib/server/services/fetch-github-license-service.js';
import { FetchGithubRepoService } from '../../../../../src/lib/server/services/fetch-github-repo-service.js';
import { GenerateLibrarySummaryService } from '../../../../../src/lib/server/services/generate-library-summary-service.js';
import { SaveLibrarySummaryService } from '../../../../../src/lib/server/services/save-library-summary-service.js';
import { GitHubApiUtils } from '../../../../../src/lib/server/utils/github-api-utils.js';
import { LibrarySummaryTestDataFactories } from '../../../../factories/index.js';

// モックを設定
vi.mock('../../../../../src/lib/server/db/index.js');
vi.mock('../../../../../src/lib/server/services/fetch-github-repo-service.js');
vi.mock('../../../../../src/lib/server/services/fetch-github-license-service.js');
vi.mock('../../../../../src/lib/server/utils/github-api-utils.js');
vi.mock('../../../../../src/lib/server/services/generate-library-summary-service.js');
vi.mock('../../../../../src/lib/server/services/save-library-summary-service.js');

const mockDb = vi.mocked(db);
const mockTestConnection = vi.mocked(testConnection);
const mockFetchGithubRepoService = vi.mocked(FetchGithubRepoService);
const mockFetchGithubLicenseService = vi.mocked(FetchGithubLicenseService);
const mockGitHubApiUtils = vi.mocked(GitHubApiUtils);
const mockGenerateLibrarySummaryService = vi.mocked(GenerateLibrarySummaryService);
const mockSaveLibrarySummaryService = vi.mocked(SaveLibrarySummaryService);

describe('CreateLibraryService', () => {
  const mockParams = {
    scriptId: 'TEST_SCRIPT_ID',
    repoUrl: 'owner/repo',
  };

  const mockRepoInfo = {
    name: 'Test Library',
    repositoryUrl: 'https://github.com/owner/repo',
    authorUrl: 'https://github.com/owner',
    authorName: 'owner',
    description: 'Test description',
    starCount: 100,
  };

  const mockLicenseInfo = {
    type: 'MIT',
    url: 'https://example.com/license',
  };

  const mockLastCommitAt = new Date('2024-01-01T00:00:00Z');

  beforeEach(() => {
    vi.clearAllMocks();

    // デフォルトのモック設定
    mockTestConnection.mockResolvedValue(true);
    mockFetchGithubRepoService.call.mockResolvedValue(mockRepoInfo);
    mockFetchGithubLicenseService.call.mockResolvedValue(mockLicenseInfo);
    mockGitHubApiUtils.fetchLastCommitDate.mockResolvedValue(mockLastCommitAt);
    mockGitHubApiUtils.parseGitHubUrl.mockReturnValue({ owner: 'owner', repo: 'repo' });

    // データベースモックの設定
    const mockSelect = vi.fn();
    const mockFrom = vi.fn();
    const mockWhere = vi.fn();
    const mockLimit = vi.fn();
    const mockInsert = vi.fn();
    const mockValues = vi.fn();

    mockSelect.mockReturnValue({ from: mockFrom });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockWhere.mockReturnValue({ limit: mockLimit });
    mockLimit.mockResolvedValue([]); // 重複なしの場合

    mockInsert.mockReturnValue({ values: mockValues });
    mockValues.mockResolvedValue(undefined);

    mockDb.select = mockSelect;
    mockDb.insert = mockInsert;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('新規ライブラリ作成時にAI要約が生成される', async () => {
    // AI要約生成のモック設定
    const mockSummary = LibrarySummaryTestDataFactories.default.build();
    mockGenerateLibrarySummaryService.call.mockResolvedValue(mockSummary);
    mockSaveLibrarySummaryService.call.mockResolvedValue(undefined);

    // ライブラリ作成を実行
    const result = await CreateLibraryService.call(mockParams);

    // 基本的なライブラリ作成が正常に実行されたことを確認
    expect(mockTestConnection).toHaveBeenCalledOnce();
    expect(mockFetchGithubRepoService.call).toHaveBeenCalledWith('owner', 'repo');
    expect(mockFetchGithubLicenseService.call).toHaveBeenCalledWith('owner', 'repo');
    expect(mockGitHubApiUtils.fetchLastCommitDate).toHaveBeenCalledWith('owner', 'repo');

    // AI要約生成が呼び出されたことを確認
    expect(mockGenerateLibrarySummaryService.call).toHaveBeenCalledWith({
      githubUrl: 'https://github.com/owner/repo',
    });

    // AI要約保存が呼び出されたことを確認
    expect(mockSaveLibrarySummaryService.call).toHaveBeenCalledWith(
      expect.any(String), // ライブラリID
      mockSummary
    );

    // ライブラリIDが返されることを確認
    expect(result).toEqual(expect.any(String));
  });

  test('AI要約生成でエラーが発生してもライブラリ作成は続行される', async () => {
    // AI要約生成でエラーを発生させる
    mockGenerateLibrarySummaryService.call.mockRejectedValue(new Error('AI要約生成エラー'));
    mockGitHubApiUtils.parseGitHubUrl.mockReturnValue({ owner: 'owner', repo: 'repo' });

    // ライブラリ作成を実行
    const result = await CreateLibraryService.call(mockParams);

    // ライブラリ作成は成功することを確認
    expect(result).toEqual(expect.any(String));

    // AI要約生成が試行されたことを確認
    expect(mockGenerateLibrarySummaryService.call).toHaveBeenCalledWith({
      githubUrl: 'https://github.com/owner/repo',
    });

    // AI要約保存は呼び出されないことを確認
    expect(mockSaveLibrarySummaryService.call).not.toHaveBeenCalled();
  });

  test('AI要約保存でエラーが発生してもライブラリ作成は続行される', async () => {
    // AI要約生成は成功させる
    const mockSummary = LibrarySummaryTestDataFactories.default.build();
    mockGenerateLibrarySummaryService.call.mockResolvedValue(mockSummary);
    mockGitHubApiUtils.parseGitHubUrl.mockReturnValue({ owner: 'owner', repo: 'repo' });

    // AI要約保存でエラーを発生させる
    mockSaveLibrarySummaryService.call.mockRejectedValue(new Error('AI要約保存エラー'));

    // ライブラリ作成を実行
    const result = await CreateLibraryService.call(mockParams);

    // ライブラリ作成は成功することを確認
    expect(result).toEqual(expect.any(String));

    // AI要約生成と保存が試行されたことを確認
    expect(mockGenerateLibrarySummaryService.call).toHaveBeenCalledWith({
      githubUrl: 'https://github.com/owner/repo',
    });
    expect(mockSaveLibrarySummaryService.call).toHaveBeenCalledWith(
      expect.any(String),
      mockSummary
    );
  });

  test('データベース接続に失敗した場合はエラーをスローする', async () => {
    mockTestConnection.mockResolvedValue(false);
    mockGitHubApiUtils.parseGitHubUrl.mockReturnValue({ owner: 'owner', repo: 'repo' });

    await expect(CreateLibraryService.call(mockParams)).rejects.toThrow(
      ERROR_MESSAGES.DATABASE_CONNECTION_FAILED
    );

    // AI要約生成は呼び出されないことを確認
    expect(mockGenerateLibrarySummaryService.call).not.toHaveBeenCalled();
  });

  test('重複するscriptIdが存在する場合はエラーをスローする', async () => {
    // 重複データが存在する場合のモック設定
    const mockSelect = vi.fn();
    const mockFrom = vi.fn();
    const mockWhere = vi.fn();
    const mockLimit = vi.fn();

    mockSelect.mockReturnValue({ from: mockFrom });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockWhere.mockReturnValue({ limit: mockLimit });
    mockLimit.mockResolvedValueOnce([{ id: 'existing-id' }]); // 重複データあり

    mockDb.select = mockSelect;
    mockGitHubApiUtils.parseGitHubUrl.mockReturnValue({ owner: 'owner', repo: 'repo' });

    await expect(CreateLibraryService.call(mockParams)).rejects.toThrow(
      ERROR_MESSAGES.SCRIPT_ID_ALREADY_REGISTERED
    );

    // AI要約生成は呼び出されないことを確認
    expect(mockGenerateLibrarySummaryService.call).not.toHaveBeenCalled();
  });

  test('最終コミット日時の取得に失敗した場合はエラーをスローする', async () => {
    mockGitHubApiUtils.fetchLastCommitDate.mockResolvedValue(null);
    mockGitHubApiUtils.parseGitHubUrl.mockReturnValue({ owner: 'owner', repo: 'repo' });

    await expect(CreateLibraryService.call(mockParams)).rejects.toThrow(
      ERROR_MESSAGES.LAST_COMMIT_DATE_FETCH_FAILED
    );

    // AI要約生成は呼び出されないことを確認
    expect(mockGenerateLibrarySummaryService.call).not.toHaveBeenCalled();
  });
});
