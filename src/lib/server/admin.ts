import { env } from '$env/dynamic/private';

/**
 * 指定されたメールアドレスが管理者かどうかをチェックする
 * @param email - チェックするメールアドレス
 * @returns 管理者の場合true、そうでなければfalse
 */
export function isAdminUser(email: string): boolean {
  const adminEmails = env.ADMIN_EMAILS;
  
  if (!adminEmails) {
    return false;
  }

  // カンマ区切りで複数のメールアドレスをサポート
  const adminEmailList = adminEmails
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(email => email.length > 0);

  return adminEmailList.includes(email.toLowerCase());
}

/**
 * 管理者メールアドレスのリストを取得する
 * @returns 管理者メールアドレスの配列
 */
export function getAdminEmails(): string[] {
  const adminEmails = env.ADMIN_EMAILS;
  
  if (!adminEmails) {
    return [];
  }

  return adminEmails
    .split(',')
    .map(email => email.trim())
    .filter(email => email.length > 0);
}