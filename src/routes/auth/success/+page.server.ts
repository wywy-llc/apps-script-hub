import { redirect } from '@sveltejs/kit';
import { isAdminUser } from '$lib/server/admin';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  // セッション情報を取得
  const session = await locals.auth();

  if (!session?.user?.email) {
    // セッションがない場合はログインページにリダイレクト
    throw redirect(302, '/auth/login');
  }

  // 管理者かどうかをチェックしてリダイレクト先を決定
  if (isAdminUser(session.user.email)) {
    throw redirect(302, '/admin');
  } else {
    throw redirect(302, '/user');
  }
};
