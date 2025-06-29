import { LIBRARY_STATUS, type LibraryStatus } from '$lib/constants/library-status.js';
import { db } from '$lib/server/db/index.js';
import { library } from '$lib/server/db/schema.js';
import { error, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ params }) => {
  const libraryId = params.id;

  if (!libraryId) {
    throw error(404, 'ライブラリが見つかりません。');
  }

  const result = await db
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
    .where(eq(library.id, libraryId))
    .limit(1);

  if (result.length === 0) {
    throw error(404, 'ライブラリが見つかりません。');
  }

  const libraryData = result[0];

  return {
    library: libraryData,
  };
};

export const actions: Actions = {
  /**
   * ライブラリのステータスを更新する
   * published: 承認して公開
   * pending: 未公開に戻す
   */
  updateStatus: async ({ params, request }) => {
    const libraryId = params.id;

    if (!libraryId) {
      return fail(400, { error: 'ライブラリIDが不正です。' });
    }

    const formData = await request.formData();
    const status = formData.get('status') as string;

    // ステータスのバリデーション
    if (!status || !Object.values(LIBRARY_STATUS).includes(status as LibraryStatus)) {
      return fail(400, { error: '無効なステータスです。' });
    }

    // ライブラリの存在確認
    const existingLibrary = await db
      .select()
      .from(library)
      .where(eq(library.id, libraryId))
      .limit(1);

    if (existingLibrary.length === 0) {
      return fail(404, { error: 'ライブラリが見つかりません。' });
    }

    // ステータスを更新
    await db
      .update(library)
      .set({
        status: status as LibraryStatus,
        updatedAt: new Date(),
      })
      .where(eq(library.id, libraryId));

    // 成功メッセージを返す
    const statusMessages = {
      [LIBRARY_STATUS.PUBLISHED]: 'ライブラリを公開しました。',
      [LIBRARY_STATUS.PENDING]: 'ライブラリを未公開にしました。',
    };

    return {
      success: true,
      message: statusMessages[status as LibraryStatus],
      newStatus: status,
    };
  },
};
