import { db } from '$lib/server/db/index.js';
import { library } from '$lib/server/db/schema.js';
import { LIBRARY_STATUS } from '$lib/constants/library-status.js';
import { error, json } from '@sveltejs/kit';
import { eq, and, sql } from 'drizzle-orm';
import type { RequestHandler } from './$types.js';

export const POST: RequestHandler = async ({ params }) => {
  const libraryId = params.id;

  if (!libraryId) {
    error(400, 'ライブラリIDが指定されていません');
  }

  // 公開されているライブラリのみコピー回数を増加
  const result = await db
    .update(library)
    .set({
      copyCount: sql`${library.copyCount} + 1`,
      updatedAt: new Date(),
    })
    .where(and(eq(library.id, libraryId), eq(library.status, LIBRARY_STATUS.PUBLISHED)))
    .returning({ copyCount: library.copyCount });

  if (result.length === 0) {
    error(404, 'ライブラリが見つかりません');
  }

  return json({
    success: true,
    copyCount: result[0].copyCount,
  });
};
