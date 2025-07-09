import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { ERROR_MESSAGES } from '../../../../../src/lib/constants/error-messages.js';
import { db, testConnection } from '../../../../../src/lib/server/db/index.js';
import {
  BaseAiSummaryManager,
  BaseGitHubOperations,
  BaseRepositoryService,
  BaseServiceErrorHandler,
} from '../../../../../src/lib/server/services/base/index.js';
import { CreateLibraryService } from '../../../../../src/lib/server/services/create-library-service.js';

// モックを設定
vi.mock('../../../../../src/lib/server/db/index.js');
vi.mock('../../../../../src/lib/server/services/base/index.js');

const mockDb = vi.mocked(db);
const mockTestConnection = vi.mocked(testConnection);
const mockBaseRepositoryService = vi.mocked(BaseRepositoryService);
const mockBaseGitHubOperations = vi.mocked(BaseGitHubOperations);
const mockBaseAiSummaryManager = vi.mocked(BaseAiSummaryManager);
const mockBaseServiceErrorHandler = vi.mocked(BaseServiceErrorHandler);

describe('CreateLibraryService', () => {
  const mockParams = {
    scriptId: 'TEST_SCRIPT_ID',
    repoUrl: 'owner/repo',
  };

  const mockRepoData = {
    repoInfo: {
      name: 'Test Library',
      repositoryUrl: 'https://github.com/owner/repo',
      authorUrl: 'https://github.com/owner',
      authorName: 'owner',
      description: 'Test description',
      starCount: 100,
    },
    licenseInfo: {
      type: 'MIT',
      url: 'https://example.com/license',
    },
    lastCommitAt: new Date('2024-01-01T00:00:00Z'),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // デフォルトのモック設定
    mockTestConnection.mockResolvedValue(true);
    mockBaseGitHubOperations.normalizeGitHubUrl.mockReturnValue('https://github.com/owner/repo');
    mockBaseGitHubOperations.parseGitHubUrl.mockReturnValue({ owner: 'owner', repo: 'repo' });
    mockBaseGitHubOperations.fetchFullRepoData.mockResolvedValue(mockRepoData);
    mockBaseRepositoryService.ensureMultipleUnique.mockResolvedValue(undefined);
    mockBaseAiSummaryManager.generateForNewLibrary.mockResolvedValue(undefined);
    mockBaseServiceErrorHandler.assertCondition.mockImplementation((condition, message) => {
      if (!condition) {
        throw new Error(message);
      }
    });

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
    // ライブラリ作成を実行
    const result = await CreateLibraryService.call(mockParams);

    // 基本的なライブラリ作成が正常に実行されたことを確認
    expect(mockTestConnection).toHaveBeenCalledOnce();
    expect(mockBaseGitHubOperations.normalizeGitHubUrl).toHaveBeenCalledWith('owner/repo');
    expect(mockBaseGitHubOperations.parseGitHubUrl).toHaveBeenCalledWith(
      'https://github.com/owner/repo'
    );
    expect(mockBaseGitHubOperations.fetchFullRepoData).toHaveBeenCalledWith('owner', 'repo');
    expect(mockBaseRepositoryService.ensureMultipleUnique).toHaveBeenCalledWith(expect.any(Array));

    // AI要約生成が呼び出されたことを確認
    expect(mockBaseAiSummaryManager.generateForNewLibrary).toHaveBeenCalledWith(
      expect.any(String),
      'https://github.com/owner/repo'
    );

    // 結果の検証
    expect(result).toEqual(expect.any(String));
  });

  test('AI要約生成でエラーが発生してもライブラリ作成は続行される', async () => {
    // AI要約生成でエラーを発生させる
    mockBaseAiSummaryManager.generateForNewLibrary.mockRejectedValue(new Error('AI要約生成エラー'));

    // ライブラリ作成を実行
    const result = await CreateLibraryService.call(mockParams);

    // ライブラリ作成は成功することを確認
    expect(result).toEqual(expect.any(String));

    // AI要約生成が試行されたことを確認
    expect(mockBaseAiSummaryManager.generateForNewLibrary).toHaveBeenCalledWith(
      expect.any(String),
      'https://github.com/owner/repo'
    );
  });

  test('AI要約保存でエラーが発生してもライブラリ作成は続行される', async () => {
    // AI要約生成でエラーを発生させる（保存時のエラーをシミュレート）
    mockBaseAiSummaryManager.generateForNewLibrary.mockRejectedValue(new Error('AI要約保存エラー'));

    // ライブラリ作成を実行
    const result = await CreateLibraryService.call(mockParams);

    // ライブラリ作成は成功することを確認
    expect(result).toEqual(expect.any(String));

    // AI要約生成が試行されたことを確認
    expect(mockBaseAiSummaryManager.generateForNewLibrary).toHaveBeenCalledWith(
      expect.any(String),
      'https://github.com/owner/repo'
    );
  });

  test('データベース接続に失敗した場合はエラーをスローする', async () => {
    mockTestConnection.mockResolvedValue(false);

    await expect(CreateLibraryService.call(mockParams)).rejects.toThrow(
      ERROR_MESSAGES.DATABASE_CONNECTION_FAILED
    );

    // AI要約生成は呼び出されないことを確認
    expect(mockBaseAiSummaryManager.generateForNewLibrary).not.toHaveBeenCalled();
  });

  test('重複するscriptIdが存在する場合はエラーをスローする', async () => {
    // 重複チェックでエラーを発生させる
    mockBaseRepositoryService.ensureMultipleUnique.mockRejectedValue(
      new Error(ERROR_MESSAGES.SCRIPT_ID_ALREADY_REGISTERED)
    );

    await expect(CreateLibraryService.call(mockParams)).rejects.toThrow(
      ERROR_MESSAGES.SCRIPT_ID_ALREADY_REGISTERED
    );

    // AI要約生成は呼び出されないことを確認
    expect(mockBaseAiSummaryManager.generateForNewLibrary).not.toHaveBeenCalled();
  });

  test('最終コミット日時の取得に失敗した場合はエラーをスローする', async () => {
    // fetchFullRepoDataでエラーを発生させる
    mockBaseGitHubOperations.fetchFullRepoData.mockRejectedValue(
      new Error('Failed to fetch last commit date.')
    );

    await expect(CreateLibraryService.call(mockParams)).rejects.toThrow(
      'Failed to fetch last commit date.'
    );

    // AI要約生成は呼び出されないことを確認
    expect(mockBaseAiSummaryManager.generateForNewLibrary).not.toHaveBeenCalled();
  });
});
