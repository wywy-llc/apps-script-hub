import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  // /admin へのアクセスを /admin/libraries にリダイレクト
  throw redirect(302, '/admin/libraries');
};
