import { GitHubApiUtils } from '$lib/server/utils/github-api-utils.js';
import { FetchGithubLicenseService } from '../fetch-github-license-service.js';
import { BaseServiceErrorHandler } from './service-error-handler.js';

/**
 * GitHub操作の共通インターフェース
 */
export interface GitHubRepoData {
  repoInfo: {
    name: string;
    repositoryUrl: string;
    authorUrl: string;
    authorName: string;
    description: string;
    starCount: number;
  };
  licenseInfo: {
    type: string;
    url: string;
  };
  lastCommitAt: Date;
}

/**
 * GitHub API操作の共通クラス
 * 重複するGitHub API呼び出しを統一化
 */
export class BaseGitHubOperations {
  /**
   * GitHubリポジトリの完全なデータを取得
   * @param owner リポジトリオーナー
   * @param repo リポジトリ名
   * @returns リポジトリの完全なデータ
   */
  static async fetchFullRepoData(owner: string, repo: string): Promise<GitHubRepoData> {
    const [repoInfo, licenseInfo, lastCommitAt] = await Promise.all([
      GitHubApiUtils.fetchRepositoryInfo(owner, repo),
      FetchGithubLicenseService.call(owner, repo),
      GitHubApiUtils.fetchLastCommitDate(owner, repo),
    ]);

    BaseServiceErrorHandler.assertCondition(
      !!lastCommitAt,
      'Failed to fetch last commit date.',
      'BaseGitHubOperations.fetchFullRepoData'
    );

    return {
      repoInfo: {
        name: repoInfo.name,
        repositoryUrl: repoInfo.html_url,
        authorUrl: `https://github.com/${repoInfo.owner.login}`,
        authorName: repoInfo.owner.login,
        description: repoInfo.description || '',
        starCount: repoInfo.stargazers_count || 0,
      },
      licenseInfo,
      lastCommitAt: lastCommitAt!,
    };
  }

  /**
   * GitHub URLからowner/repoを解析
   * @param url GitHub URL
   * @returns owner/repo情報
   */
  static parseGitHubUrl(url: string): { owner: string; repo: string } {
    const parsedUrl = GitHubApiUtils.parseGitHubUrl(url);
    BaseServiceErrorHandler.assertCondition(
      !!parsedUrl,
      'GitHub リポジトリURLが正しくありません',
      'BaseGitHubOperations.parseGitHubUrl'
    );
    return parsedUrl!;
  }

  /**
   * GitHub URLを正規化（https://github.com/を付与）
   * @param url GitHub URL
   * @returns 正規化されたURL
   */
  static normalizeGitHubUrl(url: string): string {
    return url.startsWith('https://github.com/') ? url : `https://github.com/${url}`;
  }

  /**
   * 複数のGitHubリポジトリのデータを並列取得
   * @param repos リポジトリ配列 [{owner, repo}]
   * @returns リポジトリデータ配列
   */
  static async fetchMultipleRepoData(
    repos: Array<{ owner: string; repo: string }>
  ): Promise<GitHubRepoData[]> {
    const promises = repos.map(({ owner, repo }) => this.fetchFullRepoData(owner, repo));
    return Promise.all(promises);
  }

  /**
   * README内容の取得
   * @param owner リポジトリオーナー
   * @param repo リポジトリ名
   * @returns README内容（取得失敗時はundefined）
   */
  static async fetchReadme(owner: string, repo: string): Promise<string | undefined> {
    return GitHubApiUtils.fetchReadme(owner, repo);
  }

  /**
   * リポジトリ情報とREADMEを同時取得
   * @param owner リポジトリオーナー
   * @param repo リポジトリ名
   * @returns リポジトリデータとREADME
   */
  static async fetchRepoDataWithReadme(
    owner: string,
    repo: string
  ): Promise<GitHubRepoData & { readme?: string }> {
    const [repoData, readme] = await Promise.all([
      this.fetchFullRepoData(owner, repo),
      this.fetchReadme(owner, repo),
    ]);

    return {
      ...repoData,
      readme,
    };
  }
}
