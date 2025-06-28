import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  // Auth.jsのセッション情報を取得
  const session = await locals.auth();

  return {
    session,
    user: locals.user,
  };
};
