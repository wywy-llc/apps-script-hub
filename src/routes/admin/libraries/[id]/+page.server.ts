import { db } from '$lib/server/db/index.js';
import { library } from '$lib/server/db/schema.js';
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

    return {
      library: libraryData,
    };
  } catch (err) {
    console.error('ライブラリ取得エラー:', err);
    throw error(500, 'ライブラリの取得に失敗しました。');
  }
};
