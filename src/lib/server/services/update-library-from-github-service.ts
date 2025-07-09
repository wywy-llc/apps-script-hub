import { db } from '$lib/server/db/index.js';
import { library } from '$lib/server/db/schema.js';
import type { InferSelectModel } from 'drizzle-orm';
import { eq } from 'drizzle-orm';
import { BaseAiSummaryManager, BaseGitHubOperations, BaseRepositoryService } from './base/index.js';

type LibraryData = InferSelectModel<typeof library>;

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
    const libraryData = await BaseRepositoryService.findFirstOrThrow<LibraryData>(
      library,
      library.id,
      libraryId,
      'ライブラリが見つかりません。'
    );

    const { owner, repo } = BaseGitHubOperations.parseGitHubUrl(libraryData.repositoryUrl);

    // GitHub から情報を取得
    const { repoInfo, licenseInfo, lastCommitAt } = await BaseGitHubOperations.fetchFullRepoData(
      owner,
      repo
    );

    // 新しいlastCommitAtと既存データを比較
    const hasCommitChanges = libraryData.lastCommitAt.getTime() !== lastCommitAt.getTime();

    // library_summaryが存在するかチェック
    const summaryExists = await BaseAiSummaryManager.exists(libraryId);

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

      await BaseAiSummaryManager.generateForUpdate(libraryId, repoInfo.repositoryUrl, reason);
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
    const libraryData = await BaseRepositoryService.findFirstOrThrow<LibraryData>(
      library,
      library.id,
      libraryId,
      'ライブラリが見つかりません。'
    );

    // 手動生成の場合はエラーを上位に伝播
    await BaseAiSummaryManager.generateManual(libraryId, libraryData.repositoryUrl);
  }
}
