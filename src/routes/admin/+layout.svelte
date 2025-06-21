<script>
  // 管理者画面共通レイアウト
  // 管理者専用のスタイルやコンポーネントを定義

  let { children } = $props();
</script>

<svelte:head>
  <style>
    /* Apply Noto Sans JP for Japanese text and Inter for the rest */
    body {
      font-family: 'Inter', 'Noto Sans JP', sans-serif;
      background-color: #f9fafb; /* Use a light gray for admin background */
    }
    .markdown-body h1,
    .markdown-body h2,
    .markdown-body h3 {
      font-weight: 600;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 0.3em;
      margin-top: 1.5rem;
      margin-bottom: 1rem;
    }
    .markdown-body h1 {
      font-size: 2em;
    }
    .markdown-body h2 {
      font-size: 1.5em;
    }
    .markdown-body h3 {
      font-size: 1.25em;
    }
    .markdown-body p {
      margin-bottom: 1rem;
      line-height: 1.7;
    }
    .markdown-body ul {
      list-style-type: disc;
      margin-left: 1.5rem;
      margin-bottom: 1rem;
    }
    .markdown-body ol {
      list-style-type: decimal;
      margin-left: 1.5rem;
      margin-bottom: 1rem;
    }
    .markdown-body li {
      margin-bottom: 0.25rem;
    }
    .markdown-body pre {
      background-color: #f7fafc;
      padding: 1rem;
      border-radius: 0.5rem;
      overflow-x: auto;
      margin-bottom: 1rem;
    }
    .markdown-body code {
      background-color: #edf2f7;
      padding: 0.2em 0.4em;
      margin: 0;
      font-size: 85%;
      border-radius: 3px;
    }
    .markdown-body pre code {
      background-color: transparent;
      padding: 0;
      margin: 0;
      font-size: 100%;
      border-radius: 0;
    }
    .markdown-body a {
      color: #2563eb;
      text-decoration: underline;
    }
    .markdown-body table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 1rem;
    }
    .markdown-body th,
    .markdown-body td {
      border: 1px solid #e2e8f0;
      padding: 0.5rem 1rem;
    }
    .markdown-body th {
      background-color: #f7fafc;
    }
  </style>
</svelte:head>

{@render children()}
