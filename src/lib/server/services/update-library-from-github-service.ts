import { db } from '$lib/server/db/index.js';
import { library } from '$lib/server/db/schema.js';
import { LibraryRepository } from '$lib/server/repositories/library-repository.js';
import { LibrarySummaryRepository } from '$lib/server/repositories/library-summary-repository.js';
import { GitHubApiUtils } from '$lib/server/utils/github-api-utils.js';
import { ServiceErrorUtil } from '$lib/server/utils/service-error-util.js';
import { eq } from 'drizzle-orm';
import { FetchGitHubRepoDataService } from './fetch-github-repo-data-service.js';
import { GenerateAiSummaryService } from './generate-ai-summary-service.js';

/**
 * GitHub リポジトリ情報を再取得するサービス
 */
export class UpdateLibraryFromGithubService {
  /**
   * GitHub APIから情報を再取得してライブラリを更新する
   * @param libraryId ライブラリID
   * @param options オプション設定
   */
  static async call(libraryId: string, options: { skipAiSummary?: boolean } = {}) {
    // ライブラリを取得
    const libraryData = await LibraryRepository.findById(libraryId);
    ServiceErrorUtil.assertCondition(
      !!libraryData,
      'ライブラリが見つかりません。',
      'UpdateLibraryFromGithubService.call'
    );

    const parsedUrl = GitHubApiUtils.parseGitHubUrl(libraryData!.repositoryUrl);
    ServiceErrorUtil.assertCondition(
      !!parsedUrl,
      'GitHub リポジトリURLが正しくありません',
      'UpdateLibraryFromGithubService.call'
    );
    const { owner, repo } = parsedUrl!;

    // GitHub から情報を取得
    const { repoInfo, licenseInfo, lastCommitAt } = await FetchGitHubRepoDataService.call(
      owner,
      repo
    );

    // 新しいlastCommitAtと既存データを比較
    const hasCommitChanges = libraryData!.lastCommitAt.getTime() !== lastCommitAt.getTime();

    // library_summaryが存在するかチェック
    const summaryExists = await LibrarySummaryRepository.exists(libraryId);

    // AI要約生成判定: lastCommitAtに変化がある または library_summaryが存在しない場合（スキップオプションが無効の場合）
    const shouldGenerateSummary = !options.skipAiSummary && (hasCommitChanges || !summaryExists);

    // ライブラリを更新
    await db
      .update(library)
      .set({
        name: repoInfo.name,
        description: repoInfo.description,
        authorName: repoInfo.authorName,
        authorUrl: repoInfo.authorUrl,
        repositoryUrl: repoInfo.repositoryUrl,
        starCount: repoInfo.starCount,
        licenseType: licenseInfo.type,
        licenseUrl: licenseInfo.url,
        lastCommitAt: lastCommitAt,
        updatedAt: new Date(),
      })
      .where(eq(library.id, libraryId));

    // AIによるライブラリ要約を生成してDBに保存（lastCommitAtに変化がある または library_summaryが存在しない場合）
    if (shouldGenerateSummary) {
      const reason =
        hasCommitChanges && summaryExists
          ? 'lastCommitAtが変更されたため'
          : !summaryExists
            ? 'library_summaryが存在しないため'
            : 'lastCommitAtが変更されたため';

      await GenerateAiSummaryService.call({
        libraryId,
        githubUrl: repoInfo.repositoryUrl,
        skipOnError: true,
        logContext: reason,
      });
    } else {
      console.log(
        `lastCommitAtに変化がなく、library_summaryも存在するため、AI要約生成をスキップします: ${libraryId}`
      );
    }
  }

  /**
   * 指定されたライブラリのAI要約のみを生成する
   * @param libraryId ライブラリID
   */
  static async generateAiSummaryOnly(libraryId: string) {
    // ライブラリを取得
    const libraryData = await LibraryRepository.findById(libraryId);
    ServiceErrorUtil.assertCondition(
      !!libraryData,
      'ライブラリが見つかりません。',
      'UpdateLibraryFromGithubService.generateAiSummaryOnly'
    );

    // 手動生成の場合はエラーを上位に伝播
    await GenerateAiSummaryService.call({
      libraryId,
      githubUrl: libraryData!.repositoryUrl,
      skipOnError: false,
      logContext: '手動でAI要約を生成',
    });
  }
}
