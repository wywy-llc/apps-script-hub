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
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('指定されたGitHubリポジトリが見つかりません。');
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
      };
    } catch (err) {
      console.error('GitHub API エラー:', err);
      throw err;
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
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/readme`
      );

      if (!response.ok) {
        return ''; // README が見つからない場合は空文字を返す
      }

      const readmeData = await response.json();
      const readmeContent = Buffer.from(readmeData.content, 'base64').toString(
        'utf-8'
      );

      return readmeContent;
    } catch (err) {
      console.error('README 取得エラー:', err);
      return ''; // エラーの場合も空文字を返す
    }
  }
}
