import { db } from '$lib/server/db/index.js';
import type { Column, Table } from 'drizzle-orm';
import { eq } from 'drizzle-orm';

/**
 * データベース操作の共通基盤クラス
 * 重複するデータベース操作を統一化
 */
export class BaseRepositoryService {
  /**
   * レコードの存在チェック
   * @param table テーブル
   * @param column カラム
   * @param value 値
   * @returns 存在する場合はtrue
   */
  static async exists(table: Table, column: Column, value: string): Promise<boolean> {
    const result = await db.select().from(table).where(eq(column, value)).limit(1);
    return result.length > 0;
  }

  /**
   * レコードの取得（存在チェック付き）
   * @param table テーブル
   * @param column カラム
   * @param value 値
   * @returns レコードまたはnull
   */
  static async findFirst<T>(table: Table, column: Column, value: string): Promise<T | null> {
    const result = await db.select().from(table).where(eq(column, value)).limit(1);
    return result.length > 0 ? (result[0] as T) : null;
  }

  /**
   * レコードの取得（存在確認必須）
   * @param table テーブル
   * @param column カラム
   * @param value 値
   * @param notFoundMessage 見つからない場合のエラーメッセージ
   * @returns レコード
   * @throws Error レコードが見つからない場合
   */
  static async findFirstOrThrow<T>(
    table: Table,
    column: Column,
    value: string,
    notFoundMessage: string
  ): Promise<T> {
    const result = await this.findFirst<T>(table, column, value);
    if (!result) {
      throw new Error(notFoundMessage);
    }
    return result;
  }

  /**
   * 重複チェック（作成前の確認）
   * @param table テーブル
   * @param column カラム
   * @param value 値
   * @param duplicateMessage 重複時のエラーメッセージ
   * @throws Error 重複している場合
   */
  static async ensureUnique(
    table: Table,
    column: Column,
    value: string,
    duplicateMessage: string
  ): Promise<void> {
    const exists = await this.exists(table, column, value);
    if (exists) {
      throw new Error(duplicateMessage);
    }
  }

  /**
   * 複数の重複チェック
   * @param checks 重複チェック配列
   */
  static async ensureMultipleUnique(
    checks: Array<{
      table: Table;
      column: Column;
      value: string;
      duplicateMessage: string;
    }>
  ): Promise<void> {
    for (const check of checks) {
      await this.ensureUnique(check.table, check.column, check.value, check.duplicateMessage);
    }
  }
}
