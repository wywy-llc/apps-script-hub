import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
  // すでにログイン済みの場合はリダイレクト
  if (locals.user) {
    const redirectTo = url.searchParams.get('redirect') || '/user';
    throw new Response(null, {
      status: 302,
      headers: { Location: redirectTo },
    });
  }

  // リダイレクト先を取得（デフォルトは /user）
  const redirectTo = url.searchParams.get('redirect') || '/user';

  return {
    redirectTo,
  };
};
