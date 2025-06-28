import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Factory } from 'fishery';
import { Client } from 'pg';

// 環境変数を読み込み
config();

/**
 * データベース接続設定
 * 全てのfactoryで使用する共通のPostgreSQL接続設定
 */
export const POSTGRES_CONFIG = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5433', 10),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_TEST_DB || 'apps_script_hub_test_db',
};

/**
 * データベース接続を作成する共通ユーティリティ
 * @returns Promise<{ client: Client, db: ReturnType<typeof drizzle> }>
 */
export const createDbConnection = async () => {
  const client = new Client(POSTGRES_CONFIG);
  await client.connect();
  const db = drizzle(client);
  return { client, db };
};

/**
 * データベース接続を安全に閉じる共通ユーティリティ
 * @param client PostgreSQLクライアント
 */
export const closeDbConnection = async (client: Client) => {
  await client.end();
};

/**
 * 一意なIDを生成するヘルパー関数
 * @param prefix IDの接頭辞
 * @returns 一意なID文字列
 */
export const generateUniqueId = (prefix: string = 'id'): string => {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substr(2, 9);
  return `${prefix}_${timestamp}_${randomSuffix}`;
};

/**
 * データベースファクトリの基底クラス
 *
 * 使用例:
 * ```typescript
 * export const MyModelFactory = createDatabaseFactory<MyModelData>(
 *   'my_model',
 *   () => ({
 *     id: generateUniqueId('my'),
 *     name: 'test-name',
 *     // ... その他のフィールド
 *   }),
 *   async (db, data) => {
 *     await db.execute(sql`
 *       INSERT INTO "my_model" ("id", "name")
 *       VALUES (${data.id}, ${data.name})
 *     `);
 *     return data.id;
 *   }
 * );
 * ```
 */
export const createDatabaseFactory = <T, TCreateReturn = string>(
  tableName: string,
  defaultDataFactory: () => T,
  insertFunction: (db: ReturnType<typeof drizzle>, data: T) => Promise<TCreateReturn>
) => {
  return Factory.define<T, Partial<T>, TCreateReturn>(({ onCreate }) => {
    onCreate(async data => {
      const { client, db } = await createDbConnection();

      try {
        return await insertFunction(db, data);
      } catch (error) {
        console.error(`❌ ${tableName}作成エラー:`, error);
        throw error;
      } finally {
        await closeDbConnection(client);
      }
    });

    return defaultDataFactory();
  });
};

/**
 * 単純なテストデータファクトリの基底クラス
 * データベースに保存しない、テスト用データ生成のみ
 *
 * 使用例:
 * ```typescript
 * export interface MyTestData {
 *   id: string;
 *   name: string;
 * }
 *
 * export const MyTestDataFactory = createTestDataFactory<MyTestData>(() => ({
 *   id: generateUniqueId('test'),
 *   name: 'test-name',
 * }));
 * ```
 */
export const createTestDataFactory = <T>(defaultDataFactory: () => T) => {
  return Factory.define<T>(defaultDataFactory);
};

/**
 * 複数のプリセットを持つテストデータファクトリを作成
 *
 * 使用例:
 * ```typescript
 * export const MyPresetFactories = createPresetFactories<MyTestData>({
 *   default: () => ({ id: '1', name: 'default' }),
 *   custom: () => ({ id: '2', name: 'custom' }),
 * });
 *
 * // 使用時
 * const defaultData = MyPresetFactories.default.build();
 * const customData = MyPresetFactories.custom.build();
 * ```
 */
export const createPresetFactories = <T>(
  presets: Record<string, () => T>
): Record<string, Factory<T>> => {
  const factories: Record<string, Factory<T>> = {};

  for (const [key, dataFactory] of Object.entries(presets)) {
    factories[key] = createTestDataFactory(dataFactory);
  }

  return factories;
};
