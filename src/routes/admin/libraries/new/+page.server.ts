import { db } from '$lib/server/db/index.js';
import { library } from '$lib/server/db/schema.js';
import { createId } from '@paralleldrive/cuid2';
import { error } from '@sveltejs/kit';
import type { Actions } from './$types.js';

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
   * @returns README の内容
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

/**
 * ライブラリを新規作成するサービス
 */
export class CreateLibraryService {
  /**
   * ライブラリを新規作成する
   * @param params 作成パラメータ
   * @returns 作成されたライブラリのID
   */
  static async call(params: {
    scriptId: string;
    repoUrl: string;
  }): Promise<string> {
    const [owner, repo] = params.repoUrl.split('/');

    if (!owner || !repo) {
      throw new Error('GitHub リポジトリURLの形式が正しくありません。');
    }

    // GitHub から情報を取得
    const [repoInfo, readmeContent] = await Promise.all([
      FetchGithubRepoService.call(owner, repo),
      FetchGithubReadmeService.call(owner, repo),
    ]);

    // ライブラリを作成
    const libraryId = createId();

    await db.insert(library).values({
      id: libraryId,
      name: repoInfo.name,
      scriptId: params.scriptId,
      repositoryUrl: repoInfo.repositoryUrl,
      authorUrl: repoInfo.authorUrl,
      authorName: repoInfo.authorName,
      description: repoInfo.description,
      readmeContent: readmeContent,
      status: 'pending',
    });

    return libraryId;
  }
}

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const scriptId = formData.get('scriptId')?.toString();
    const repoUrl = formData.get('repoUrl')?.toString();

    if (!scriptId || !repoUrl) {
      throw error(400, { message: '必要な情報が不足しています。' });
    }

    try {
      const libraryId = await CreateLibraryService.call({
        scriptId,
        repoUrl,
      });

      return {
        success: true,
        id: libraryId,
      };
    } catch (err) {
      console.error('ライブラリ作成エラー:', err);
      throw error(500, {
        message:
          err instanceof Error
            ? err.message
            : 'ライブラリの作成に失敗しました。',
      });
    }
  },
};
