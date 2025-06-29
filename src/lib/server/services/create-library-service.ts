import { db, testConnection } from '$lib/server/db/index.js';
import { library } from '$lib/server/db/schema.js';
import { GitHubApiUtils } from '$lib/server/utils/github-api-utils.js';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { FetchGithubLicenseService } from './fetch-github-license-service';
import { FetchGithubReadmeService } from './fetch-github-readme-service';
import { FetchGithubRepoService } from './fetch-github-repo-service';

/**
 * ライブラリを新規作成するサービス
 * GitHub APIから情報を取得してデータベースに保存する
 */
export class CreateLibraryService {
  /**
   * ライブラリを新規作成する
   * @param params 作成パラメータ
   * @returns 作成されたライブラリのID
   */
  static async call(params: { scriptId: string; repoUrl: string }): Promise<string> {
    const [owner, repo] = params.repoUrl.split('/');

    if (!owner || !repo) {
      throw new Error('GitHub リポジトリURLの形式が正しくありません。');
    }

    // データベース接続テスト
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('データベース接続に失敗しました。');
    }

    // scriptIdが既に登録されているかチェック
    const existingScriptId = await db
      .select()
      .from(library)
      .where(eq(library.scriptId, params.scriptId))
      .limit(1);

    if (existingScriptId.length > 0) {
      throw new Error('このGASスクリプトIDは既に登録されています。');
    }

    // repositoryUrlが既に登録されているかチェック
    const repositoryUrl = `https://github.com/${params.repoUrl}`;
    const existingRepositoryUrl = await db
      .select()
      .from(library)
      .where(eq(library.repositoryUrl, repositoryUrl))
      .limit(1);

    if (existingRepositoryUrl.length > 0) {
      throw new Error('このリポジトリは既に登録されています。');
    }

    // GitHub から情報を取得
    const [repoInfo, readmeContent, licenseInfo, lastCommitAt] = await Promise.all([
      FetchGithubRepoService.call(owner, repo),
      FetchGithubReadmeService.call(owner, repo),
      FetchGithubLicenseService.call(owner, repo),
      GitHubApiUtils.fetchLastCommitDate(owner, repo),
    ]);

    if (!lastCommitAt) {
      throw new Error('最終コミット日時の取得に失敗しました。');
    }

    // ライブラリを作成
    const libraryId = nanoid();

    // データベースに保存
    await db.insert(library).values({
      id: libraryId,
      name: repoInfo.name,
      scriptId: params.scriptId,
      repositoryUrl: repoInfo.repositoryUrl,
      authorUrl: repoInfo.authorUrl,
      authorName: repoInfo.authorName,
      description: repoInfo.description,
      readmeContent: readmeContent,
      starCount: repoInfo.starCount,
      licenseType: licenseInfo.type,
      licenseUrl: licenseInfo.url,
      lastCommitAt: lastCommitAt,
      status: 'pending',
    });

    console.log('📚 ライブラリ作成完了:', {
      id: libraryId,
      name: repoInfo.name,
      author: repoInfo.authorName,
      description: repoInfo.description,
      starCount: repoInfo.starCount,
    });

    return libraryId;
  }
}
