import { db, testConnection } from '$lib/server/db/index.js';
import { library } from '$lib/server/db/schema.js';
import { nanoid } from 'nanoid';
import { FetchGithubReadmeService, FetchGithubRepoService } from './github.js';

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
  static async call(params: {
    scriptId: string;
    repoUrl: string;
  }): Promise<string> {
    const [owner, repo] = params.repoUrl.split('/');

    if (!owner || !repo) {
      throw new Error('GitHub リポジトリURLの形式が正しくありません。');
    }

    // データベース接続テスト
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('データベース接続に失敗しました。');
    }

    // GitHub から情報を取得
    const [repoInfo, readmeContent] = await Promise.all([
      FetchGithubRepoService.call(owner, repo),
      FetchGithubReadmeService.call(owner, repo),
    ]);

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
