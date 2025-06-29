import { LIBRARY_STATUS } from '$lib/constants/library-status.js';
import { db } from '$lib/server/db/index.js';
import { library } from '$lib/server/db/schema.js';
import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ params }) => {
  const libraryId = params.id;

  if (!libraryId) {
    error(400, 'ライブラリIDが指定されていません');
  }

  // データベースから公開されているライブラリのみを取得
  const [libraryData] = await db
    .select({
      id: library.id,
      name: library.name,
      scriptId: library.scriptId,
      repositoryUrl: library.repositoryUrl,
      authorUrl: library.authorUrl,
      authorName: library.authorName,
      description: library.description,
      readmeContent: library.readmeContent,
      starCount: library.starCount,
      copyCount: library.copyCount,
      licenseType: library.licenseType,
      licenseUrl: library.licenseUrl,
      lastCommitAt: library.lastCommitAt,
      status: library.status,
      createdAt: library.createdAt,
      updatedAt: library.updatedAt,
    })
    .from(library)
    .where(and(eq(library.id, libraryId), eq(library.status, LIBRARY_STATUS.PUBLISHED)))
    .limit(1);

  if (!libraryData) {
    error(404, 'ライブラリが見つかりません');
  }

  return {
    library: libraryData,
  };
};
