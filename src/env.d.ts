// SvelteKit環境変数モジュールの型定義
// これにより $env/static/private, $env/static/public, $env/dynamic/* の型エラーが解決されます

declare module '$env/static/private' {
  export const DATABASE_URL: string;
  export const POSTGRES_USER: string;
  export const POSTGRES_PASSWORD: string;
  export const POSTGRES_DB: string;
  export const POSTGRES_TEST_DB: string;
  export const DATABASE_TEST_URL: string;
  export const NODE_ENV: string;
  export const GITHUB_TOKEN: string;
  // 他の環境変数もここに追加
}

declare module '$env/static/public' {
  // PUBLIC_で始まる環境変数をここに列挙
  // 現在は使用していませんが、将来の拡張用
}

declare module '$env/dynamic/private' {
  export const env: Record<string, string | undefined>;
}

declare module '$env/dynamic/public' {
  export const env: Record<string, string | undefined>;
}
