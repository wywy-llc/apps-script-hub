<script module>
  import MarkdownRenderer from '$lib/components/MarkdownRenderer.svelte';
  import { defineMeta } from '@storybook/addon-svelte-csf';

  /**
   * マークダウンレンダリングコンポーネントのStorybook設定
   * marked.js と highlight.js を使用した高機能なマークダウンレンダリング
   * SSRセーフでXSS対策済み
   */
  const { Story } = defineMeta({
    title: 'AppsScriptHub/MarkdownRenderer',
    component: MarkdownRenderer,
    tags: ['autodocs'],
    argTypes: {
      content: {
        control: 'text',
        description: 'レンダリングするマークダウンコンテンツ',
      },
      class: {
        control: 'text',
        description: '追加するCSSクラス',
      },
      repositoryUrl: {
        control: 'text',
        description: 'GitHubリポジトリURL（相対リンクの解決に使用）',
      },
    },
    parameters: {
      docs: {
        description: {
          component:
            'marked.js と highlight.js を使用したマークダウンレンダリングコンポーネント。SSRセーフ、XSS対策済み、シンタックスハイライト、GitHub風スタイリング、GFMサポート。',
        },
      },
    },
  });

  // サンプルマークダウンコンテンツ
  const basicMarkdown = `# MarkdownRendererコンポーネント

このコンポーネントは **marked.js** と *highlight.js* を使用してマークダウンをレンダリングします。

## 機能

- シンタックスハイライト対応
- GitHub風スタイリング
- GFM（GitHub Flavored Markdown）サポート

### コードブロック例

\`\`\`javascript
function exampleFunction() {
  console.log('Hello, World!');
  return 'マークダウンレンダリングのテストです';
}
\`\`\`

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
}

const user: User = {
  id: 1,
  name: '田中太郎',
  email: 'tanaka@example.com'
};
\`\`\`

### リスト

- 項目1
- 項目2
  - ネストした項目
  - もう一つのネスト項目
- 項目3

1. 番号付きリスト
2. 二番目の項目
3. 三番目の項目

### 表

| 名前 | 年齢 | 職業 |
|------|------|------|
| 田中 | 30 | エンジニア |
| 佐藤 | 25 | デザイナー |
| 鈴木 | 35 | プロダクトマネージャー |

### 引用

> これは引用文です。
> 複数行にわたる引用も可能です。

### リンク

[GitHub](https://github.com) へのリンクです。

### インラインコード

\`console.log()\` のようなインラインコードも表示できます。
`;

  const readmeExample = `## 概要

GAS (Google Apps Script) の標準の \`Utilities.formatDate()\` は便利ですが、タイムゾーンの指定が必須であったり、フォーマット文字列が少し特殊だったりします。

このライブラリは、より直感的で広く使われている [Moment.js](https://momentjs.com/) のような構文で日付フォーマットを可能にし、開発体験を向上させます。

### 主な機能

- **直感的なフォーマット**: \`YYYY-MM-DD\` のような分かりやすいパターンで日付を文字列に変換します。
- **タイムゾーンの自動解決**: スクリプトのタイムゾーンを自動的に使用し、明示的な指定を不要にします。
- **軽量**: 必要な機能に絞っているため、スクリプトの実行時間に与える影響は軽微です。

## 使い方

\`\`\`javascript
function myFunction() {
  // ライブラリをインポート (例: GasDateFormatter)
  
  const now = new Date();
  
  // 'YYYY/MM/DD HH:mm:ss' 形式でフォーマット
  const formattedDate = GasDateFormatter.format(now, 'YYYY/MM/DD HH:mm:ss');
  console.log(formattedDate); // 例: "2025/06/15 23:07:00"

  // 和暦や曜日も利用可能
  const warekiDate = GasDateFormatter.format(now, 'ggge年M月d日(E)');
  console.log(warekiDate); // 例: "令和7年6月15日(日)"
}
\`\`\`

## API

### \`format(date, pattern)\`

指定された日付を指定されたパターンでフォーマットします。

#### 引数

- \`date\` (Date): フォーマットする日付オブジェクト
- \`pattern\` (string): フォーマットパターン

#### 戻り値

- (string): フォーマットされた日付文字列

## ライセンス

MIT License
`;

  // リポジトリリンクテスト用マークダウン
  const markdownWithLinks = `# リンクテスト

## 相対リンク
- [README](README.md) - 相対リンクテスト
- [ドキュメント](docs/usage.md) - ドキュメントへのリンク
- [画像](images/screenshot.png) - 画像への相対リンク

## 絶対リンク
- [GitHub](https://github.com) - 外部リンク（新しいタブで開く）
- [公式サイト](https://example.com) - 外部サイトへのリンク

## アンカーリンク
- [セクション1](#section1) - ページ内リンク
- [セクション2](#section2) - ページ内リンク

\`\`\`javascript
// コードブロック内のリンクはそのまま表示
// https://github.com/user/repo
console.log('テストコード');
\`\`\`
`;

  // セキュリティテスト用マークダウン（安全なもの）
  const securityTestMarkdown = `# セキュリティテスト

このコンテンツはHTMLサニタイズ機能をテストします。

## 通常のマークダウン
これは**通常の太字**と*斜体*です。

## コードブロック
\`\`\`javascript
const message = 'Hello World';
console.log(message);
\`\`\`

## リスト
- 項目1
- 項目2
- 項目3

## 表
| 名前 | 値 |
|------|-----|
| test | value |
| demo | sample |
`;
</script>

