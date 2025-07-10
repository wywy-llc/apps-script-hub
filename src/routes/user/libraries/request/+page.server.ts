import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  // 認証チェック
  if (!locals.user) {
    throw redirect(302, '/auth/register?redirect=/user/libraries/request');
  }

  return {};
};

export const actions: Actions = {
  submitRequest: async ({ request, locals }) => {
    // 認証チェック
    if (!locals.user) {
      return fail(401, { error: 'ログインが必要です。' });
    }

    const formData = await request.formData();
    const scriptId = formData.get('scriptId')?.toString()?.trim();
    const repoUrl = formData.get('repoUrl')?.toString()?.trim();

    // バリデーション
    if (!scriptId || !repoUrl) {
      return fail(400, { error: '全ての項目を入力してください。' });
    }

    // GitHub URL形式のチェック（GitHubの命名規則に準拠）
    if (
      !repoUrl.match(/^(?!.*\.\.)(?!.*\.$)[a-zA-Z0-9\-._]+\/(?!.*\.\.)(?!.*\.$)[a-zA-Z0-9\-._]+$/)
    ) {
      return fail(400, { error: 'GitHub リポジトリURLの形式が正しくありません。' });
    }

    // スクリプトIDの重複チェック
    try {
      const existingLibrary = await db
        .select()
        .from(table.library)
        .where(eq(table.library.scriptId, scriptId))
        .limit(1);

      if (existingLibrary.length > 0) {
        return fail(400, { error: 'このスクリプトIDは既に登録されています。' });
      }

      // GitHub リポジトリURLの重複チェック
      const fullRepoUrl = `https://github.com/${repoUrl}`;
      const existingRepo = await db
        .select()
        .from(table.library)
        .where(eq(table.library.repositoryUrl, fullRepoUrl))
        .limit(1);

      if (existingRepo.length > 0) {
        return fail(400, { error: 'このGitHubリポジトリは既に登録されています。' });
      }

      // ライブラリ申請レコードを作成
      // ステータスは'pending'として、管理者による承認を待つ
      const libraryId = nanoid();
      await db.insert(table.library).values({
        id: libraryId,
        scriptId: scriptId,
        name: `申請中: ${repoUrl}`, // 仮の名前（後で管理者が正式名に変更）
        description: 'ユーザーからの申請により追加されたライブラリです。', // デフォルトの説明
        authorName: 'unknown', // 仮の値（後でGitHub APIから取得）
        authorUrl: fullRepoUrl,
        repositoryUrl: fullRepoUrl,
        status: 'pending', // 申請中ステータス
        starCount: 0,
        copyCount: 0,
        licenseType: 'unknown',
        licenseUrl: '',
        lastCommitAt: new Date(),
        requesterId: locals.user.id, // 申請者のユーザーID
        requestNote: `ユーザー申請: ${scriptId} (${fullRepoUrl})`, // 申請メモ
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return { success: true, id: libraryId };
    } catch (error) {
      console.error('GASライブラリ追加申請エラー:', error);
      return fail(500, { error: 'GASライブラリ追加申請中にエラーが発生しました。' });
    }
  },
};
