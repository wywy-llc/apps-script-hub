/**
 * URLを短縮表示するヘルパー関数とGASサンプルアプリ用のURL処理機能
 *
 * 使用例:
 * ```typescript
 * import { truncateUrl, extractGasScriptId, isValidGasWebAppUrl } from '$lib/helpers/url';
 *
 * const longUrl = 'https://github.com/googleworkspace/apps-script-oauth2';
 * const shortUrl = truncateUrl(longUrl); // "https://github.com/googleworkspace/apps-script..."
 *
 * const webAppUrl = 'https://script.google.com/macros/s/AKfycbzozmc1IhN_cuT7p9ccirAdfpFzP7ho6fqVRQ8WU9yNMrdYGtIWYwvt83eTTrYhM38S/exec';
 * const scriptId = extractGasScriptId(webAppUrl); // "AKfycbzozmc1IhN_cuT7p9ccirAdfpFzP7ho6fqVRQ8WU9yNMrdYGtIWYwvt83eTTrYhM38S"
 * const isValid = isValidGasWebAppUrl(webAppUrl); // true
 * ```
 */

/**
 * URLを短縮表示する関数
 * @param url 短縮対象のURL
 * @param maxLength 最大文字数（デフォルト: 30、最小値: 4）
 * @returns 短縮されたURL
 * @throws エラー: maxLengthが4未満の場合
 */
export function truncateUrl(url: string, maxLength: number = 25): string {
  // 入力値の検証
  if (typeof url !== 'string') {
    throw new Error('URLは文字列である必要があります');
  }

  if (typeof maxLength !== 'number' || isNaN(maxLength) || maxLength < 4) {
    throw new Error('maxLengthは4以上の数値である必要があります');
  }

  // URLが最大長以下の場合はそのまま返す
  if (url.length <= maxLength) {
    return url;
  }

  // URLを短縮して省略記号を追加
  return url.slice(0, maxLength - 3) + '...';
}

/**
 * GAS実行URLからscriptIdを抽出する関数
 * @param url GAS実行URL
 * @returns scriptId または null（抽出できない場合）
 */
export function extractGasScriptId(url: string): string | null {
  if (typeof url !== 'string') {
    return null;
  }

  // GAS実行URLのパターン: 標準形式と/a/macros/形式の両方に対応
  // WebアプリのスクリプトIDは「1」で始まるライブラリIDまたは「AK」で始まるWebアプリIDが有効
  // 「your-script-deployment-id」のような無効なIDは除外
  const pattern =
    /^https:\/\/script\.google\.com\/(?:a\/)?macros\/(?:[^/]+\/)?s\/(1[A-Za-z0-9_-]{24,69}|AKfyc[A-Za-z0-9_-]{1,})\/exec$/;
  const match = url.match(pattern);

  return match ? match[1] : null;
}

/**
 * GAS WebアプリのURLが有効かどうかをチェックする関数
 * @param url チェック対象のURL
 * @returns 有効な場合はtrue、無効な場合はfalse
 */
export function isValidGasWebAppUrl(url: string): boolean {
  return extractGasScriptId(url) !== null;
}

/**
 * scriptIdからGAS実行URLを生成する関数
 * @param scriptId GASスクリプトID
 * @returns GAS実行URL
 */
export function generateGasWebAppUrl(scriptId: string): string {
  if (typeof scriptId !== 'string' || scriptId.trim() === '') {
    throw new Error('scriptIdは空でない文字列である必要があります');
  }

  return `https://script.google.com/macros/s/${scriptId}/exec`;
}
