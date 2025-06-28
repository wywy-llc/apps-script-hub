import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/**
 * トップページサーバーロード関数
 * ルートアクセス時に /user ページにリダイレクトする
 */
export const load: PageServerLoad = async () => {
  // トップページにアクセスした場合、/userにリダイレクト
  throw redirect(302, '/user');
};
