// for information about these interfaces
declare global {
  namespace App {
    interface Locals {
      user: import('$lib/server/auth').SessionValidationResult['user'];
      session: import('$lib/server/auth').SessionValidationResult['session'];
    }
  }
}

// 環境変数の型定義
interface ImportMetaEnv {
  readonly GITHUB_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export {};
