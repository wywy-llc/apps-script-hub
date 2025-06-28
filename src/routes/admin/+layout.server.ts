import { redirect } from '@sveltejs/kit';
import { isAdminUser } from '$lib/server/admin';
import { env } from '$env/dynamic/private';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  // テスト環境では認証をスキップ
  if (env.NODE_ENV === 'test') {
    return {
      session: {
        user: {
          id: 'test-user',
          email: 'test@example.com',
          name: 'Test User',
        },
      },
      user: {
        id: 'test-user',
        email: 'test@example.com',
        name: 'Test User',
        googleId: 'test-google-id',
        picture: null,
        createdAt: new Date(),
      },
    };
  }

  // Auth.jsのセッション情報を取得
  const session = await locals.auth();

  // セッションが存在しない場合はログイン画面にリダイレクト
  if (!session?.user?.email) {
    throw redirect(302, '/auth/login');
  }

  // 管理者権限をチェック
  if (!isAdminUser(session.user.email)) {
    throw redirect(302, '/auth/unauthorized');
  }

  return {
    session,
    user: locals.user,
  };
};
