import { describe, expect, test, vi } from 'vitest';
import {
  preprocessMarkdown,
  sanitizeHtml,
  sanitizeMarkdownHtml,
} from '../../../../src/lib/utils/html-sanitizer.js';

// ブラウザ環境をモック
vi.mock('$app/environment', () => ({
  browser: true,
}));

// DOMPurifyをモック
vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn((html: string) => {
      // 基本的なサニタイズをシミュレート
      let previousHtml: string;
      do {
        previousHtml = html;
        html = html
          .replace(/<script\b[^>]*>([\s\S]*?)<\/script\s*[^>]*>/gi, '') // scriptタグを削除
          .replace(/\s*on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^>\s]*)/gi, '') // onイベント属性を削除
          .replace(/href="javascript:[^"]*"/gi, 'href=""'); // javascript:プロトコルを削除
      } while (html !== previousHtml);
      return html;
    }),
  },
}));

describe('html-sanitizer', () => {
  describe('sanitizeHtml', () => {
    test('安全なHTMLはそのまま通す', () => {
      const safeHtml = '<p>Hello <strong>World</strong></p>';
      const result = sanitizeHtml(safeHtml);
      expect(result).toBe(safeHtml);
    });

    test('scriptタグを削除する', () => {
      const maliciousHtml = '<p>Hello</p><script>alert("XSS")</script><p>World</p>';
      const result = sanitizeHtml(maliciousHtml);
      expect(result).toBe('<p>Hello</p><p>World</p>');
    });

    test('onイベント属性を削除する', () => {
      const maliciousHtml = '<button onclick="alert(\'XSS\')">Click me</button>';
      const result = sanitizeHtml(maliciousHtml);
      expect(result).toBe('<button>Click me</button>');
    });

    test('複数のonイベント属性を削除する', () => {
      const maliciousHtml =
        '<button onclick="alert(\'XSS\')" onmouseover="alert(\'XSS\')">Click me</button>';
      const result = sanitizeHtml(maliciousHtml);
      expect(result).toBe('<button>Click me</button>');
    });

    test('不正なonイベント属性を削除する', () => {
      const maliciousHtml = "<button onload=alert('XSS')>Click me</button>";
      const result = sanitizeHtml(maliciousHtml);
      expect(result).toBe('<button>Click me</button>');
    });

    test('javascript:プロトコルを削除する', () => {
      const maliciousHtml = '<a href="javascript:alert(\'XSS\')">Link</a>';
      const result = sanitizeHtml(maliciousHtml);
      expect(result).toBe('<a href="">Link</a>');
    });

    test('コードブロックを含むMarkdownHTMLを安全に処理する', () => {
      const markdownHtml = `
        <h2>使用方法</h2>
        <pre><code class="hljs language-javascript">function hello() {
  console.log('Hello, World!');
}
        </code></pre>
        <p>このように使用してください。</p>
      `;
      const result = sanitizeHtml(markdownHtml);
      expect(result).toContain('function hello()');
      expect(result).toContain('このように使用してください');
    });

    test('空文字列を渡すと空文字列を返す', () => {
      const result = sanitizeHtml('');
      expect(result).toBe('');
    });
  });

  describe('sanitizeMarkdownHtml', () => {
    test('MarkdownからのHTMLを安全にサニタイズする', () => {
      const markdownHtml = '<h1>Title</h1><p>Content</p>';
      const result = sanitizeMarkdownHtml(markdownHtml);
      expect(result).toBe(markdownHtml);
    });

    test('悪意のあるMarkdownHTMLをサニタイズする', () => {
      const maliciousMarkdownHtml = '<h1>Title</h1><script>alert("XSS")</script><p>Content</p>';
      const result = sanitizeMarkdownHtml(maliciousMarkdownHtml);
      expect(result).toBe('<h1>Title</h1><p>Content</p>');
    });
  });

  describe('preprocessMarkdown', () => {
    test('エスケープされた改行文字を実際の改行に変換する', () => {
      const input = '### タイトル\\n```javascript\\nconsole.log("test");\\n```';
      const result = preprocessMarkdown(input);
      expect(result).toBe('### タイトル\n```javascript\nconsole.log("test");\n```');
    });
    test('エスケープされたタブ文字を実際のタブに変換する', () => {
      const input = 'function test() {\\n\\treturn true;\\n}';
      const result = preprocessMarkdown(input);
      expect(result).toBe('function test() {\n\treturn true;\n}');
    });

    test('連続する空行を整理する', () => {
      const input = 'line1\n\n\n\n\nline2';
      const result = preprocessMarkdown(input);
      expect(result).toBe('line1\n\nline2');
    });

    test('文字列の前後の余分な空白を削除する', () => {
      const input = '   \n  タイトル\n内容  \n  ';
      const result = preprocessMarkdown(input);
      expect(result).toBe('タイトル\n内容');
    });

    test('空文字列を渡すと空文字列を返す', () => {
      const result = preprocessMarkdown('');
      expect(result).toBe('');
    });

    test('提供されたマークダウンサンプルを正しく処理する', () => {
      const input =
        '### 【入門】アクティブシートをJSONでS3にアップロードする\\n```javascript\\n// ライブラリ (SheetS3) がプロジェクトに追加済みと仮定\\nfunction quickUpload() {\\n  SheetS3.uploadActiveSheetAsJson({\\n    bucket: "my-bucket",            // アップロード先バケット\\n    key:    "data/active.json"      // オブジェクトキー\\n  });\\n}\\n```';
      const result = preprocessMarkdown(input);
      expect(result).toContain(
        '### 【入門】アクティブシートをJSONでS3にアップロードする\n```javascript'
      );
      expect(result).toContain('function quickUpload() {\n  SheetS3.uploadActiveSheetAsJson({');
      expect(result).toContain('bucket: "my-bucket",');
    });
  });
});
