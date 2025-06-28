import { db } from '$lib/server/db';
import { library } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load = (async () => {
  // ライブラリ一覧をデータベースから取得
  const libraries = await db
    .select({
      id: library.id,
      name: library.name,
      scriptId: library.scriptId,
      authorName: library.authorName,
      authorUrl: library.authorUrl,
      status: library.status,
      updatedAt: library.updatedAt,
      starCount: library.starCount,
      description: library.description,
    })
    .from(library)
    .orderBy(desc(library.updatedAt));

  return {
    libraries,
  };
}) satisfies PageServerLoad;
