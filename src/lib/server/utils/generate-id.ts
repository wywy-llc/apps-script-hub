/**
 * 一意なIDを生成するユーティリティ
 */

/**
 * 一意なIDを生成する
 * @param prefix IDの接頭辞（デフォルト: 'id'）
 * @returns 一意なID文字列
 */
export const generateId = (prefix: string = 'id'): string => {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 11);
  return `${prefix}_${timestamp}_${randomSuffix}`;
};
