# CLAUDE.md

このファイルは、このリポジトリでコードを操作する際にClaude Code (claude.ai/code) にガイダンスを提供します。

## 🚨 必須：コード変更時の手順

**全てのコード変更後に必ず実行：**

```bash
npm run test
```

**🔴 絶対ルール：**

- **全てのテストがパスするまで作業完了禁止**
- **修正内容に関係なく、エラーが発生したら必ず修正**
- **エラーが残った状態での作業終了は絶対禁止**

**エラー修正の優先順位：**

1. lint エラー（コードフォーマット・ESLint）
2. TypeScript型エラー
3. ユニットテストエラー
4. E2Eテストエラー

## 🏗️ アーキテクチャ

### コアスタック

- **フレームワーク**: SvelteKit 2.x + Svelte 5
- **データベース**: PostgreSQL + Drizzle ORM
- **認証**: @oslo/cryptoを使用したカスタムセッションベース認証
- **スタイリング**: Tailwind CSS v4
- **テスト**: Vitest (ユニット) + Playwright (E2E) + Storybook
- **デプロイ**: Vercelアダプター
- **ビルド**: Vite + TypeScript + ESLint + Prettier

### プロジェクト構成

- `src/lib/` - 共有ユーティリティとコンポーネント
  - `constants/` - 定数定義ファイル
  - `server/` - サーバーサイド専用コード
    - `db/schema.ts` - Drizzleデータベーススキーマ
    - `auth.ts` - セッション管理
- `src/routes/` - SvelteKitファイルベースルーティング
- `src/stories/` - Storybookコンポーネント
- `e2e/` - Playwrightテスト
- `scripts/` - データベース管理スクリプト

### 認証・データベース

- **認証**: SHA256ハッシュセッション（30日有効、15日更新）、Cookie名: `auth-session`
- **DB**: PostgreSQL、スキーマ: `src/lib/server/db/schema.ts`、環境変数: `DATABASE_URL`

## 🧪 テスト設定

### コマンド

- `npm run test` - **🚨 全テスト実行（必須）**
- `npm run test:unit` - ユニットテストのみ
- `npm run test:e2e` - E2Eテストのみ
- `npm run storybook` - Storybookサーバー起動

### テスト構成

- **ユニット**: Vitest（クライアント: jsdom、サーバー: node）
- **E2E**: Playwright（本番ビルドテスト）
- **コンポーネント**: Storybook + addon-vitest（play関数使用）

### E2Eデータベース管理

**自動管理**:

- テストDB: `apps_script_hub_test_db`（本番DBと分離）
- データクリア: `scripts/clear-test-data.js`（テスト前自動実行）
- スキーマ作成: `scripts/setup-test-db.js`

**⚠️ スキーマ変更時の必須作業**:
新テーブル追加時は`scripts/clear-test-data.js`のDELETE文も追加（外部キー制約順序に注意）

```javascript
// 例：categoryテーブル追加時
await db.execute(sql`DELETE FROM "category"`);
await db.execute(sql`DELETE FROM "library"`); // 既存も保持
```

## 🔢 マジックナンバー・定数管理

**🚨 必須ルール**: 全てのマジックナンバー・文字列リテラル・設定値を定数化

### 実装パターン

```typescript
// src/lib/constants/example.ts
export const EXAMPLE_CONFIG = {
  MAX_ITEMS: 50,
  STATUS_ACTIVE: 'active',
  STATUS_INACTIVE: 'inactive',
} as const;

export type ExampleStatus = (typeof EXAMPLE_CONFIG)[keyof typeof EXAMPLE_CONFIG];

export const EXAMPLE_MESSAGES = {
  [EXAMPLE_CONFIG.STATUS_ACTIVE]: 'アクティブ',
  [EXAMPLE_CONFIG.STATUS_INACTIVE]: '非アクティブ',
} as const;
```

### 対象

1. ステータス値（`'pending'`, `'published'`, `'rejected'`）
2. 数値設定（ページネーション、タイムアウト、制限値）
3. UI設定（CSSクラス、カラーコード）
4. メッセージ（エラー、確認ダイアログ）
5. 設定値（APIエンドポイント、デフォルト値）

### 使用ルール

- ✅ `LIBRARY_STATUS.PENDING`
- ❌ `'pending'`
- ✅ `CONFIG.MAX_ITEMS`
- ❌ `50`

## 🎭 Playwright MCP使用ルール

### 絶対禁止

1. **コード実行禁止**: Python、JavaScript、Bash等でのブラウザ操作
2. **直接呼び出しのみ**: MCPツール（browser_navigate、browser_screenshot等）のみ使用
3. **エラー時即報告**: 回避策禁止、エラーメッセージをそのまま伝達

### 環境設定

- **開発**: `.env`（Docker PostgreSQL設定）
- **新規**: `.env.example`を`.env`にコピー
