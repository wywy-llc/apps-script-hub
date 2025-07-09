import { ERROR_MESSAGES } from '$lib/constants/error-messages.js';
import { db, testConnection } from '$lib/server/db/index.js';
import { library } from '$lib/server/db/schema.js';
import { GitHubApiUtils } from '$lib/server/utils/github-api-utils.js';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { FetchGithubLicenseService } from './fetch-github-license-service';
import { FetchGithubRepoService } from './fetch-github-repo-service';
import { GenerateLibrarySummaryService } from './generate-library-summary-service.js';
import { SaveLibrarySummaryService } from './save-library-summary-service.js';

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
    const fullRepoUrl = params.repoUrl.startsWith('https://github.com/')
      ? params.repoUrl
      : `https://github.com/${params.repoUrl}`;

    const parsedUrl = GitHubApiUtils.parseGitHubUrl(fullRepoUrl);

    if (!parsedUrl) {
      throw new Error(ERROR_MESSAGES.INVALID_REPOSITORY_URL);
    }

    const { owner, repo } = parsedUrl;

    // データベース接続テスト
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error(ERROR_MESSAGES.DATABASE_CONNECTION_FAILED);
    }

    // scriptIdが既に登録されているかチェック
    const existingScriptId = await db
      .select()
      .from(library)
      .where(eq(library.scriptId, params.scriptId))
      .limit(1);

    if (existingScriptId.length > 0) {
      throw new Error(ERROR_MESSAGES.SCRIPT_ID_ALREADY_REGISTERED);
    }

    // repositoryUrlが既に登録されているかチェック
    const repositoryUrl = fullRepoUrl;
    const existingRepositoryUrl = await db
      .select()
      .from(library)
      .where(eq(library.repositoryUrl, repositoryUrl))
      .limit(1);

    if (existingRepositoryUrl.length > 0) {
      throw new Error(ERROR_MESSAGES.REPOSITORY_ALREADY_REGISTERED);
    }

    // GitHub から情報を取得
    const [repoInfo, licenseInfo, lastCommitAt] = await Promise.all([
      FetchGithubRepoService.call(owner, repo),
      FetchGithubLicenseService.call(owner, repo),
      GitHubApiUtils.fetchLastCommitDate(owner, repo),
    ]);

    if (!lastCommitAt) {
      throw new Error(ERROR_MESSAGES.LAST_COMMIT_DATE_FETCH_FAILED);
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
      console.log(`新規ライブラリのAI要約を生成します: ${libraryId}`);
      const summary = await GenerateLibrarySummaryService.call({
        githubUrl: repositoryUrl,
      });
      await SaveLibrarySummaryService.call(libraryId, summary);
    } catch (error) {
      console.warn('新規ライブラリの要約生成に失敗しました:', error);
      // エラーが発生してもライブラリ作成処理は続行
    }

    return libraryId;
  }
}
