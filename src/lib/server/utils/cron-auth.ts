import { env } from '$env/dynamic/private';
import { createAppUrl } from '$lib/constants/app-config.js';
import { error } from '@sveltejs/kit';

/**
 * cron API認証を検証
 *
 * @param request - HTTPリクエストオブジェクト
 * @throws {Error} 認証に失敗した場合はHTTP 401エラーをスロー
 */
export function validateCronAuth(request: Request): void {
  const AUTH_SECRET = env.AUTH_SECRET;

  if (!AUTH_SECRET) {
    console.error('AUTH_SECRET環境変数が設定されていません');
    throw error(500, 'サーバー設定エラー');
  }

  // 1. Authorization Bearer トークンをチェック
  const authHeader = request.headers.get('Authorization');
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    if (token === AUTH_SECRET) {
      return; // 認証成功
    }
  }

  // 2. X-Cron-Auth ヘッダーをチェック
  const cronAuthHeader = request.headers.get('X-Cron-Auth');
  if (cronAuthHeader === AUTH_SECRET) {
    return; // 認証成功
  }

  // 3. クエリパラメータをチェック
  const url = new URL(request.url);
  const authParam = url.searchParams.get('auth');
  if (authParam === AUTH_SECRET) {
    return; // 認証成功
  }

  // すべての認証方法で失敗
  console.warn(`cron API認証失敗: ${new URL(request.url).pathname}`);
  throw error(401, '認証が必要です');
}

/**
 * 認証ヘッダーを生成（cURL用）
 *
 * @returns Authorization ヘッダーの値
 */
export function generateAuthHeader(): string {
  const AUTH_SECRET = env.AUTH_SECRET;

  if (!AUTH_SECRET) {
    throw new Error('AUTH_SECRET環境変数が設定されていません');
  }
  return `Bearer ${AUTH_SECRET}`;
}

/**
 * 認証付きcURLコマンドの例を生成
 *
 * @param endpoint - APIエンドポイント
 * @param data - POSTデータ（JSON）
 * @returns cURLコマンド文字列
 */
export function generateCronCurlCommand(endpoint: string, data: Record<string, unknown>): string {
  const AUTH_SECRET = env.AUTH_SECRET;

  if (!AUTH_SECRET) {
    throw new Error('AUTH_SECRET環境変数が設定されていません');
  }

  const jsonData = JSON.stringify(data).replace(/"/g, '\\"');
  const fullUrl = createAppUrl(endpoint);

  return (
    `/usr/bin/curl -X POST ${fullUrl} ` +
    `-H "Content-Type: application/json" ` +
    `-H "Authorization: Bearer ${AUTH_SECRET}" ` +
    `-d "${jsonData}"`
  );
}
