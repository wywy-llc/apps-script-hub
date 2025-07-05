import { UpdateLibraryFromGithubService } from '$lib/server/services/update-library-from-github-service';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';

export const POST: RequestHandler = async ({ params }) => {
  const libraryId = params.id;

  if (!libraryId) {
    throw error(400, { message: 'ライブラリIDが指定されていません。' });
  }

  try {
    // GitHubからライブラリ情報を更新（AI要約生成はスキップ）
    await UpdateLibraryFromGithubService.call(libraryId, { skipAiSummary: true });

    return json({
      success: true,
      message: 'スクレイピングが完了しました。',
    });
  } catch (err) {
    console.error('スクレイピング処理エラー:', err);
    console.error(
      'エラースタックトレース:',
      err instanceof Error ? err.stack : 'スタックトレース不明'
    );

    throw error(500, {
      message:
        'スクレイピング処理中にエラーが発生しました。しばらく時間をおいて再度お試しください。',
    });
  }
};
