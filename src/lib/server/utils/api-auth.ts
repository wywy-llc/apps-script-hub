import { env } from '$env/dynamic/private';
import { createAppUrl } from '$lib/constants/app-config.js';
import { error } from '@sveltejs/kit';

/**
 * API認証を検証（AUTH_SECRET認証）
 *
 * @param request - HTTPリクエストオブジェクト
 * @throws {Error} 認証に失敗した場合はHTTP 401エラーをスロー
 */
export async function validateApiAuth(request: Request): Promise<void> {
  // AUTH_SECRET認証を試行
  if (tryValidateAuthSecret(request)) {
    return; // 認証成功
  }

  // 認証失敗
  console.warn(`API認証失敗: ${new URL(request.url).pathname}`);
  throw error(401, '認証が必要です');
}

/**
 * AUTH_SECRET認証を試行
 *
 * @param request - HTTPリクエストオブジェクト
 * @returns 認証成功の場合true、失敗の場合false
 */
function tryValidateAuthSecret(request: Request): boolean {
  const AUTH_SECRET = env.AUTH_SECRET;

  if (!AUTH_SECRET) {
    return false; // 環境変数が設定されていない場合は失敗
  }

  // 1. Authorization Bearer トークンをチェック
  const authHeader = request.headers.get('authorization');

  if (authHeader) {
    const match = authHeader.match(/^Bearer\s+(.*)$/i);
    if (match) {
      const token = match[1];

      if (token === AUTH_SECRET) {
        return true;
      }
    }
  }

  // 2. クエリパラメータをチェック
  const url = new URL(request.url);
  const authParam = url.searchParams.get('auth');

  if (authParam === AUTH_SECRET) {
    return true;
  }

  return false;
}

/**
 * cron API認証を検証（後方互換性のためのエイリアス）
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

  // AUTH_SECRET認証を実行
  if (tryValidateAuthSecret(request)) {
    return; // 認証成功
  }

  // 認証失敗
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
export function generateApiCurlCommand(endpoint: string, data: Record<string, unknown>): string {
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

/**
 * 認証付きcURLコマンドの例を生成（後方互換性のためのエイリアス）
 *
 * @param endpoint - APIエンドポイント
 * @param data - POSTデータ（JSON）
 * @returns cURLコマンド文字列
 */
export function generateCronCurlCommand(endpoint: string, data: Record<string, unknown>): string {
  return generateApiCurlCommand(endpoint, data);
}
