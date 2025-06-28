import { sql } from 'drizzle-orm';
import { user } from '../../src/lib/server/db/schema';
import { createDatabaseFactory, createPresetFactories, generateUniqueId } from './base.factory';

/**
 * ユーザー作成用入力データ（drizzleスキーマから推論）
 */
export type CreateUserInput = Omit<typeof user.$inferInsert, 'id' | 'createdAt'>;

/**
 * ユーザーテストデータ（drizzleスキーマベース）
 */
export type UserTestData = CreateUserInput;

/**
 * データベース作成用のユーザー情報
 */
export interface DatabaseUserData extends CreateUserInput {
  id: string;
}

/**
 * ユーザーテストデータのFactory群
 * プリセットパターンを使用して複数のテストケースを簡単に生成
 *
 * 使用例:
 * ```typescript
 * // デフォルトユーザーデータを生成
 * const userData = UserTestDataFactories.default.build();
 *
 * // 管理者ユーザーデータを生成
 * const adminData = UserTestDataFactories.admin.build();
 *
 * // 特定の値を上書きして生成
 * const customUserData = UserTestDataFactories.default.build({
 *   email: 'custom@example.com',
 *   name: 'Custom User'
 * });
 * ```
 */
export const UserTestDataFactories = createPresetFactories<UserTestData>({
  default: () => ({
    email: 'test@example.com',
    name: 'Test User',
    picture: 'https://example.com/avatar.jpg',
    googleId: 'google_test_id',
  }),
  admin: () => ({
    email: 'admin@example.com',
    name: 'Admin User',
    picture: 'https://example.com/admin-avatar.jpg',
    googleId: 'google_admin_id',
  }),
  guest: () => ({
    email: 'guest@example.com',
    name: 'Guest User',
    picture: undefined,
    googleId: 'google_guest_id',
  }),
});

/**
 * データベース作成用のユーザーデータFactory
 * 共通化されたcreateDatabaseFactoryを使用してデータベースに直接ユーザーを作成
 */
export const DatabaseUserDataFactory = createDatabaseFactory<DatabaseUserData>(
  'user',
  () => {
    const uniqueId = generateUniqueId('user');
    const timestamp = Date.now();
    return {
      id: uniqueId,
      email: `test-${timestamp}@example.com`,
      name: 'Test User',
      picture: 'https://example.com/avatar.jpg',
      googleId: `google_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
    };
  },
  async (db, userData) => {
    await db.execute(sql`
      INSERT INTO "user" (
        "id", "email", "name", "picture", "google_id"
      ) VALUES (
        ${userData.id}, ${userData.email}, ${userData.name}, 
        ${userData.picture}, ${userData.googleId}
      )
    `);
    return userData.id;
  }
);

/**
 * DatabaseUserDataFactoryの使用例
 *
 * ```typescript
 * // Fisheryのcreate()メソッドを使用してデータベースにユーザーを直接作成
 *
 * // デフォルトユーザーを作成
 * const userId = await DatabaseUserDataFactory.create();
 *
 * // カスタムデータでユーザーを作成
 * const customUserId = await DatabaseUserDataFactory.create({
 *   email: 'custom@example.com',
 *   name: 'Custom User',
 *   picture: null
 * });
 * ```
 */
