import { ERROR_MESSAGES } from '$lib/constants/error-messages.js';
import { CreateLibraryService } from '$lib/server/services/create-library-service';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types.js';

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const scriptId = formData.get('scriptId')?.toString();
    const repoUrl = formData.get('repoUrl')?.toString();

    if (!scriptId?.trim()) {
      return fail(400, { message: ERROR_MESSAGES.SCRIPT_ID_REQUIRED });
    }

    if (!repoUrl?.trim()) {
      return fail(400, { message: ERROR_MESSAGES.REPOSITORY_URL_REQUIRED });
    }

    // バリデーション（GitHubの命名規則に準拠）
    const githubRepoPattern =
      /^(?!.*\.\.)(?!.*\.$)[a-zA-Z0-9\-._]+\/(?!.*\.\.)(?!.*\.$)[a-zA-Z0-9\-._]+$/;
    if (!githubRepoPattern.test(repoUrl)) {
      return fail(400, {
        message: ERROR_MESSAGES.INVALID_REPOSITORY_URL,
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
