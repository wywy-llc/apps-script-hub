import { db } from '$lib/server/db';
import { library, librarySummary, user } from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const libraryId = params.id;

  // ライブラリとライブラリ要約を取得
  const [libraryData] = await db
    .select({
      // library fields
      id: library.id,
      name: library.name,
      scriptId: library.scriptId,
      repositoryUrl: library.repositoryUrl,
      authorUrl: library.authorUrl,
      authorName: library.authorName,
      description: library.description,
      starCount: library.starCount,
      copyCount: library.copyCount,
      licenseType: library.licenseType,
      licenseUrl: library.licenseUrl,
      lastCommitAt: library.lastCommitAt,
      status: library.status,
      requesterId: library.requesterId,
      requestNote: library.requestNote,
      createdAt: library.createdAt,
      updatedAt: library.updatedAt,
      // requester info
      requesterName: user.name,
      requesterEmail: user.email,
      // library_summary fields
      summaryId: librarySummary.id,
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
    })
    .from(library)
    .leftJoin(user, eq(library.requesterId, user.id))
    .leftJoin(librarySummary, eq(library.id, librarySummary.libraryId))
    .where(eq(library.id, libraryId))
    .limit(1);

  if (!libraryData) {
    throw redirect(302, '/admin/libraries');
  }

  return {
    library: libraryData,
  };
};

export const actions: Actions = {
  updateLibrary: async ({ request, params }) => {
    const libraryId = params.id;
    const formData = await request.formData();

    // ライブラリ基本情報
    const name = formData.get('name')?.toString()?.trim();
    const scriptId = formData.get('scriptId')?.toString()?.trim();
    const repositoryUrl = formData.get('repositoryUrl')?.toString()?.trim();
    const authorName = formData.get('authorName')?.toString()?.trim();
    const authorUrl = formData.get('authorUrl')?.toString()?.trim();
    const description = formData.get('description')?.toString()?.trim();
    const licenseType = formData.get('licenseType')?.toString()?.trim();
    const licenseUrl = formData.get('licenseUrl')?.toString()?.trim();
    const status = formData.get('status')?.toString()?.trim();

    // ライブラリ要約情報
    const libraryNameJa = formData.get('libraryNameJa')?.toString()?.trim();
    const libraryNameEn = formData.get('libraryNameEn')?.toString()?.trim();
    const purposeJa = formData.get('purposeJa')?.toString()?.trim();
    const purposeEn = formData.get('purposeEn')?.toString()?.trim();
    const targetUsersJa = formData.get('targetUsersJa')?.toString()?.trim();
    const targetUsersEn = formData.get('targetUsersEn')?.toString()?.trim();
    const coreProblemJa = formData.get('coreProblemJa')?.toString()?.trim();
    const coreProblemEn = formData.get('coreProblemEn')?.toString()?.trim();
    const usageExampleJa = formData.get('usageExampleJa')?.toString()?.trim();
    const usageExampleEn = formData.get('usageExampleEn')?.toString()?.trim();
    const seoTitleJa = formData.get('seoTitleJa')?.toString()?.trim();
    const seoTitleEn = formData.get('seoTitleEn')?.toString()?.trim();
    const seoDescriptionJa = formData.get('seoDescriptionJa')?.toString()?.trim();
    const seoDescriptionEn = formData.get('seoDescriptionEn')?.toString()?.trim();

    // タグ情報（JSON配列として処理）
    const tagsJaStr = formData.get('tagsJa')?.toString()?.trim();
    const tagsEnStr = formData.get('tagsEn')?.toString()?.trim();

    let tagsJa: string[] | null = null;
    let tagsEn: string[] | null = null;

    try {
      if (tagsJaStr) {
        tagsJa = JSON.parse(tagsJaStr);
      }
      if (tagsEnStr) {
        tagsEn = JSON.parse(tagsEnStr);
      }
    } catch {
      return fail(400, { error: 'タグの形式が正しくありません。' });
    }

    // バリデーション
    if (!name || !scriptId || !repositoryUrl || !authorName || !description) {
      return fail(400, { error: '必須項目を入力してください。' });
    }

    if (!status || !['pending', 'published'].includes(status)) {
      return fail(400, { error: 'ステータスが正しくありません。' });
    }

    try {
      await db.transaction(async tx => {
        // ライブラリ情報を更新
        await tx
          .update(library)
          .set({
            name,
            scriptId,
            repositoryUrl,
            authorName,
            authorUrl: authorUrl || repositoryUrl,
            description,
            licenseType: licenseType || 'unknown',
            licenseUrl: licenseUrl || '',
            status: status as 'pending' | 'published',
            updatedAt: new Date(),
          })
          .where(eq(library.id, libraryId));

        // ライブラリ要約があるかチェック
        const existingSummary = await tx
          .select({ id: librarySummary.id })
          .from(librarySummary)
          .where(eq(librarySummary.libraryId, libraryId))
          .limit(1);

        const summaryData = {
          libraryNameJa: libraryNameJa || null,
          libraryNameEn: libraryNameEn || null,
          purposeJa: purposeJa || null,
          purposeEn: purposeEn || null,
          targetUsersJa: targetUsersJa || null,
          targetUsersEn: targetUsersEn || null,
          tagsJa,
          tagsEn,
          coreProblemJa: coreProblemJa || null,
          coreProblemEn: coreProblemEn || null,
          usageExampleJa: usageExampleJa || null,
          usageExampleEn: usageExampleEn || null,
          seoTitleJa: seoTitleJa || null,
          seoTitleEn: seoTitleEn || null,
          seoDescriptionJa: seoDescriptionJa || null,
          seoDescriptionEn: seoDescriptionEn || null,
          updatedAt: new Date(),
        };

        if (existingSummary.length > 0) {
          // 既存の要約を更新
          await tx
            .update(librarySummary)
            .set(summaryData)
            .where(eq(librarySummary.libraryId, libraryId));
        } else {
          // 新規要約を作成
          await tx.insert(librarySummary).values({
            id: crypto.randomUUID(),
            libraryId,
            ...summaryData,
            createdAt: new Date(),
          });
        }
      });

      return {
        success: true,
        message: 'ライブラリ情報を更新しました。',
      };
    } catch (error) {
      console.error('ライブラリ更新エラー:', error);
      return fail(500, {
        error: 'ライブラリの更新中にエラーが発生しました。',
      });
    }
  },
};
