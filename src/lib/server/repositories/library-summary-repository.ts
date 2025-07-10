import { db } from '$lib/server/db/index.js';
import { librarySummary, type LibrarySummaryRecord } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

/**
 * ライブラリ要約テーブルのデータアクセス層
 * AI要約データのCRUD操作を提供
 */
export class LibrarySummaryRepository {
  /**
   * ライブラリIDで要約を検索
   * @param libraryId ライブラリID
   * @returns 要約情報またはnull
   */
  static async findByLibraryId(libraryId: string): Promise<LibrarySummaryRecord | null> {
    const result = await db
      .select()
      .from(librarySummary)
      .where(eq(librarySummary.libraryId, libraryId))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  }

  /**
   * ライブラリIDで要約を検索（必須）
   * @param libraryId ライブラリID
   * @returns 要約情報
   * @throws Error 要約が見つからない場合
   */
  static async findByLibraryIdOrThrow(libraryId: string): Promise<LibrarySummaryRecord> {
    const result = await this.findByLibraryId(libraryId);
    if (!result) {
      throw new Error(`Library summary not found: ${libraryId}`);
    }
    return result;
  }

  /**
   * 要約の存在チェック
   * @param libraryId ライブラリID
   * @returns 存在する場合はtrue
   */
  static async exists(libraryId: string): Promise<boolean> {
    const result = await db
      .select({ id: librarySummary.id })
      .from(librarySummary)
      .where(eq(librarySummary.libraryId, libraryId))
      .limit(1);
    return result.length > 0;
  }

  /**
   * 新しい要約を作成
   * @param summaryData 要約データ
   * @returns 作成された要約情報
   */
  static async create(
    summaryData: typeof librarySummary.$inferInsert
  ): Promise<LibrarySummaryRecord> {
    const result = await db.insert(librarySummary).values(summaryData).returning();
    return result[0];
  }

  /**
   * 要約を更新
   * @param libraryId ライブラリID
   * @param updateData 更新データ
   * @returns 更新された要約情報
   */
  static async updateByLibraryId(
    libraryId: string,
    updateData: Partial<typeof librarySummary.$inferInsert>
  ): Promise<LibrarySummaryRecord> {
    const result = await db
      .update(librarySummary)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(librarySummary.libraryId, libraryId))
      .returning();

    if (result.length === 0) {
      throw new Error(`Library summary not found for update: ${libraryId}`);
    }

    return result[0];
  }

  /**
   * 要約を削除
   * @param libraryId ライブラリID
   */
  static async deleteByLibraryId(libraryId: string): Promise<void> {
    const result = await db
      .delete(librarySummary)
      .where(eq(librarySummary.libraryId, libraryId))
      .returning();

    if (result.length === 0) {
      throw new Error(`Library summary not found for deletion: ${libraryId}`);
    }
  }

  /**
   * 要約が存在する場合は更新、存在しない場合は作成
   * @param libraryId ライブラリID
   * @param summaryData 要約データ
   * @returns 作成または更新された要約情報
   */
  static async upsert(
    libraryId: string,
    summaryData: Omit<typeof librarySummary.$inferInsert, 'libraryId'>
  ): Promise<LibrarySummaryRecord> {
    const exists = await this.exists(libraryId);

    if (exists) {
      return this.updateByLibraryId(libraryId, summaryData);
    } else {
      return this.create({
        ...summaryData,
        libraryId,
      });
    }
  }
}
