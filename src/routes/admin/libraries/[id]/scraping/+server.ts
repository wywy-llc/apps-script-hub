import { UpdateLibraryFromGithubService } from '$lib/server/services/update-library.js';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';

export const POST: RequestHandler = async ({ params }) => {
  const libraryId = params.id;

  if (!libraryId) {
    throw error(400, { message: 'ライブラリIDが指定されていません。' });
  }

  // GitHubからライブラリ情報を更新
  await UpdateLibraryFromGithubService.call(libraryId);

  return json({
    success: true,
    message: 'スクレイピングが完了しました。',
  });
};
