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

  try {
    const result = await db.select().from(library).where(eq(library.id, libraryId)).limit(1);

    if (result.length === 0) {
      throw error(404, 'ライブラリが見つかりません。');
    }

    const libraryData = result[0];

    return {
      library: libraryData,
    };
  } catch (err) {
    console.error('ライブラリ取得エラー:', err);
    throw error(500, 'ライブラリの取得に失敗しました。');
  }
};

export const actions: Actions = {
  /**
   * ライブラリのステータスを更新する
   * published: 承認して公開
   * rejected: 拒否
   */
  updateStatus: async ({ params, request }) => {
    const libraryId = params.id;

    if (!libraryId) {
      return fail(400, { error: 'ライブラリIDが不正です。' });
    }

    const formData = await request.formData();
    const status = formData.get('status') as string;

    // ステータスのバリデーション
    if (!status || !['published', 'rejected', 'pending'].includes(status)) {
      return fail(400, { error: '無効なステータスです。' });
    }

    try {
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
          status: status as 'pending' | 'published' | 'rejected',
          updatedAt: new Date(),
        })
        .where(eq(library.id, libraryId));

      // 成功メッセージを返す
      const statusMessages = {
        published: 'ライブラリを承認し、公開しました。',
        rejected: 'ライブラリを拒否しました。',
        pending: 'ライブラリを承認待ちに戻しました。',
      };

      return {
        success: true,
        message: statusMessages[status as keyof typeof statusMessages],
        newStatus: status,
      };
    } catch (err) {
      console.error('ステータス更新エラー:', err);
      return fail(500, {
        error: 'ステータスの更新に失敗しました。しばらくしてから再度お試しください。',
      });
    }
  },
};
