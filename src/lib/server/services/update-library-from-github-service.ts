import { db } from '$lib/server/db/index.js';
import { library } from '$lib/server/db/schema.js';
import { GitHubApiUtils } from '$lib/server/utils/github-api-utils.js';
import { eq } from 'drizzle-orm';
import { FetchGithubLicenseService } from './fetch-github-license-service';
import { GenerateLibrarySummaryService } from './generate-library-summary-service.js';
import { SaveLibrarySummaryService } from './save-library-summary-service.js';

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
    const result = await db.select().from(library).where(eq(library.id, libraryId)).limit(1);

    if (result.length === 0) {
      throw new Error('ライブラリが見つかりません。');
    }

    const libraryData = result[0];
    const parsedUrl = GitHubApiUtils.parseGitHubUrl(libraryData.repositoryUrl);

    if (!parsedUrl) {
      throw new Error('GitHub リポジトリURLが正しくありません。');
    }

    const { owner, repo } = parsedUrl;

    // GitHub リポジトリ情報を取得
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`);

    if (!repoResponse.ok) {
      const errorText = await repoResponse.text();
      const errorInfo = `Status: ${repoResponse.status}, StatusText: ${repoResponse.statusText}, Response: ${errorText}`;
      if (repoResponse.status === 404) {
        throw new Error('指定されたGitHubリポジトリが見つかりません。');
      }
      throw new Error(`GitHubリポジトリの情報取得に失敗しました。${errorInfo}`);
    }

    const repoData = await repoResponse.json();

    // ライセンス情報を取得
    const licenseInfo = await FetchGithubLicenseService.call(owner, repo);

    // 新しいlastCommitAtと既存データを比較
    const newLastCommitAt = new Date(repoData.pushed_at);
    const hasCommitChanges = libraryData.lastCommitAt.getTime() !== newLastCommitAt.getTime();

    // library_summaryが存在するかチェック
    const summaryExists = await SaveLibrarySummaryService.exists(libraryId);

    // AI要約生成判定: lastCommitAtに変化がある または library_summaryが存在しない場合（スキップオプションが無効の場合）
    const shouldGenerateSummary = !options.skipAiSummary && (hasCommitChanges || !summaryExists);

    // ライブラリを更新
    await db
      .update(library)
      .set({
        name: repoData.name,
        description: repoData.description || '',
        authorName: repoData.owner.login,
        authorUrl: `https://github.com/${repoData.owner.login}`,
        repositoryUrl: repoData.html_url,
        starCount: repoData.stargazers_count || 0,
        licenseType: licenseInfo.type,
        licenseUrl: licenseInfo.url,
        lastCommitAt: newLastCommitAt,
        updatedAt: new Date(),
      })
      .where(eq(library.id, libraryId));

    // AIによるライブラリ要約を生成してDBに保存（lastCommitAtに変化がある または library_summaryが存在しない場合）
    if (shouldGenerateSummary) {
      try {
        if (hasCommitChanges && summaryExists) {
          console.log(`lastCommitAtが変更されたため、AI要約を生成します: ${libraryId}`);
        } else if (!summaryExists) {
          console.log(`library_summaryが存在しないため、AI要約を生成します: ${libraryId}`);
        } else {
          console.log(`lastCommitAtが変更されたため、AI要約を生成します: ${libraryId}`);
        }

        const summary = await GenerateLibrarySummaryService.call({
          githubUrl: repoData.html_url,
        });
        await SaveLibrarySummaryService.call(libraryId, summary);
      } catch (error) {
        console.warn('ライブラリ要約生成に失敗しました:', error);
        // エラーが発生してもライブラリ更新処理は続行
      }
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
    const result = await db.select().from(library).where(eq(library.id, libraryId)).limit(1);

    if (result.length === 0) {
      throw new Error('ライブラリが見つかりません。');
    }

    const libraryData = result[0];

    try {
      console.log(`手動でAI要約を生成します: ${libraryId}`);

      const summary = await GenerateLibrarySummaryService.call({
        githubUrl: libraryData.repositoryUrl,
      });

      await SaveLibrarySummaryService.call(libraryId, summary);
    } catch (error) {
      console.error('AI要約生成エラー:', error);
      throw error; // 手動生成の場合はエラーを上位に伝播
    }
  }
}
