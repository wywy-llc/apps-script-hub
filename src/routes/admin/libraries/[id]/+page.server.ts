import { db } from '$lib/server/db/index.js';
import { library, libraryMethod } from '$lib/server/db/schema.js';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ params }) => {
  const libraryId = params.id;

  if (!libraryId) {
    throw error(404, 'ライブラリが見つかりません。');
  }

  try {
    const result = await db
      .select()
      .from(library)
      .where(eq(library.id, libraryId))
      .limit(1);

    if (result.length === 0) {
      throw error(404, 'ライブラリが見つかりません。');
    }

    const libraryData = result[0];

    // ライブラリのメソッド情報も取得
    const methods = await db
      .select()
      .from(libraryMethod)
      .where(eq(libraryMethod.libraryId, libraryId));

    return {
      library: libraryData,
      methods: methods.map(method => ({
        ...method,
        parameters: JSON.parse(method.parameters), // JSON文字列をパース
      })),
    };
  } catch (err) {
    console.error('ライブラリ取得エラー:', err);
    throw error(500, 'ライブラリの取得に失敗しました。');
  }
};
