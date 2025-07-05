import { db } from '$lib/server/db/index.js';
import { library, librarySummary } from '$lib/server/db/schema.js';
import { eq, like, or, sql } from 'drizzle-orm';
export const load = async ({ url }: { url: URL }) => {
  const searchQuery = url.searchParams.get('q') || '';
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const itemsPerPage = 10;
  const offset = (page - 1) * itemsPerPage;

  if (!searchQuery) {
    // 検索クエリがない場合は、公開されているすべてのライブラリを取得
    const [librariesResult, totalCount] = await Promise.all([
      db
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

    // ライブラリとサマリーを分離
    const libraries = librariesResult.map(row => ({
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
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      librarySummary: row.summary?.id ? row.summary : null,
    }));

    return {
      libraries,
      totalResults: totalCount,
      searchQuery: '',
      currentPage: page,
      itemsPerPage,
    };
  }

  // 検索クエリがある場合は、名前、作者名、AI要約の情報とタグで検索
  const searchCondition = or(
    like(library.name, `%${searchQuery}%`),
    like(library.authorName, `%${searchQuery}%`),
    like(librarySummary.libraryNameJa, `%${searchQuery}%`),
    like(librarySummary.libraryNameEn, `%${searchQuery}%`),
    like(librarySummary.purposeJa, `%${searchQuery}%`),
    like(librarySummary.purposeEn, `%${searchQuery}%`),
    // タグ配列内の部分検索（JSONB演算子使用）
    sql`${librarySummary.tagsJa}::text ILIKE ${'%' + searchQuery + '%'}`,
    sql`${librarySummary.tagsEn}::text ILIKE ${'%' + searchQuery + '%'}`
  );

  const [librariesResult, totalCount] = await Promise.all([
    db
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
      .where(sql`${eq(library.status, 'published')} AND (${searchCondition})`)
      .orderBy(library.updatedAt)
      .limit(itemsPerPage)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(library)
      .leftJoin(librarySummary, eq(library.id, librarySummary.libraryId))
      .where(sql`${eq(library.status, 'published')} AND (${searchCondition})`)
      .then(result => result[0]?.count || 0),
  ]);

  // ライブラリとサマリーを分離
  const libraries = librariesResult.map(row => ({
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
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    librarySummary: row.summary?.id ? row.summary : null,
  }));

  return {
    libraries,
    totalResults: totalCount,
    searchQuery,
    currentPage: page,
    itemsPerPage,
  };
};
