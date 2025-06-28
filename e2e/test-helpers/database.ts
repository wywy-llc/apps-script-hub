import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../../src/lib/server/db/schema.js';
import { library } from '../../src/lib/server/db/schema.js';
import type { SearchLibraryTestData } from '../factories/search-test-data.factory.js';

// E2Eテスト用のデータベース接続
const testPool = new Pool({
  connectionString:
    process.env.DATABASE_TEST_URL ||
    'postgresql://postgres:password@localhost:5433/apps_script_hub_test_db',
});

const testDb = drizzle(testPool, { schema });

/**
 * テストデータをデータベースに挿入する
 */
export async function insertTestLibraries(libraries: SearchLibraryTestData[]) {
  const insertData = libraries.map(lib => ({
    id: crypto.randomUUID(),
    name: lib.name,
    scriptId: lib.scriptId,
    repositoryUrl: lib.repositoryUrl,
    authorUrl: lib.authorUrl,
    authorName: lib.authorName,
    description: lib.description,
    readmeContent: lib.readmeContent,
    starCount: lib.starCount,
    status: lib.status,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  await testDb.insert(library).values(insertData);
  return insertData;
}

/**
 * 特定のライブラリIDでライブラリを挿入する（ID指定が必要な場合）
 */
export async function insertTestLibraryWithId(libraryData: SearchLibraryTestData, id: string) {
  const insertData = {
    id,
    name: libraryData.name,
    scriptId: libraryData.scriptId,
    repositoryUrl: libraryData.repositoryUrl,
    authorUrl: libraryData.authorUrl,
    authorName: libraryData.authorName,
    description: libraryData.description,
    readmeContent: libraryData.readmeContent,
    starCount: libraryData.starCount,
    status: libraryData.status,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await testDb.insert(library).values(insertData);
  return insertData;
}
