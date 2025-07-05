import { beforeEach, describe, expect, test, vi } from 'vitest';

// モック設定（変数宣言前にmockを定義）
vi.mock('../../../../../src/lib/server/db/index.js', () => ({
  db: {
    select: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('../../../../../src/lib/server/services/generate-library-summary-service.js', () => ({
  GenerateLibrarySummaryService: {
    call: vi.fn(),
  },
}));

vi.mock('../../../../../src/lib/server/services/save-library-summary-service.js', () => ({
  SaveLibrarySummaryService: {
    call: vi.fn(),
    exists: vi.fn(),
  },
}));

vi.mock('../../../../../src/lib/server/services/fetch-github-license-service.js', () => ({
  FetchGithubLicenseService: {
    call: vi.fn(),
  },
}));

// importを後に配置
import { db } from '../../../../../src/lib/server/db/index.js';
import { FetchGithubLicenseService } from '../../../../../src/lib/server/services/fetch-github-license-service.js';
import { GenerateLibrarySummaryService } from '../../../../../src/lib/server/services/generate-library-summary-service.js';
import { SaveLibrarySummaryService } from '../../../../../src/lib/server/services/save-library-summary-service.js';
import { UpdateLibraryFromGithubService } from '../../../../../src/lib/server/services/update-library-from-github-service.js';

// モックされたインスタンスを取得
const mockDb = vi.mocked(db);
const mockGenerateLibrarySummaryService = vi.mocked(GenerateLibrarySummaryService);
const mockSaveLibrarySummaryService = vi.mocked(SaveLibrarySummaryService);
const mockFetchGithubLicenseService = vi.mocked(FetchGithubLicenseService);

// globalにfetchのモックを設定
const mockFetch = vi.fn();
global.fetch = mockFetch;

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
    name: 'test-repo',
    description: 'Test repository',
    owner: { login: 'test-owner' },
    html_url: 'https://github.com/test/repo',
    stargazers_count: 10,
    pushed_at: sameLastCommitAt.toISOString(),
  };

  const mockLicenseInfo = {
    type: 'MIT',
    url: 'https://opensource.org/licenses/MIT',
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

    mockFetchGithubLicenseService.call.mockResolvedValue(mockLicenseInfo);

    // SaveLibrarySummaryService.existsのデフォルトモック（library_summaryが存在しない前提）
    mockSaveLibrarySummaryService.exists.mockResolvedValue(false);
  });

  test('lastCommitAtが同じ場合、AI要約生成をスキップする', async () => {
    // pushed_atが既存のlastCommitAtと同じ
    const repoDataForTest = {
      ...mockRepoData,
      pushed_at: sameLastCommitAt.toISOString(),
      owner: { login: 'test-owner' }, // ownerオブジェクトを明示的に設定
    };

    // library_summaryが既に存在する場合をシミュレート
    mockSaveLibrarySummaryService.exists.mockResolvedValue(true);

    // このテスト用のfetchモックを設定
    const mockRepoResponse = {
      ok: true,
      json: () => Promise.resolve(repoDataForTest),
    };
    mockFetch.mockClear();
    mockFetch.mockResolvedValueOnce(mockRepoResponse as unknown as Response);

    await UpdateLibraryFromGithubService.call(libraryId);

    // AI要約生成サービスが呼び出されないことを確認
    expect(mockGenerateLibrarySummaryService.call).not.toHaveBeenCalled();
    expect(mockSaveLibrarySummaryService.call).not.toHaveBeenCalled();
  });

  test('lastCommitAtが異なる場合、AI要約生成を実行する', async () => {
    // pushed_atが既存のlastCommitAtと異なる
    const repoDataForTest = {
      ...mockRepoData,
      pushed_at: newLastCommitAt.toISOString(),
      owner: { login: 'test-owner' }, // ownerオブジェクトを明示的に設定
    };

    // library_summaryが既に存在していてもlastCommitAtに変化がある場合は生成する
    mockSaveLibrarySummaryService.exists.mockResolvedValue(true);

    // このテスト用のfetchモックを設定
    const mockRepoResponse = {
      ok: true,
      json: () => Promise.resolve(repoDataForTest),
    };
    mockFetch.mockClear();
    mockFetch.mockResolvedValueOnce(mockRepoResponse as unknown as Response);

    const mockSummary = {
      basicInfo: {
        libraryName: { ja: 'テストライブラリ', en: 'Test Library' },
        purpose: { ja: 'テスト用', en: 'For testing' },
        targetUsers: { ja: 'テスト開発者', en: 'Test developers' },
        tags: { ja: ['テスト'], en: ['test'] },
      },
      functionality: {
        coreProblem: { ja: 'テストの複雑さ', en: 'Testing complexity' },
        mainBenefits: [
          {
            title: { ja: 'シンプル', en: 'Simple' },
            description: { ja: '簡単', en: 'Easy' },
          },
        ],
      },
    };

    mockGenerateLibrarySummaryService.call.mockResolvedValue(mockSummary);
    mockSaveLibrarySummaryService.call.mockResolvedValue(undefined);

    await UpdateLibraryFromGithubService.call(libraryId);

    // AI要約生成サービスが呼び出されることを確認
    expect(mockGenerateLibrarySummaryService.call).toHaveBeenCalledWith({
      githubUrl: repoDataForTest.html_url,
    });
    expect(mockSaveLibrarySummaryService.call).toHaveBeenCalledWith(libraryId, mockSummary);
  });

  test('library_summaryが存在しない場合、lastCommitAtに変化がなくてもAI要約生成を実行する', async () => {
    // pushed_atが既存のlastCommitAtと同じ
    const repoDataForTest = {
      ...mockRepoData,
      pushed_at: sameLastCommitAt.toISOString(),
      owner: { login: 'test-owner' }, // ownerオブジェクトを明示的に設定
    };

    // library_summaryが存在しない場合をシミュレート
    mockSaveLibrarySummaryService.exists.mockResolvedValue(false);

    // このテスト用のfetchモックを設定
    const mockRepoResponse = {
      ok: true,
      json: () => Promise.resolve(repoDataForTest),
    };
    mockFetch.mockClear();
    mockFetch.mockResolvedValueOnce(mockRepoResponse as unknown as Response);

    const mockSummary = {
      basicInfo: {
        libraryName: { ja: 'テストライブラリ', en: 'Test Library' },
        purpose: { ja: 'テスト用', en: 'For testing' },
        targetUsers: { ja: 'テスト開発者', en: 'Test developers' },
        tags: { ja: ['テスト'], en: ['test'] },
      },
      functionality: {
        coreProblem: { ja: 'テストの複雑さ', en: 'Testing complexity' },
        mainBenefits: [
          {
            title: { ja: 'シンプル', en: 'Simple' },
            description: { ja: '簡単', en: 'Easy' },
          },
        ],
      },
    };

    mockGenerateLibrarySummaryService.call.mockResolvedValue(mockSummary);
    mockSaveLibrarySummaryService.call.mockResolvedValue(undefined);

    await UpdateLibraryFromGithubService.call(libraryId);

    // AI要約生成サービスが呼び出されることを確認
    expect(mockGenerateLibrarySummaryService.call).toHaveBeenCalledWith({
      githubUrl: repoDataForTest.html_url,
    });
    expect(mockSaveLibrarySummaryService.call).toHaveBeenCalledWith(libraryId, mockSummary);
  });
});
