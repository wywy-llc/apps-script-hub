import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  // Auth.jsのセッション情報を取得
  const session = await locals.auth();

  // セッションが存在しない場合はログイン画面にリダイレクト
  if (!session?.user?.email) {
    throw redirect(302, '/auth/login');
  }

  return {
    session,
    user: locals.user,
  };
};
