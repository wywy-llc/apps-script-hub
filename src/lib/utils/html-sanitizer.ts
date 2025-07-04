import { browser } from '$app/environment';
import DOMPurify from 'dompurify';

/**
 * HTMLサニタイズ設定
 * Markdownから生成されたHTMLを安全にレンダリングするための設定
 */
const SANITIZE_CONFIG = {
  // 許可するタグ
  ALLOWED_TAGS: [
    'p',
    'br',
    'strong',
    'em',
    'b',
    'i',
    'u',
    's',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'blockquote',
    'code',
    'pre',
    'a',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'dl',
    'dt',
    'dd',
    'hr',
    'div',
    'span',
  ],
  // 許可する属性
  ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'class', 'id', 'lang'],
  // リンクのプロトコル制限
  ALLOWED_URI_REGEXP:
    /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z.+-]+(?:[^a-z.+-]|$))/i, // cspell:ignore callto xmpp
};

/**
 * HTMLをサニタイズする関数
 * @param html サニタイズ対象のHTML文字列
 * @returns サニタイズされたHTML文字列
 */
export function sanitizeHtml(html: string): string {
  // サーバーサイドでは何もしない（DOMPurifyはブラウザ環境でのみ動作）
  if (!browser) {
    return html;
  }

  try {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: SANITIZE_CONFIG.ALLOWED_TAGS,
      ALLOWED_ATTR: SANITIZE_CONFIG.ALLOWED_ATTR,
      ALLOWED_URI_REGEXP: SANITIZE_CONFIG.ALLOWED_URI_REGEXP,
      // 外部リンクに属性を自動追加
      ADD_ATTR: ['target', 'rel'],
      // 危険なコンテンツを削除
      SANITIZE_DOM: true,
      // 空のタグを削除
      KEEP_CONTENT: false,
    });
  } catch (error) {
    console.error('HTMLサニタイズエラー:', error);
    // エラー時は空文字を返す（安全側に倒す）
    return '';
  }
}

/**
 * MarkdownからHTMLに変換してサニタイズする関数
 * marked.jsと組み合わせて使用
 * @param markdownHtml marked.jsで変換されたHTML
 * @returns サニタイズされたHTML
 */
export function sanitizeMarkdownHtml(markdownHtml: string): string {
  return sanitizeHtml(markdownHtml);
}
