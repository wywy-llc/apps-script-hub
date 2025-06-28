import { db } from '$lib/server/db';
import { library } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  // セッション情報を取得
  const session = await locals.auth();

  // 注目のライブラリを取得（公開済みライブラリを GitHub Star と Copy 回数の合計で降順ソート、上位6件）
  const featuredLibraries = await db
    .select()
    .from(library)
    .where(eq(library.status, 'published'))
    .orderBy(desc(library.starCount), desc(library.copyCount))
    .limit(6);

  return {
    session,
    user: locals.user,
    featuredLibraries,
  };
};
