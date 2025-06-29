import { db } from '$lib/server/db/index.js';
import { library } from '$lib/server/db/schema.js';
import { eq, like, or, sql } from 'drizzle-orm';
export const load = async ({ url }: { url: URL }) => {
  const searchQuery = url.searchParams.get('q') || '';
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const itemsPerPage = 10;
  const offset = (page - 1) * itemsPerPage;

  if (!searchQuery) {
    // 検索クエリがない場合は、公開されているすべてのライブラリを取得
    const [libraries, totalCount] = await Promise.all([
      db
        .select()
        .from(library)
        .where(eq(library.status, 'published'))
        .orderBy(library.updatedAt)
        .limit(itemsPerPage)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(library)
        .where(eq(library.status, 'published'))
        .then(result => result[0]?.count || 0),
    ]);

    return {
      libraries,
      totalResults: totalCount,
      searchQuery: '',
      currentPage: page,
      itemsPerPage,
    };
  }

  // 検索クエリがある場合は、名前、説明、作者名で検索
  const searchCondition = or(
    like(library.name, `%${searchQuery}%`),
    like(library.description, `%${searchQuery}%`),
    like(library.authorName, `%${searchQuery}%`)
  );

  const [libraries, totalCount] = await Promise.all([
    db
      .select()
      .from(library)
      .where(sql`${eq(library.status, 'published')} AND (${searchCondition})`)
      .orderBy(library.updatedAt)
      .limit(itemsPerPage)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(library)
      .where(sql`${eq(library.status, 'published')} AND (${searchCondition})`)
      .then(result => result[0]?.count || 0),
  ]);

  return {
    libraries,
    totalResults: totalCount,
    searchQuery,
    currentPage: page,
    itemsPerPage,
  };
};
