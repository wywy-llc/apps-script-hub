import { db } from '$lib/server/db';
import { library, librarySummary } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  // セッション情報を取得
  const session = await locals.auth();

  // 注目のライブラリを取得（公開済みライブラリを GitHub Star と Copy 回数の合計で降順ソート、上位6件）
  const featuredLibrariesResult = await db
    .select({
      id: library.id,
      name: library.name,
      scriptId: library.scriptId,
      repositoryUrl: library.repositoryUrl,
      authorUrl: library.authorUrl,
      authorName: library.authorName,
      description: library.description,
      readmeContent: library.readmeContent,
      licenseType: library.licenseType,
      licenseUrl: library.licenseUrl,
      starCount: library.starCount,
      copyCount: library.copyCount,
      lastCommitAt: library.lastCommitAt,
      status: library.status,
      createdAt: library.createdAt,
      updatedAt: library.updatedAt,
      summary: {
        id: librarySummary.id,
        libraryId: librarySummary.libraryId,
        libraryNameJa: librarySummary.libraryNameJa,
        libraryNameEn: librarySummary.libraryNameEn,
        purposeJa: librarySummary.purposeJa,
        purposeEn: librarySummary.purposeEn,
        targetUsersJa: librarySummary.targetUsersJa,
        targetUsersEn: librarySummary.targetUsersEn,
        tagsJa: librarySummary.tagsJa,
        tagsEn: librarySummary.tagsEn,
        coreProblemJa: librarySummary.coreProblemJa,
        coreProblemEn: librarySummary.coreProblemEn,
        mainBenefits: librarySummary.mainBenefits,
        createdAt: librarySummary.createdAt,
        updatedAt: librarySummary.updatedAt,
      },
    })
    .from(library)
    .leftJoin(librarySummary, eq(library.id, librarySummary.libraryId))
    .where(eq(library.status, 'published'))
    .orderBy(desc(library.starCount), desc(library.copyCount))
    .limit(6);

  // ライブラリとサマリーを分離
  const featuredLibraries = featuredLibrariesResult.map(row => ({
    id: row.id,
    name: row.name,
    scriptId: row.scriptId,
    repositoryUrl: row.repositoryUrl,
    authorUrl: row.authorUrl,
    authorName: row.authorName,
    description: row.description,
    readmeContent: row.readmeContent,
    licenseType: row.licenseType,
    licenseUrl: row.licenseUrl,
    starCount: row.starCount,
    copyCount: row.copyCount,
    lastCommitAt: row.lastCommitAt,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    librarySummary: row.summary?.id ? row.summary : null,
  }));

  return {
    session,
    user: locals.user,
    featuredLibraries,
  };
};
