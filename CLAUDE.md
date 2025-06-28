# CLAUDE.md

このファイルは、このリポジトリでコードを操作する際にClaude Code (claude.ai/code) にガイダンスを提供します。

## 🛠️ 開発コマンド

このプロジェクトで利用可能なnpmコマンドは@package.jsonを参照

## 🚨 必須：コード変更時の手順

**全てのコード変更後に必ず実行：**

```bash
npm run test
```

これにより以下が順次実行されます：

1. `npm run lint` - コードフォーマットとESLintチェック
2. `npm run check` - TypeScript型チェック
3. `npm run test:unit -- --run` - ユニットテスト
4. `npm run test:e2e` - E2Eテスト

**🔴 絶対ルール：**

- **全てのテストがパスするまで作業完了禁止**
- **修正内容に関係なく、エラーが発生したら必ず修正**
- **エラーが残った状態での作業終了は絶対禁止**

**💡 開発ワークフロー**:

1. **コード修正・実装**
2. **`npm run test`を実行**
3. **🔴 エラーがある場合は必ず修正**（修正内容と関係なくても）
   - lintエラー → コードフォーマットやESLintルール違反を修正
   - 型エラー → TypeScript型定義を修正
   - テストエラー → テストコードまたは実装を修正
4. **全てのテストがパスするまで手順2-3を繰り返す**
5. **🟢 全てのテストがパスしたら作業完了**

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
- **Markdown**: MDSvex（SvelteでのMarkdownサポート）

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

**注意**: `npm run test`は`npm run lint && npm run check && npm run test:unit -- --run && npm run test:e2e`を実行し、リント、型チェック、ユニットテスト、E2Eテストを順次実行します。

### テスト構成

- **ユニット**: Vitest（クライアント: jsdom、サーバー: node）
  - クライアントテスト: `*.svelte.{test,spec}.{js,ts}` (jsdom環境)
  - サーバーテスト: `*.{test,spec}.{js,ts}` (node環境)
- **E2E**: Playwright（本番ビルドテスト）
- **コンポーネント**: Storybook + addon-vitest（play関数使用）
  - play 関数を使用し、コンポーネントが期待通りの動作をすることを検証してください

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

### テストデータFactory（E2E）

**🚨 必須**: 全テストデータ生成は`e2e/factories`の共通システム使用

```typescript
// 使用例
import { LibraryTestDataFactories, DatabaseLibraryDataFactory } from '@/e2e/factories';

// テストデータ生成
const data = LibraryTestDataFactories.default.build();
// DB作成
const id = await DatabaseLibraryDataFactory.create();
```

**新Factory作成**:

- `createPresetFactories()` - テストデータ用
- `createDatabaseFactory()` - DB作成用  
- `generateUniqueId()` - 一意ID生成
- 型: `string | undefined`は`undefined`使用（`null`禁止）

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

**💡 メリット:**

- 型安全性の向上
- 保守性の向上（値変更時は1箇所だけ修正）
- 一貫性の確保
- IDEの補完機能が活用可能
- リファクタリングの容易性

## 🎭 Playwright MCP使用ルール

### 絶対禁止

1. **コード実行禁止**: Python、JavaScript、Bash等でのブラウザ操作
2. **直接呼び出しのみ**: MCPツール（browser_navigate、browser_screenshot等）のみ使用
3. **エラー時即報告**: 回避策禁止、エラーメッセージをそのまま伝達

### 環境変数管理

- **開発環境**: `.env`（チーム共有設定、Docker PostgreSQL）
- **新規セットアップ**: `.env.example`を`.env`にコピー
