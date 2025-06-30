import { db } from '$lib/server/db/index.js';
import { library } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

/**
 * ライブラリのコミット状況をチェックするサービス
 */
export class CheckLibraryCommitStatusService {
  /**
   * 指定されたGitHubリポジトリのlastCommitAtが既存ライブラリと異なるかチェック
   * @param repositoryUrl GitHubリポジトリURL
   * @param newLastCommitAt 新しいlastCommitAt
   * @returns { isNew: boolean, shouldUpdate: boolean, libraryId?: string }
   */
  static async call(
    repositoryUrl: string,
    newLastCommitAt: Date
  ): Promise<{
    isNew: boolean;
    shouldUpdate: boolean;
    libraryId?: string;
  }> {
    // 既存ライブラリをチェック
    const existingLibrary = await db
      .select()
      .from(library)
      .where(eq(library.repositoryUrl, repositoryUrl))
      .limit(1);

    if (existingLibrary.length === 0) {
      // 新規ライブラリ
      return {
        isNew: true,
        shouldUpdate: true,
      };
    }

    const existing = existingLibrary[0];
    const shouldUpdate = existing.lastCommitAt.getTime() !== newLastCommitAt.getTime();

    return {
      isNew: false,
      shouldUpdate,
      libraryId: existing.id,
    };
  }
}
