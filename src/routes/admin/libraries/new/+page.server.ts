import { CreateLibraryService } from '$lib/server/services/library.js';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types.js';

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const scriptId = formData.get('scriptId')?.toString();
    const repoUrl = formData.get('repoUrl')?.toString();

    if (!scriptId?.trim()) {
      return fail(400, { message: 'GAS スクリプトIDを入力してください' });
    }

    if (!repoUrl?.trim()) {
      return fail(400, { message: 'GitHub リポジトリURLを入力してください' });
    }

    // バリデーション
    const githubRepoPattern = /^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+$/;
    if (!githubRepoPattern.test(repoUrl)) {
      return fail(400, {
        message: 'GitHub リポジトリURLの形式が正しくありません',
      });
    }

    try {
      const libraryId = await CreateLibraryService.call({
        scriptId,
        repoUrl,
      });

      return {
        success: true,
        id: libraryId,
      };
    } catch (err) {
      // スタックトレースを出力してからユーザーフレンドリーなエラーを返す
      console.error('ライブラリ作成エラー:', err);
      return fail(500, {
        message: err instanceof Error ? err.message : 'ライブラリの作成に失敗しました。',
      });
    }
  },
};
