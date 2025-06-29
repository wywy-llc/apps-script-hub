import { LICENSE_TYPES, normalizeLicenseName } from '$lib/constants/license-types.js';
import { GitHubApiUtils } from '$lib/server/utils/github-api-utils.js';

/**
 * GitHub API サービス
 * GitHubリポジトリ情報とREADMEファイルを取得する
 */

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
        throw new Error('指定されたGitHubリポジトリが見つかりません。');
      }
      if (response.status === 403) {
        throw new Error(
          'GitHub API の制限に達しました。しばらく時間をおいてから再試行してください。'
        );
      }
      throw new Error('GitHubリポジトリの情報取得に失敗しました。');
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

/**
 * GitHub リポジトリのライセンス情報を取得するサービス
 */
export class FetchGithubLicenseService {
  /**
   * GitHub API からライセンス情報を取得する
   * @param owner リポジトリの所有者
   * @param repo リポジトリ名
   * @returns ライセンス情報（種類とURL）
   */
  static async call(owner: string, repo: string): Promise<{ type: string; url: string }> {
    try {
      const headers = GitHubApiUtils.createHeaders();

      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/license`, {
        headers,
      });

      if (!response.ok) {
        // ライセンス情報が見つからない場合はデフォルト値を返す
        return {
          type: LICENSE_TYPES.UNKNOWN,
          url: `https://github.com/${owner}/${repo}`,
        };
      }

      const licenseData = await response.json();
      const normalizedLicenseType = normalizeLicenseName(licenseData.license?.name);

      return {
        type: normalizedLicenseType,
        url: licenseData.html_url || `https://github.com/${owner}/${repo}`,
      };
    } catch (err) {
      console.error('ライセンス情報取得エラー:', err);
      // エラーの場合もデフォルト値を返す
      return {
        type: LICENSE_TYPES.UNKNOWN,
        url: `https://github.com/${owner}/${repo}`,
      };
    }
  }
}

/**
 * GitHub リポジトリの README を取得するサービス
 */
export class FetchGithubReadmeService {
  /**
   * GitHub API からREADMEファイルを取得する
   * @param owner リポジトリの所有者
   * @param repo リポジトリ名
   * @returns README の内容（Markdown）
   */
  static async call(owner: string, repo: string): Promise<string> {
    try {
      const headers = GitHubApiUtils.createHeaders();

      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
        headers,
      });

      if (!response.ok) {
        return ''; // README が見つからない場合は空文字を返す
      }

      const readmeData = await response.json();
      const readmeContent = Buffer.from(readmeData.content, 'base64').toString('utf-8');

      return readmeContent;
    } catch (err) {
      console.error('README 取得エラー:', err);
      return ''; // エラーの場合も空文字を返す
    }
  }
}
