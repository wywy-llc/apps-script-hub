import { env } from '$env/dynamic/private';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  // テスト環境では認証をスキップ
  if (env.NODE_ENV === 'test') {
    return {
      session: null,
      user: null,
    };
  }

  // Auth.jsのセッション情報を取得
  const session = await locals.auth();

  return {
    session,
    user: locals.user,
  };
};
