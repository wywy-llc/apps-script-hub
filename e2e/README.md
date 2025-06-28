# E2Eテスト

このディレクトリには、アプリケーションのエンドツーエンドテストが含まれています。

## テストファイル

### `admin-library-basic.test.ts`

管理者画面でのライブラリ登録機能の基本的なテストケース

- **今回のケース**: `googleworkspace/apps-script-oauth2`の登録テスト
- **簡単なケース**: `microsoft/TypeScript`の登録テスト
- **管理者トップページのリダイレクト確認**

### `admin-library-registration.test.ts`

より詳細なライブラリ登録機能のテストケース（バリデーション、エラーハンドリングなど）

## テスト実行方法

### 基本的なテスト実行

```bash
# 全てのE2Eテストを実行
npm run test:e2e

# 特定のテストファイルを実行
npm run test:e2e -- admin-library-basic.test.ts

# ヘッドレスモードで実行（ブラウザを表示）
npm run test:e2e -- --headed admin-library-basic.test.ts
```

### 今回の問題ケースを再現するテスト

```bash
# 今回報告された問題のケースをテスト
npm run test:e2e -- admin-library-basic.test.ts -g "今回のケース"
```

このテストでは以下を確認します：

1. ライブラリ登録フォームへのアクセス
2. 指定されたGASスクリプトIDとGitHubリポジトリURLの入力
3. フォーム送信と成功メッセージの表示
4. 詳細ページへの自動リダイレクト
5. 詳細ページでの情報表示（ライブラリ名、作者、説明、README等）

## 前提条件

- 開発サーバーが起動していること
- データベースが利用可能であること
- GitHub APIにアクセス可能であること

## 注意事項

- テストではリアルのGitHub APIを使用します
- 存在しないリポジトリのテストではエラーが期待される動作です
- テスト実行時にデータベースに実際のデータが保存されます
