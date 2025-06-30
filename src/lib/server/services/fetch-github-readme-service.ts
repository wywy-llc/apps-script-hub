import { GitHubApiUtils } from '$lib/server/utils/github-api-utils.js';

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
