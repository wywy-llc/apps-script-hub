import { db } from '$lib/server/db/index.js';
import { library, type Library } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

/**
 * ライブラリテーブルのデータアクセス層
 * ライブラリのCRUD操作を提供
 */
export class LibraryRepository {
  /**
   * IDでライブラリを検索
   * @param id ライブラリID
   * @returns ライブラリ情報またはnull
   */
  static async findById(id: string): Promise<Library | null> {
    const result = await db.select().from(library).where(eq(library.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  }

  /**
   * スクリプトIDでライブラリを検索
   * @param scriptId スクリプトID
   * @returns ライブラリ情報またはnull
   */
  static async findByScriptId(scriptId: string): Promise<Library | null> {
    const result = await db.select().from(library).where(eq(library.scriptId, scriptId)).limit(1);
    return result.length > 0 ? result[0] : null;
  }

  /**
   * リポジトリURLでライブラリを検索
   * @param repositoryUrl リポジトリURL
   * @returns ライブラリ情報またはnull
   */
  static async findByRepositoryUrl(repositoryUrl: string): Promise<Library | null> {
    const result = await db
      .select()
      .from(library)
      .where(eq(library.repositoryUrl, repositoryUrl))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  }

  /**
   * IDでライブラリを検索（必須）
   * @param id ライブラリID
   * @returns ライブラリ情報
   * @throws Error ライブラリが見つからない場合
   */
  static async findByIdOrThrow(id: string): Promise<Library> {
    const result = await this.findById(id);
    if (!result) {
      throw new Error(`Library not found: ${id}`);
    }
    return result;
  }

  /**
   * スクリプトIDの重複チェック
   * @param scriptId スクリプトID
   * @returns 重複している場合はtrue
   */
  static async existsByScriptId(scriptId: string): Promise<boolean> {
    const result = await db
      .select({ id: library.id })
      .from(library)
      .where(eq(library.scriptId, scriptId))
      .limit(1);
    return result.length > 0;
  }

  /**
   * リポジトリURLの重複チェック
   * @param repositoryUrl リポジトリURL
   * @returns 重複している場合はtrue
   */
  static async existsByRepositoryUrl(repositoryUrl: string): Promise<boolean> {
    const result = await db
      .select({ id: library.id })
      .from(library)
      .where(eq(library.repositoryUrl, repositoryUrl))
      .limit(1);
    return result.length > 0;
  }

  /**
   * 新しいライブラリを作成
   * @param libraryData ライブラリデータ
   * @returns 作成されたライブラリ情報
   */
  static async create(libraryData: typeof library.$inferInsert): Promise<Library> {
    const result = await db.insert(library).values(libraryData).returning();
    return result[0];
  }

  /**
   * ライブラリを更新
   * @param id ライブラリID
   * @param updateData 更新データ
   * @returns 更新されたライブラリ情報
   */
  static async update(
    id: string,
    updateData: Partial<typeof library.$inferInsert>
  ): Promise<Library> {
    const result = await db
      .update(library)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(library.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error(`Library not found for update: ${id}`);
    }

    return result[0];
  }

  /**
   * ライブラリを削除
   * @param id ライブラリID
   */
  static async delete(id: string): Promise<void> {
    const result = await db.delete(library).where(eq(library.id, id)).returning();

    if (result.length === 0) {
      throw new Error(`Library not found for deletion: ${id}`);
    }
  }

  /**
   * 複数の重複チェック
   * @param scriptId スクリプトID
   * @param repositoryUrl リポジトリURL
   * @throws Error 重複している場合
   */
  static async ensureUnique(scriptId: string, repositoryUrl: string): Promise<void> {
    const [scriptIdExists, repositoryUrlExists] = await Promise.all([
      this.existsByScriptId(scriptId),
      this.existsByRepositoryUrl(repositoryUrl),
    ]);

    if (scriptIdExists) {
      throw new Error('This script ID is already registered.');
    }

    if (repositoryUrlExists) {
      throw new Error('This repository is already registered.');
    }
  }
}
