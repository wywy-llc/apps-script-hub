import { db } from '$lib/server/db/index.js';
import { librarySummary } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { generateId } from '$lib/server/utils/generate-id.js';
import type { LibrarySummary } from '$lib/types/library-summary.js';

/**
 * ライブラリ要約情報をDBに保存するサービス
 */
export class SaveLibrarySummaryService {
  /**
   * LibrarySummaryデータをDBに保存する
   * @param libraryId ライブラリID（library.idの外部キー）
   * @param summary ライブラリ要約データ
   */
  static async call(libraryId: string, summary: LibrarySummary): Promise<void> {
    // 既存の要約情報があるかチェック
    const existing = await db
      .select()
      .from(librarySummary)
      .where(eq(librarySummary.libraryId, libraryId))
      .limit(1);

    // basicInfoとfunctionalityからフラットなデータに変換
    const flattenedData = {
      libraryNameJa: summary.basicInfo.libraryName.ja,
      libraryNameEn: summary.basicInfo.libraryName.en,
      purposeJa: summary.basicInfo.purpose.ja,
      purposeEn: summary.basicInfo.purpose.en,
      targetUsersJa: summary.basicInfo.targetUsers.ja,
      targetUsersEn: summary.basicInfo.targetUsers.en,
      tagsJa: summary.basicInfo.tags.ja,
      tagsEn: summary.basicInfo.tags.en,
      coreProblemJa: summary.functionality.coreProblem.ja,
      coreProblemEn: summary.functionality.coreProblem.en,
      mainBenefits: summary.functionality.mainBenefits,
    };

    if (existing.length > 0) {
      // 既存レコードを更新
      await db
        .update(librarySummary)
        .set({
          ...flattenedData,
          updatedAt: new Date(),
        })
        .where(eq(librarySummary.libraryId, libraryId));
    } else {
      // 新規レコードを作成
      await db.insert(librarySummary).values({
        id: generateId(),
        libraryId,
        ...flattenedData,
      });
    }
  }
}
