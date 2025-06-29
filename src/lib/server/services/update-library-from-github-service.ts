import { db } from '$lib/server/db/index.js';
import { library } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { FetchGithubLicenseService } from './github.js';

/**
 * GitHub リポジトリ情報を再取得するサービス
 */
export class UpdateLibraryFromGithubService {
  /**
   * GitHub APIから情報を再取得してライブラリを更新する
   * @param libraryId ライブラリID
   */
  static async call(libraryId: string) {
    // ライブラリを取得
    const result = await db.select().from(library).where(eq(library.id, libraryId)).limit(1);

    if (result.length === 0) {
      throw new Error('ライブラリが見つかりません。');
    }

    const libraryData = result[0];
    const repoUrl = new URL(libraryData.repositoryUrl);
    const [, owner, repo] = repoUrl.pathname.split('/');

    if (!owner || !repo) {
      throw new Error('GitHub リポジトリURLが正しくありません。');
    }

    // GitHub リポジトリ情報を取得
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`);

    if (!repoResponse.ok) {
      if (repoResponse.status === 404) {
        throw new Error('指定されたGitHubリポジトリが見つかりません。');
      }
      throw new Error('GitHubリポジトリの情報取得に失敗しました。');
    }

    const repoData = await repoResponse.json();

    // README を取得
    let readmeContent = '';
    try {
      const readmeResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`);

      if (readmeResponse.ok) {
        const readmeData = await readmeResponse.json();
        readmeContent = Buffer.from(readmeData.content, 'base64').toString('utf-8');
      }
    } catch (err) {
      console.warn('README 取得エラー:', err);
    }

    // ライセンス情報を取得
    const licenseInfo = await FetchGithubLicenseService.call(owner, repo);

    // ライブラリを更新
    await db
      .update(library)
      .set({
        name: repoData.name,
        description: repoData.description || '',
        authorName: repoData.owner.login,
        authorUrl: `https://github.com/${repoData.owner.login}`,
        repositoryUrl: repoData.html_url,
        readmeContent: readmeContent,
        starCount: repoData.stargazers_count || 0,
        licenseType: licenseInfo.type,
        licenseUrl: licenseInfo.url,
        updatedAt: new Date(),
      })
      .where(eq(library.id, libraryId));
  }
}
