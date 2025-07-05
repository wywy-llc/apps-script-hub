import { ERROR_MESSAGES } from '$lib/constants/error-messages.js';
import { GitHubApiUtils } from '$lib/server/utils/github-api-utils.js';

/**
 * GitHub リポジトリ情報を取得するサービス
 */
export class FetchGithubRepoService {
  /**
   * GitHub API からリポジトリ情報を取得する
   * @param owner リポジトリの所有者
   * @param repo リポジトリ名
   * @returns GitHub リポジトリ情報
   */
  static async call(owner: string, repo: string) {
    const headers = GitHubApiUtils.createHeaders();

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(ERROR_MESSAGES.REPOSITORY_NOT_FOUND);
      }
      if (response.status === 403) {
        throw new Error(ERROR_MESSAGES.GITHUB_API_RATE_LIMIT);
      }
      throw new Error(ERROR_MESSAGES.GITHUB_REPO_INFO_FETCH_FAILED);
    }

    const repoData = await response.json();

    return {
      name: repoData.name,
      description: repoData.description || '',
      authorName: repoData.owner.login,
      authorUrl: `https://github.com/${repoData.owner.login}`,
      repositoryUrl: repoData.html_url,
      starCount: repoData.stargazers_count || 0,
    };
  }
}
