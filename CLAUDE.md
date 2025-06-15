# CLAUDE.md

このファイルは、このリポジトリでコードを操作する際にClaude Code (claude.ai/code) にガイダンスを提供します。

## 🛠️ 開発コマンド

このプロジェクトで利用可能なnpmコマンドは@package.jsonを参照

## 🏗️ アーキテクチャ

### コアスタック

- **フレームワーク**: SvelteKit 2.x + Svelte 5
- **データベース**: PostgreSQL + Drizzle ORM
- **認証**: @oslo/cryptoを使用したカスタムセッションベース認証
- **スタイリング**: Tailwind CSS v4
- **テスト**: Vitest (ユニット) + Playwright (e2e) + Storybook
- **デプロイ**: Vercelアダプター

### プロジェクト構成

- `src/lib/` - 共有ユーティリティとコンポーネント
- `src/lib/server/` - サーバーサイド専用コード (認証、データベース)
  - `db/schema.ts` - Drizzleデータベーススキーマ
  - `auth.ts` - セッション管理ユーティリティ
- `src/routes/` - SvelteKitファイルベースルーティング
- `src/stories/` - Storybookコンポーネントとストーリー
- `e2e/` - Playwrightエンドツーエンドテスト

### データベーススキーマ

- PostgreSQLとDrizzle ORMを使用
- スキーマの場所: `src/lib/server/db/schema.ts`
- `DATABASE_URL`環境変数が必要

### 認証システム

- SHA256ハッシュトークンを使用したセッションベース認証
- 30日間のセッション有効期限、15日更新ウィンドウ
- セッション管理関数: `src/lib/server/auth.ts`
- Cookie名: `auth-session`

### テスト設定

- **ユニットテスト**: クライアント/サーバー分離構成のVitest
  - クライアントテスト: `*.svelte.{test,spec}.{js,ts}` (jsdom環境)
  - サーバーテスト: `*.{test,spec}.{js,ts}` (node環境)
- **E2Eテスト**: 本番ビルドテスト用Playwright
- **コンポーネントテスト**: addon-vitest統合Storybook
  - play 関数を使用し、コンポーネントが期待通りの動作をすることを検証してください

#### テスト実行コマンド

- `npm run test` - 全テスト実行（ユニットテスト + E2Eテスト）
- `npm run test:unit` - ユニットテストのみ実行（Vitest）
- `npm run test:e2e` - E2Eテストのみ実行（Playwright）
- `npm run storybook` - Storybookコンポーネントテスト用サーバー起動

**注意**: `npm run test`は`npm run test:unit -- --run && npm run test:e2e`を実行し、ユニットテストを一度だけ実行してからE2Eテストを順次実行します。

### 環境変数管理

- **開発環境**: `.env`（チーム共有設定、Docker PostgreSQL）
- **新規セットアップ**: `.env.example`を`.env`にコピー

### ビルド構成

- Viteベースビルドシステム
- SvelteでのMarkdownサポート用MDSvex（マークダウン処理）
- 厳密チェック付きTypeScript
- コード品質用ESLint + Prettier
