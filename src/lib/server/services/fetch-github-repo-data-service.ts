import { LICENSE_TYPES, normalizeLicenseName } from '$lib/constants/license-types.js';
import { GitHubApiUtils } from '$lib/server/utils/github-api-utils.js';
import { ServiceErrorUtil } from '$lib/server/utils/service-error-util.js';

/**
 * GitHub APIから取得するリポジトリ情報の型定義
 */
interface GitHubRepositoryInfo {
  name: string;
  html_url: string;
  owner: {
    login: string;
  };
  description?: string | null;
  stargazers_count?: number | null;
  license?: {
    name: string;
    url?: string;
  } | null;
}

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
   * 1. GitHubAPIからリポジトリ情報と最終コミット日時を並列取得
   * 2. リポジトリ情報からライセンス情報を抽出（API削減の最適化）
   * 3. 取得したデータを統一されたフォーマットに変換
   * 4. 最終コミット日時が取得できない場合はエラーを投げる
   *
   * @param owner リポジトリオーナー名
   * @param repo リポジトリ名
   * @returns リポジトリの完全なデータ
   */
  public static async call(owner: string, repo: string): Promise<GitHubRepoData> {
    // ライセンス情報はリポジトリ情報から抽出
    const [repoInfo, lastCommitAt] = await Promise.all([
      GitHubApiUtils.fetchRepositoryInfo(owner, repo),
      GitHubApiUtils.fetchLastCommitDate(owner, repo),
    ]);

    ServiceErrorUtil.assertCondition(
      !!lastCommitAt,
      'Failed to fetch last commit date.',
      'FetchGitHubRepoDataService.call'
    );

    // ライセンス情報をリポジトリ情報から抽出（API呼び出し削減）
    const licenseInfo = this.extractLicenseFromRepoInfo(repoInfo, owner, repo);

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
   * リポジトリ情報からライセンス情報を抽出
   * API呼び出し削減のため、リポジトリ情報に含まれるライセンス情報を使用
   * @private
   */
  private static extractLicenseFromRepoInfo(
    repoInfo: GitHubRepositoryInfo,
    owner: string,
    repo: string
  ): { type: string; url: string } {
    if (repoInfo.license && repoInfo.license.name) {
      return {
        type: normalizeLicenseName(repoInfo.license.name),
        url: repoInfo.license.url || `https://github.com/${owner}/${repo}/blob/main/LICENSE`,
      };
    }

    // ライセンス情報がない場合のデフォルト値
    return {
      type: LICENSE_TYPES.UNKNOWN,
      url: `https://github.com/${owner}/${repo}`,
    };
  }
}
