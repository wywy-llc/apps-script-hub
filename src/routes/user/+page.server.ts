import { db } from '$lib/server/db';
import { library, librarySummary } from '$lib/server/db/schema';
import { and, desc, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  // セッション情報を取得
  const session = await locals.auth();

  // 注目のライブラリを取得（公開済みライブラリのみを GitHub Star と Copy 回数の合計で降順ソート、上位6件）
  const featuredLibrariesResult = await db
    .select({
      id: library.id,
      name: library.name,
      scriptId: library.scriptId,
      repositoryUrl: library.repositoryUrl,
      authorUrl: library.authorUrl,
      authorName: library.authorName,
      description: library.description,
      licenseType: library.licenseType,
      licenseUrl: library.licenseUrl,
      starCount: library.starCount,
      copyCount: library.copyCount,
      lastCommitAt: library.lastCommitAt,
      status: library.status,
      scriptType: library.scriptType,
      requesterId: library.requesterId,
      requestNote: library.requestNote,
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
        usageExampleJa: librarySummary.usageExampleJa,
        usageExampleEn: librarySummary.usageExampleEn,
        seoTitleJa: librarySummary.seoTitleJa,
        seoTitleEn: librarySummary.seoTitleEn,
        seoDescriptionJa: librarySummary.seoDescriptionJa,
        seoDescriptionEn: librarySummary.seoDescriptionEn,
        createdAt: librarySummary.createdAt,
        updatedAt: librarySummary.updatedAt,
      },
    })
    .from(library)
    .leftJoin(librarySummary, eq(library.id, librarySummary.libraryId))
    .where(and(eq(library.status, 'published'), eq(library.scriptType, 'library')))
    .orderBy(desc(library.starCount), desc(library.copyCount))
    .limit(6);

  // 注目のWebアプリを取得（公開済みWeb アプリを GitHub Star と Copy 回数の合計で降順ソート、上位6件）
  const featuredWebAppsResult = await db
    .select({
      id: library.id,
      name: library.name,
      scriptId: library.scriptId,
      repositoryUrl: library.repositoryUrl,
      authorUrl: library.authorUrl,
      authorName: library.authorName,
      description: library.description,
      licenseType: library.licenseType,
      licenseUrl: library.licenseUrl,
      starCount: library.starCount,
      copyCount: library.copyCount,
      lastCommitAt: library.lastCommitAt,
      status: library.status,
      scriptType: library.scriptType,
      requesterId: library.requesterId,
      requestNote: library.requestNote,
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
        usageExampleJa: librarySummary.usageExampleJa,
        usageExampleEn: librarySummary.usageExampleEn,
        seoTitleJa: librarySummary.seoTitleJa,
        seoTitleEn: librarySummary.seoTitleEn,
        seoDescriptionJa: librarySummary.seoDescriptionJa,
        seoDescriptionEn: librarySummary.seoDescriptionEn,
        createdAt: librarySummary.createdAt,
        updatedAt: librarySummary.updatedAt,
      },
    })
    .from(library)
    .leftJoin(librarySummary, eq(library.id, librarySummary.libraryId))
    .where(and(eq(library.status, 'published'), eq(library.scriptType, 'web_app')))
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
    licenseType: row.licenseType,
    licenseUrl: row.licenseUrl,
    starCount: row.starCount,
    copyCount: row.copyCount,
    lastCommitAt: row.lastCommitAt,
    status: row.status,
    scriptType: row.scriptType,
    requesterId: row.requesterId,
    requestNote: row.requestNote,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    librarySummary: row.summary?.id ? row.summary : null,
  }));

  // Webアプリとサマリーを分離
  const featuredWebApps = featuredWebAppsResult.map(row => ({
    id: row.id,
    name: row.name,
    scriptId: row.scriptId,
    repositoryUrl: row.repositoryUrl,
    authorUrl: row.authorUrl,
    authorName: row.authorName,
    description: row.description,
    licenseType: row.licenseType,
    licenseUrl: row.licenseUrl,
    starCount: row.starCount,
    copyCount: row.copyCount,
    lastCommitAt: row.lastCommitAt,
    status: row.status,
    scriptType: row.scriptType,
    requesterId: row.requesterId,
    requestNote: row.requestNote,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    librarySummary: row.summary?.id ? row.summary : null,
  }));

  return {
    session,
    user: locals.user,
    featuredLibraries,
    featuredWebApps,
  };
};
