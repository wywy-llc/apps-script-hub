# CLAUDE.md

このファイルは、このリポジトリでコードを操作する際にClaude Code (claude.ai/code) にガイダンスを提供します。

## 🛠️ 開発コマンド

このプロジェクトで利用可能なnpmコマンドは@package.jsonを参照

### 🚨 重要：コード変更時の必須手順

**コードの実装・修正・追加を行った場合は、必ず以下を実行してください：**

```bash
npm run test
```

これにより以下が順次実行されます：

1. `npm run lint` - コードフォーマットとESLintチェック
2. `npm run check` - TypeScript型チェック
3. `npm run test:unit -- --run` - ユニットテスト
4. `npm run test:e2e` - E2Eテスト

**🔴 重要なルール：**

- **全てのテストがパスするまで作業を完了してはいけません**
- **修正したコードに直接関係がなくても、`npm run test`でエラーが発生した場合は必ず修正してください**
- lint、型チェック、テストエラーは全て修正が必要です
- エラーが残ったまま作業を終了することは禁止されています

**💡 エラー修正の優先順位：**

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

- `npm run test` - **🚨 全テスト実行（コード変更時は必須）**
- `npm run test:unit` - ユニットテストのみ実行（Vitest）
- `npm run test:e2e` - E2Eテストのみ実行（Playwright）
- `npm run storybook` - Storybookコンポーネントテスト用サーバー起動

**注意**: `npm run test`は`npm run lint && npm run check && npm run test:unit -- --run && npm run test:e2e`を実行し、リント、型チェック、ユニットテスト、E2Eテストを順次実行します。

**💡 開発ワークフロー**:

1. **コード修正・実装**
2. **`npm run test`を実行**
3. **🔴 エラーがある場合は必ず修正**（修正内容と関係なくても）
   - lintエラー → コードフォーマットやESLintルール違反を修正
   - 型エラー → TypeScript型定義を修正
   - テストエラー → テストコードまたは実装を修正
4. **全てのテストがパスするまで手順2-3を繰り返す**
5. **🟢 全てのテストがパスしたら作業完了**

**⚠️ 警告**: エラーが残っている状態で作業を終了することは絶対に禁止されています。

#### E2Eテストのデータベース管理

E2Eテストでは専用のテストデータベースを使用し、テスト間のデータ競合を防ぐため自動的にデータクリアが実行されます：

- **テストデータベース**: `apps_script_hub_test_db`（本番DBとは分離）
- **データクリア**: 各テスト実行前に`scripts/clear-test-data.js`が自動実行
- **スキーマセットアップ**: `scripts/setup-test-db.js`でテスト用スキーマを自動作成

##### データベーススキーマ変更時の重要な注意事項

**新しいテーブルを追加した場合、必ずテストデータクリア機能を更新してください：**

1. `src/lib/server/db/schema.ts`に新しいテーブルを追加
2. `scripts/clear-test-data.js`の`clearTestData()`関数に新しいテーブルのDELETE文を追加

```javascript
// 例：categoryテーブルを追加した場合
await db.execute(sql`DELETE FROM "category"`);
await db.execute(sql`DELETE FROM "library"`); // 既存テーブルも保持
```

**重要**: 外部キー制約がある場合は、子テーブルから先に削除する順序にしてください。

この更新を忘れるとE2Eテストでデータ重複エラーが発生し、テストが不安定になります。

### 環境変数管理

- **開発環境**: `.env`（チーム共有設定、Docker PostgreSQL）
- **新規セットアップ**: `.env.example`を`.env`にコピー

### ビルド構成

- Viteベースビルドシステム
- SvelteでのMarkdownサポート用MDSvex（マークダウン処理）
- 厳密チェック付きTypeScript
- コード品質用ESLint + Prettier

## 🔢 マジックナンバー・定数管理

### 必須ルール: 定数化とオブジェクトリテラル

**🚨 重要**: マジックナンバー、文字列リテラル、設定値は必ず定数化してください。

#### 定数ファイルの配置

- **場所**: `/src/lib/constants/` ディレクトリ
- **命名**: 機能別にファイルを分割（例: `library-status.ts`, `pagination.ts`, `ui-config.ts`）
- **フォーマット**: オブジェクトリテラルを使用したconst assertionパターン

#### 実装パターン

```typescript
// ✅ 正しい例: src/lib/constants/example.ts
export const EXAMPLE_CONFIG = {
  MAX_ITEMS: 50,
  DEFAULT_PAGE: 1,
  STATUS_ACTIVE: 'active',
  STATUS_INACTIVE: 'inactive',
} as const;

export type ExampleStatus = (typeof EXAMPLE_CONFIG)[keyof typeof EXAMPLE_CONFIG];

// ✅ 表示テキストも定数化
export const EXAMPLE_MESSAGES = {
  [EXAMPLE_CONFIG.STATUS_ACTIVE]: 'アクティブ',
  [EXAMPLE_CONFIG.STATUS_INACTIVE]: '非アクティブ',
} as const;
```

#### 対象となるマジックナンバー・文字列

1. **ステータス値**: `'pending'`, `'published'`, `'rejected'`
2. **数値設定**: ページネーション数、タイムアウト値、制限値
3. **UI設定**: CSSクラス名の組み合わせ、カラーコード
4. **メッセージ**: エラーメッセージ、確認ダイアログのテキスト
5. **設定値**: API エンドポイント、デフォルト値

#### 使用時のルール

- ✅ `LIBRARY_STATUS.PENDING` を使用
- ❌ `'pending'` を直接使用
- ✅ `CONFIG.MAX_ITEMS` を使用  
- ❌ `50` を直接使用

#### 型安全性の確保

```typescript
// ✅ 型も併せて export
export const STATUS = { ACTIVE: 'active', INACTIVE: 'inactive' } as const;
export type Status = (typeof STATUS)[keyof typeof STATUS];

// ✅ 関数の引数や戻り値で型を使用
function updateStatus(newStatus: Status) { /* ... */ }
```

**💡 メリット:**
- 型安全性の向上
- 保守性の向上（値変更時は1箇所だけ修正）
- 一貫性の確保
- IDEの補完機能が活用可能
- リファクタリングの容易性

## Playwright MCP使用ルール

### 絶対的な禁止事項

1. **いかなる形式のコード実行も禁止**

   - Python、JavaScript、Bash等でのブラウザ操作
   - MCPツールを調査するためのコード実行
   - subprocessやコマンド実行によるアプローチ

2. **利用可能なのはMCPツールの直接呼び出しのみ**

   - playwright:browser_navigate
   - playwright:browser_screenshot
   - 他のPlaywright MCPツール

3. **エラー時は即座に報告**
   - 回避策を探さない
   - 代替手段を実行しない
   - エラーメッセージをそのまま伝える
