# CLAUDE.md

このファイルは、このリポジトリでコードを操作する際にClaude Code (claude.ai/code) にガイダンスを提供します。

## 🛠️ 開発コマンド

### 基本コマンド
- `npm run dev` - 開発サーバーを起動
- `npm run build` - 本番用ビルド
- `npm run preview` - 本番ビルドのプレビュー
- `npm run test` - 全テスト実行 (ユニット + e2e)
- `npm run test:unit` - ユニットテストのみ実行 (Vitest)
- `npm run test:e2e` - エンドツーエンドテスト実行 (Playwright)
- `npm run lint` - リンティング実行 (Prettier + ESLint)
- `npm run check` - svelte-checkによる型チェック

### データベースコマンド
- `npm run db:push` - スキーマ変更をデータベースにプッシュ
- `npm run db:migrate` - データベースマイグレーション実行
- `npm run db:studio` - Drizzle Studioを開く

### Storybook
- `npm run storybook` - Storybook開発サーバーを起動
- `npm run build-storybook` - Storybookをビルド

## 🏗️ アーキテクチャ

### コアスタック
- **フレームワーク**: SvelteKit 2.x + Svelte 5
- **データベース**: PostgreSQL + Drizzle ORM
- **認証**: @oslojs/cryptoを使用したカスタムセッションベース認証
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
- `e2e/` - Playwriteエンドツーエンドテスト

### データベーススキーマ
- PostgreSQLとDrizzle ORMを使用
- 現在のテーブル: `user`, `session`
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

### ビルド構成
- Viteベースビルドシステム
- SvelteでのMarkdownサポート用MDSvex
- 厳密チェック付きTypeScript
- コード品質用ESLint + Prettier