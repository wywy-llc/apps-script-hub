import { LICENSE_TYPES, normalizeLicenseName } from '$lib/constants/license-types.js';
import { GitHubApiUtils } from '$lib/server/utils/github-api-utils.js';

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
