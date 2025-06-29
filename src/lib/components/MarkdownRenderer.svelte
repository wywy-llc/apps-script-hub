<script lang="ts">
  import { convertRelativeToAbsolute, getReadmeBaseUrl } from '$lib/helpers/link-converter.js';
  import hljs from 'highlight.js/lib/core';
  import bash from 'highlight.js/lib/languages/bash';
  import javascript from 'highlight.js/lib/languages/javascript';
  import json from 'highlight.js/lib/languages/json';
  import plaintext from 'highlight.js/lib/languages/plaintext';
  import typescript from 'highlight.js/lib/languages/typescript';
  import { marked, type Tokens } from 'marked';

  // マークダウンレンダリング共通コンポーネント
  // marked.js と highlight.js を使用した高機能なマークダウンレンダリング
  // 使用例:
  // <MarkdownRenderer content={markdownContent} />
  // <MarkdownRenderer content={markdownContent} class="custom-class" />

  interface Props {
    content: string;
    class?: string;
    repositoryUrl?: string;
  }

  let { content, class: className = '', repositoryUrl }: Props = $props();

  // highlight.jsの言語を登録
  hljs.registerLanguage('javascript', javascript);
  hljs.registerLanguage('json', json);
  hljs.registerLanguage('typescript', typescript);
  hljs.registerLanguage('bash', bash);
  hljs.registerLanguage('plaintext', plaintext);

  // marked.jsの設定を動的に生成
  function getMarkedRenderer() {
    const baseUrl = repositoryUrl ? getReadmeBaseUrl(repositoryUrl) : '';

    return {
      code(token: Tokens.Code) {
        const code = token.text;
        const lang = token.lang || 'plaintext';

        try {
          const language = hljs.getLanguage(lang) ? lang : 'plaintext';
          const highlighted = hljs.highlight(code, { language }).value;
          return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
        } catch (error) {
          console.warn('Highlight.js error:', error);
          // エラーの場合はプレーンテキストとして表示
          return `<pre><code class="hljs">${code}</code></pre>`;
        }
      },
      link(token: Tokens.Link) {
        const href = repositoryUrl ? convertRelativeToAbsolute(token.href, baseUrl) : token.href;
        const title = token.title ? ` title="${token.title}"` : '';
        const target = href.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : '';
        return `<a href="${href}"${title}${target}>${token.text}</a>`;
      },
    };
  }

  /**
   * マークダウンコンテンツをHTMLに変換
   * @param content - マークダウンテキスト
   * @returns HTMLとしてレンダリングされた文字列
   */
  function renderMarkdown(content: string): string {
    // marked.jsの設定を動的に適用
    marked.use({
      renderer: getMarkedRenderer(),
      breaks: true,
      gfm: true,
    });

    return marked.parse(content) as string;
  }
</script>

<svelte:head>
  <!-- GitHub風マークダウンスタイル -->
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/github-markdown-css@5.8.1/github-markdown.min.css"
  />
  <!-- highlight.jsのスタイル（GitHub風） -->
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/highlight.js@11.11.1/styles/github.min.css"
  />
</svelte:head>

<article class="markdown-body bg-white p-6 {className}">
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html renderMarkdown(content)}
</article>
