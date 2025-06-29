import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { GitHubApiUtils } from '../../../../../src/lib/server/utils/github-api-utils.js';
import { LibraryTestDataFactories } from '../../../../factories/library-test-data.factory.js';
import type {
  GitHubRepository,
  GitHubReadmeResponse,
  GitHubSearchResponse,
} from '../../../../../src/lib/types/github-scraper.js';

// fetchのモック
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('GitHubApiUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchRepositoryInfo', () => {
    test('正常なレスポンスでリポジトリ情報を取得できる', async () => {
      const testData = LibraryTestDataFactories.default.build();
      const mockRepoData: GitHubRepository = {
        name: testData.name,
        description: testData.description,
        html_url: testData.repositoryUrl,
        clone_url: testData.repositoryUrl + '.git',
        stargazers_count: testData.starCount || 0,
        owner: {
          login: testData.authorName,
          html_url: testData.authorUrl,
        },
        license: {
          name: testData.licenseType || 'MIT',
          url: testData.licenseUrl || '',
        },
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-12-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRepoData),
      });

      const result = await GitHubApiUtils.fetchRepositoryInfo(
        'googleworkspace',
        'apps-script-oauth2'
      );

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/googleworkspace/apps-script-oauth2'
      );
      expect(result).toEqual(mockRepoData);
    });

    test('404エラーの場合はエラーをスローする', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(GitHubApiUtils.fetchRepositoryInfo('nonexistent', 'repo')).rejects.toThrow(
        'GitHub API Error: 404 Not Found'
      );
    });

    test('500エラーの場合はエラーをスローする', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(GitHubApiUtils.fetchRepositoryInfo('test', 'repo')).rejects.toThrow(
        'GitHub API Error: 500 Internal Server Error'
      );
    });
  });

  describe('fetchReadme', () => {
    test('Base64エンコードされたREADMEを正常にデコードできる', async () => {
      const originalContent = '# Test README\n\nThis is a test.';
      const base64Content = btoa(originalContent);

      const mockReadmeData: GitHubReadmeResponse = {
        content: base64Content,
        encoding: 'base64',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockReadmeData),
      });

      const result = await GitHubApiUtils.fetchReadme('test', 'repo');

      expect(mockFetch).toHaveBeenCalledWith('https://api.github.com/repos/test/repo/readme');
      expect(result).toBe(originalContent);
    });

    test('テストファクトリーのREADMEコンテンツでテストできる', async () => {
      const testData = LibraryTestDataFactories.default.build();
      const base64Content = btoa(testData.readmeContent || '');

      const mockReadmeData: GitHubReadmeResponse = {
        content: base64Content,
        encoding: 'base64',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockReadmeData),
      });

      const result = await GitHubApiUtils.fetchReadme('googleworkspace', 'apps-script-oauth2');

      expect(result).toBe(testData.readmeContent);
    });

    test('Base64以外のエンコーディングの場合はそのまま返す', async () => {
      const mockReadmeData: GitHubReadmeResponse = {
        content: 'Raw content',
        encoding: 'utf-8',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockReadmeData),
      });

      const result = await GitHubApiUtils.fetchReadme('test', 'repo');

      expect(result).toBe('Raw content');
    });

    test('README が存在しない場合はundefinedを返す', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await GitHubApiUtils.fetchReadme('test', 'repo');

      expect(result).toBeUndefined();
    });

    test('API呼び出し中にエラーが発生した場合はundefinedを返す', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await GitHubApiUtils.fetchReadme('test', 'repo');

      expect(result).toBeUndefined();
    });
  });

  describe('searchRepositoriesByTags', () => {
    test('正常な検索結果を返す', async () => {
      const testData = LibraryTestDataFactories.default.build();
      const mockSearchResponse: GitHubSearchResponse = {
        total_count: 1,
        incomplete_results: false,
        items: [
          {
            name: testData.name,
            description: testData.description,
            html_url: testData.repositoryUrl,
            clone_url: testData.repositoryUrl + '.git',
            stargazers_count: testData.starCount || 0,
            owner: {
              login: testData.authorName,
              html_url: testData.authorUrl,
            },
            license: {
              name: testData.licenseType || 'MIT',
              url: testData.licenseUrl || '',
            },
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-12-01T00:00:00Z',
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSearchResponse),
      });

      const config = {
        gasTags: ['google-apps-script', 'apps-script'],
        scriptIdPatterns: [],
        rateLimit: { maxRequestsPerHour: 60, delayBetweenRequests: 1000 },
        verbose: false,
      };

      const result = await GitHubApiUtils.searchRepositoriesByTags(config, 10);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.github.com/search/repositories?q=')
      );
      expect(result.success).toBe(true);
      expect(result.repositories).toHaveLength(1);
      expect(result.totalFound).toBe(1);
      expect(result.processedCount).toBe(1);
    });

    test('検索クエリが正しく構築される', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ total_count: 0, incomplete_results: false, items: [] }),
      });

      const config = {
        gasTags: ['tag1', 'tag2', 'tag3'],
        scriptIdPatterns: [],
        rateLimit: { maxRequestsPerHour: 60, delayBetweenRequests: 1000 },
        verbose: false,
      };

      await GitHubApiUtils.searchRepositoriesByTags(config, 5);

      const expectedQuery = 'topic:tag1 OR topic:tag2 OR topic:tag3 language:javascript';
      const expectedUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(expectedQuery)}&sort=stars&order=desc&per_page=5`;

      expect(mockFetch).toHaveBeenCalledWith(expectedUrl);
    });

    test('maxResultsが100を超える場合は100に制限される', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ total_count: 0, incomplete_results: false, items: [] }),
      });

      const config = {
        gasTags: ['test'],
        scriptIdPatterns: [],
        rateLimit: { maxRequestsPerHour: 60, delayBetweenRequests: 1000 },
        verbose: false,
      };

      await GitHubApiUtils.searchRepositoriesByTags(config, 150);

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('per_page=100'));
    });

    test('verboseモードでコンソールログが出力される', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ total_count: 0, incomplete_results: false, items: [] }),
      });

      const config = {
        gasTags: ['test'],
        scriptIdPatterns: [],
        rateLimit: { maxRequestsPerHour: 60, delayBetweenRequests: 1000 },
        verbose: true,
      };

      await GitHubApiUtils.searchRepositoriesByTags(config);

      expect(consoleSpy).toHaveBeenCalledWith(
        'GitHub Search Query:',
        'topic:test language:javascript'
      );

      consoleSpy.mockRestore();
    });

    test('API エラーの場合は失敗レスポンスを返す', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      });

      const config = {
        gasTags: ['test'],
        scriptIdPatterns: [],
        rateLimit: { maxRequestsPerHour: 60, delayBetweenRequests: 1000 },
        verbose: false,
      };

      const result = await GitHubApiUtils.searchRepositoriesByTags(config);

      expect(result.success).toBe(false);
      expect(result.repositories).toHaveLength(0);
      expect(result.error).toContain('GitHub Search API Error: 403 Forbidden');
    });

    test('ネットワークエラーの場合は失敗レスポンスを返す', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const config = {
        gasTags: ['test'],
        scriptIdPatterns: [],
        rateLimit: { maxRequestsPerHour: 60, delayBetweenRequests: 1000 },
        verbose: false,
      };

      const result = await GitHubApiUtils.searchRepositoriesByTags(config);

      expect(result.success).toBe(false);
      expect(result.repositories).toHaveLength(0);
      expect(result.error).toBe('Network error');
    });
  });

  describe('parseGitHubUrl', () => {
    test('正常なGitHub URLをパースできる', () => {
      const url = 'https://github.com/googleworkspace/apps-script-oauth2';
      const result = GitHubApiUtils.parseGitHubUrl(url);

      expect(result).toEqual({
        owner: 'googleworkspace',
        repo: 'apps-script-oauth2',
      });
    });

    test('.git拡張子を除去する', () => {
      const url = 'https://github.com/owner/repo.git';
      const result = GitHubApiUtils.parseGitHubUrl(url);

      expect(result).toEqual({
        owner: 'owner',
        repo: 'repo',
      });
    });

    test('テストファクトリーのURLをパースできる', () => {
      const testData = LibraryTestDataFactories.default.build();
      const result = GitHubApiUtils.parseGitHubUrl(testData.repositoryUrl);

      expect(result).toEqual({
        owner: 'googleworkspace',
        repo: 'apps-script-oauth2',
      });
    });

    test('パスが深いURLもパースできる', () => {
      const url = 'https://github.com/owner/repo/blob/main/README.md';
      const result = GitHubApiUtils.parseGitHubUrl(url);

      expect(result).toEqual({
        owner: 'owner',
        repo: 'repo',
      });
    });

    test('github.com以外のホストの場合はnullを返す', () => {
      const url = 'https://gitlab.com/owner/repo';
      const result = GitHubApiUtils.parseGitHubUrl(url);

      expect(result).toBeNull();
    });

    test('パスが不十分な場合はnullを返す', () => {
      const url = 'https://github.com/owner';
      const result = GitHubApiUtils.parseGitHubUrl(url);

      expect(result).toBeNull();
    });

    test('無効なURLの場合はnullを返す', () => {
      const url = 'invalid-url';
      const result = GitHubApiUtils.parseGitHubUrl(url);

      expect(result).toBeNull();
    });

    test('空文字列の場合はnullを返す', () => {
      const url = '';
      const result = GitHubApiUtils.parseGitHubUrl(url);

      expect(result).toBeNull();
    });
  });
});
