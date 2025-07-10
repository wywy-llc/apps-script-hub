import { GitHubApiUtils } from '$lib/server/utils/github-api-utils.js';
import { ServiceErrorUtil } from '$lib/server/utils/service-error-util.js';
import { FetchGithubLicenseService } from './fetch-github-license-service.js';

/**
 * GitHubリポジトリデータ取得サービス
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

export class FetchGitHubRepoDataService {
  /**
   * GitHubリポジトリの完全なデータを取得
   *
   * 使用例:
   * ```typescript
   * const repoData = await FetchGitHubRepoDataService.call('owner', 'repo');
   * console.log(repoData.repoInfo.name); // リポジトリ名
   * console.log(repoData.licenseInfo.type); // ライセンス種別
   * ```
   *
   * 動作原理:
   * 1. GitHubAPIからリポジトリ情報、ライセンス情報、最終コミット日時を並列取得
   * 2. 取得したデータを統一されたフォーマットに変換
   * 3. 最終コミット日時が取得できない場合はエラーを投げる
   *
   * @param owner リポジトリオーナー名
   * @param repo リポジトリ名
   * @returns リポジトリの完全なデータ
   */
  public static async call(owner: string, repo: string): Promise<GitHubRepoData> {
    const [repoInfo, licenseInfo, lastCommitAt] = await Promise.all([
      GitHubApiUtils.fetchRepositoryInfo(owner, repo),
      FetchGithubLicenseService.call(owner, repo),
      GitHubApiUtils.fetchLastCommitDate(owner, repo),
    ]);

    ServiceErrorUtil.assertCondition(
      !!lastCommitAt,
      'Failed to fetch last commit date.',
      'FetchGitHubRepoDataService.call'
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
}
