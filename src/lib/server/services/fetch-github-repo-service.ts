import { env } from '$env/dynamic/private';
import { ERROR_MESSAGES } from '$lib/constants/error-messages.js';
import { GitHubApiUtils } from '$lib/server/utils/github-api-utils.js';

/**
 * E2Eテスト用のモックデータを生成
 */
function generateE2EMockData(owner: string, repo: string) {
  // テストで使用する一般的なリポジトリ情報のモック
  const mockData = {
    name: repo,
    description: `Mock repository for E2E testing: ${owner}/${repo}`,
    authorName: owner,
    authorUrl: `https://github.com/${owner}`,
    repositoryUrl: `https://github.com/${owner}/${repo}`,
    starCount: 42,
  };

  // 特定のテストケース用のカスタムデータ
  if (owner === 'googleworkspace' && repo === 'apps-script-oauth2') {
    return {
      name: 'apps-script-oauth2',
      description: 'An OAuth2 library for Google Apps Script.',
      authorName: 'googleworkspace',
      authorUrl: 'https://github.com/googleworkspace',
      repositoryUrl: 'https://github.com/googleworkspace/apps-script-oauth2',
      starCount: 1234,
    };
  }

  return mockData;
}

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
    // E2Eテストモードの場合はモックデータを返す
    if (env.PLAYWRIGHT_TEST_MODE === 'true') {
      console.log(`🤖 [E2E Mock] リポジトリ情報を取得中: ${owner}/${repo} (モックデータを使用)`);
      // 実際のAPIレスポンス時間をシミュレート
      await new Promise(resolve => setTimeout(resolve, 100));

      // 存在しないリポジトリのテストケース
      if (owner === 'nonexistent-user-999999' && repo === 'nonexistent-repo-999999') {
        throw new Error(ERROR_MESSAGES.REPOSITORY_NOT_FOUND);
      }

      return generateE2EMockData(owner, repo);
    }
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