<!-- Basic Example -->
<Story name="Basic Example" args={{ content: basicMarkdown }}>
  <div class="mx-auto max-w-4xl">
    <MarkdownRenderer content={basicMarkdown} />
  </div>
</Story>

<!-- README Example -->
<Story name="README Example" args={{ content: readmeExample }}>
  <div class="mx-auto max-w-4xl">
    <MarkdownRenderer content={readmeExample} />
  </div>
</Story>

<!-- Simple Text -->
<Story name="Simple Text">
  <div class="mx-auto max-w-4xl">
    <MarkdownRenderer
      content={`# シンプルなテキスト

これは**MarkdownRenderer**コンポーネントの簡単な例です。

- シンプルなリスト項目
- もう一つの項目

\`console.log('Hello')\` のようなインラインコードも表示されます。`}
    />
  </div>
</Story>

<!-- Code Highlighting -->
<Story name="Code Highlighting">
  <div class="mx-auto max-w-4xl">
    <MarkdownRenderer
      content={`# コードハイライトのテスト

## JavaScript

\`\`\`javascript
const users = [
  { id: 1, name: '田中太郎' },
  { id: 2, name: '佐藤花子' }
];

function getUserById(id) {
  return users.find(user => user.id === id);
}
\`\`\`

## TypeScript

\`\`\`typescript
interface User {
  id: number;
  name: string;
}

const getUser = (id: number): User | undefined => {
  return users.find(user => user.id === id);
};
\`\`\`

## JSON

\`\`\`json
{
  "name": "GasDateFormatter",
  "version": "1.0.0",
  "description": "Google Apps Scriptの日付フォーマットライブラリ"
}
\`\`\`

## Bash

\`\`\`bash
npm install
npm run dev
npm run build
\`\`\`
`}
    />
  </div>
</Story>

<!-- Repository Links -->
<Story
  name="Repository Links"
  args={{ content: markdownWithLinks, repositoryUrl: 'https://github.com/user/example-repo' }}
>
  <div class="mx-auto max-w-4xl">
    <MarkdownRenderer
      content={markdownWithLinks}
      repositoryUrl="https://github.com/user/example-repo"
    />
  </div>
</Story>

<!-- Security Test -->
<Story name="Security Test" args={{ content: securityTestMarkdown }}>
  <div class="mx-auto max-w-4xl">
    <MarkdownRenderer content={securityTestMarkdown} />
  </div>
</Story>

<!-- Custom Class -->
<Story name="Custom Class">
  <div class="mx-auto max-w-4xl">
    <MarkdownRenderer
      content="# カスタムクラス付きの例

この例では追加のCSSクラスが適用されています。"
      class="border-blue-300 bg-blue-50"
    />
  </div>
</Story>

<!-- Empty Content -->
<Story name="Empty Content">
  <div class="mx-auto max-w-4xl">
    <MarkdownRenderer content="" />
    <p class="mt-4 text-gray-500">空のコンテンツの場合の表示テスト</p>
  </div>
</Story>
