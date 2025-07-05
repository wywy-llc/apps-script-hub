<script lang="ts">
  import { convertRelativeToAbsolute, getReadmeBaseUrl } from '$lib/helpers/link-converter.js';
  import { preprocessMarkdown, sanitizeMarkdownHtml } from '$lib/utils/html-sanitizer.js';
  import 'github-markdown-css/github-markdown.css';
  import hljs from 'highlight.js/lib/core';
  import bash from 'highlight.js/lib/languages/bash';
  import javascript from 'highlight.js/lib/languages/javascript';
  import json from 'highlight.js/lib/languages/json';
  import plaintext from 'highlight.js/lib/languages/plaintext';
  import typescript from 'highlight.js/lib/languages/typescript';
  import 'highlight.js/styles/github.css';
  import { marked, type Tokens } from 'marked';

  /**
   * マークダウンレンダリング共通コンポーネント
   * marked.js と highlight.js を使用した高機能なマークダウンレンダリング
   * SSRセーフでXSS対策済み
   *
   * 使用例:
   * <MarkdownRenderer content={markdownContent} />
   * <MarkdownRenderer content={markdownContent} class="custom-class" />
   * <MarkdownRenderer content={markdownContent} repositoryUrl="https://github.com/user/repo" />
   */

  interface Props {
    content: string;
    class?: string;
    repositoryUrl?: string;
  }

  let { content, class: className = '', repositoryUrl }: Props = $props();

  // highlight.jsの言語を登録（SSRセーフ）
  hljs.registerLanguage('javascript', javascript);
  hljs.registerLanguage('json', json);
  hljs.registerLanguage('typescript', typescript);
  hljs.registerLanguage('bash', bash);
  hljs.registerLanguage('plaintext', plaintext);

  /**
   * マークダウンレンダリング関数
   * @param content - マークダウンテキスト
   * @param baseUrl - リンク変換用のベースURL
   * @returns HTMLとしてレンダリングされた文字列
   */
  function renderMarkdown(content: string, baseUrl: string): string {
    if (!content) return '';

    // カスタムレンダラーを定義
    const renderer = {
      code(token: Tokens.Code) {
        const code = token.text;
        const lang = token.lang || 'plaintext';

        try {
          const language = hljs.getLanguage(lang) ? lang : 'plaintext';
          const highlighted = hljs.highlight(code, { language }).value;
          return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
        } catch (error) {
          console.warn('Highlight.js error:', error);
          return `<pre><code class="hljs">${code}</code></pre>`;
        }
      },
      link(token: Tokens.Link) {
        const href = baseUrl ? convertRelativeToAbsolute(token.href, baseUrl) : token.href;
        const title = token.title ? ` title="${token.title}"` : '';
        const target = href.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : '';
        return `<a href="${href}"${title}${target}>${token.text}</a>`;
      },
    };

    // マークダウンの設定とレンダリング
    marked.use({
      renderer,
      breaks: true,
      gfm: true,
    });

    return marked.parse(content) as string;
  }

  // マークダウンをHTMLに変換（XSS対策済み）
  function getRenderedHtml(markdownContent: string, repoUrl?: string): string {
    if (!markdownContent) {
      return '';
    }

    try {
      // マークダウンの前処理（エスケープ文字等の修正）
      const preprocessedMarkdown = preprocessMarkdown(markdownContent);

      // ベースURLを計算
      const baseUrl = repoUrl ? getReadmeBaseUrl(repoUrl) : '';

      // マークダウンレンダリング関数を使用
      const rawHtml = renderMarkdown(preprocessedMarkdown, baseUrl);

      // XSS対策: HTMLをサニタイズ
      const sanitizedHtml = sanitizeMarkdownHtml(rawHtml);

      return sanitizedHtml;
    } catch (error) {
      console.error('MarkdownRenderer rendering error:', error);
      return '<p style="color: red; padding: 20px; border: 2px solid red;">マークダウンのレンダリングでエラーが発生しました。</p>';
    }
  }

  // リアクティブなHTML生成（writable $derived）
  let renderedHtml = $derived(getRenderedHtml(content, repositoryUrl));
</script>

<div class="markdown-body rounded-lg border border-indigo-200 bg-white p-4 shadow-sm {className}">
  <!-- XSS対策済み: DOMPurifyでサニタイズされたHTML -->
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html renderedHtml}
</div>
