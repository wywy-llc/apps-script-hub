import { ERROR_MESSAGES } from '$lib/constants/error-messages.js';
import { db, testConnection } from '$lib/server/db/index.js';
import { library } from '$lib/server/db/schema.js';
import { nanoid } from 'nanoid';
import {
  BaseAiSummaryManager,
  BaseGitHubOperations,
  BaseRepositoryService,
  BaseServiceErrorHandler,
} from './base/index.js';

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
    const repositoryUrl = BaseGitHubOperations.normalizeGitHubUrl(params.repoUrl);
    const { owner, repo } = BaseGitHubOperations.parseGitHubUrl(repositoryUrl);

    // データベース接続テスト
    const isConnected = await testConnection();
    BaseServiceErrorHandler.assertCondition(
      isConnected,
      ERROR_MESSAGES.DATABASE_CONNECTION_FAILED,
      'CreateLibraryService.call'
    );

    // 重複チェック
    await BaseRepositoryService.ensureMultipleUnique([
      {
        table: library,
        column: library.scriptId,
        value: params.scriptId,
        duplicateMessage: ERROR_MESSAGES.SCRIPT_ID_ALREADY_REGISTERED,
      },
      {
        table: library,
        column: library.repositoryUrl,
        value: repositoryUrl,
        duplicateMessage: ERROR_MESSAGES.REPOSITORY_ALREADY_REGISTERED,
      },
    ]);

    // GitHub から情報を取得
    const { repoInfo, licenseInfo, lastCommitAt } = await BaseGitHubOperations.fetchFullRepoData(
      owner,
      repo
    );

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
      starCount: repoInfo.starCount,
      copyCount: 0,
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

    // 新規ライブラリにAIによる要約を生成してDBに保存
    try {
      await BaseAiSummaryManager.generateForNewLibrary(libraryId, repositoryUrl);
    } catch (error) {
      console.error('AI要約生成でエラーが発生しましたが、ライブラリ作成は続行します:', error);
    }

    return libraryId;
  }
}
