import type { ScraperConfig } from '$lib/types/github-scraper.js';

/**
 * Google Apps Script スクリプトID抽出パターン
 *
 * Google Apps ScriptのスクリプトIDは以下の特徴があります：
 * - 長さ: 通常25-70文字（実際の範囲に基づいて調整）
 * - 文字種: 英数字、ハイフン、アンダースコア（ただしハイフンは稀）
 * - 先頭: 必ず「1」で始まる
 * - 構造: 連続するハイフンやアンダースコアは含まない（--や__は無効）
 *
 * パターンの優先順位（上から順に適用）:
 * 1. Google Script URL形式（最も信頼性が高い）
 * 2. 明示的な「スクリプトID」「Script ID」ラベル付き
 * 3. script.google.comドメインの一般URL
 * 4. GAS特有のコンテキストでの文字列リテラル
 *
 * 注意: 誤検出を防ぐため、JSON形式のemail_idやその他のIDと区別
 */
export const DEFAULT_SCRIPT_ID_PATTERNS: RegExp[] = [
  // 1. Google Script URL形式（最高精度）
  /https:\/\/script\.google\.com\/macros\/d\/([A-Za-z0-9_-]{25,70})\/edit/gi,
  /https:\/\/script\.google\.com\/macros\/d\/([A-Za-z0-9_-]{25,70})/gi,

  // 2. 明示的ラベル付き（高精度）
  /(?:スクリプト|script)\s*(?:id|ID)[：:\s=]*['"`]?([A-Za-z0-9_-]{25,70})['"`]?/gi,
  /(?:gas|GAS)\s*(?:id|ID)[：:\s=]*['"`]?([A-Za-z0-9_-]{25,70})['"`]?/gi,

  // 2.1. ライブラリインストール手順でのスクリプトID（高精度）
  /(?:library|ライブラリ).*?(?:script\s*id|スクリプトID)[：:\s]*['"`]?([A-Za-z0-9_-]{25,70})['"`]?/gi,
  /(?:find\s*a\s*library|ライブラリ.*?検索).*?['"`]?([A-Za-z0-9_-]{25,70})['"`]?/gi,

  // 3. script.google.comドメインの一般URL（中精度）
  /script\.google\.com\/.*?\/([A-Za-z0-9_-]{25,70})/gi,

  // 4. GAS特有のコンテキストでの文字列リテラル（中精度）
  // 'library_id'や'clasp'等のコンテキストの近くにある場合のみ
  // キャプチャグループに先頭の「1」も含める
  /(?:library_id|clasp|apps.?script)[^a-zA-Z0-9_-]*['"`]?(1[A-Za-z0-9_-]{24,69})['"`]?/gi,

  // 5. 1で始まる文字列（厳格化：特定のコンテキストを除外）
  // - HTTP/HTTPS URL内の文字列を除外（GitHub画像URL等の誤検知対策）
  // - *.png, *.jpg等の画像ファイル拡張子を除外
  // - email_id, session_id等のJSONフィールドを除外
  // - UUID形式（ハイフン区切り）を除外
  // キャプチャグループに先頭の「1」も含める
  /(?<!["'](?:email_id|session_id|api_key|user_id|token)["']\s*:\s*["'])(?<!https?:\/\/[^\s)]+\/)\b(1[A-Za-z0-9_-]{24,69})(?!\.[a-z]{2,4})(?!-[a-f0-9]{8}-[a-f0-9]{4})\b(?!["']\s*[,}])/g,
];

/**
 * Google Apps Script Web App検知パターン
 * READMEファイル内に.gsまたは.jsファイルの記載がある場合、Web Appとして検知する
 * より具体的なコンテキスト（ファイルパス、リンク、ファイルリスト等）を考慮した精密なパターン
 * コードブロック内やクォート内の記載は除外
 */
export const DEFAULT_WEB_APP_PATTERNS: RegExp[] = [
  // Markdownリンク形式（最も確実）- .gsと.js両方対応
  /\[.*?\]\([^)]*\.(?:gs|js)\)/gi,
  // ファイルリスト形式（行頭やリスト記号の後）- Google Apps Scriptコンテキストでの.gsファイルのみ
  /(?:^|\n|[-*+]\s+|[\d]+\.\s+)(?:[a-zA-Z0-9_-]+\.gs)\b/gim,
  // ディレクトリ構造やファイル一覧での記載 - .gsファイルのみ
  /(?:├|└|│)\s*[a-zA-Z0-9_-]+\.gs\b/gi,
  // ファイルパス形式（スラッシュで始まる）- .gsファイルのみ
  /\/[a-zA-Z0-9_/-]+\.gs\b/gi,
  // 典型的なGASファイル名（行頭または空白後、クォートなし）- .gsのみに限定
  /(?:^|\s)(?:main|code|app|script|index|appsscript)\.gs\b/gim,
  // Google Apps Scriptと.gs/.jsの組み合わせ
  /google\s*apps?\s*script.*?[a-zA-Z0-9_-]+\.(?:gs|js)/gi,
  // GASでよく使われるファイル名パターン - .gsのみに限定
  /\b(?:code|main|app|script|index)[a-zA-Z0-9_-]*\.gs\b/gi,
  // HTML関連ファイル（Webアプリの特徴）
  /[a-zA-Z0-9_-]+\.html\b/gi,
];

/**
 * Google Apps Scriptでよく使われるタグリスト
 * 実際のGitHubリポジトリ調査に基づく優先度順
 *
 * 調査日: 2025-07-12
 * 調査元: https://github.com/topics/google-apps-script
 */
export const DEFAULT_GAS_TAGS = [
  'google-apps-script',
  'apps-script',
  'google-sheets',
  'google-workspace',
  'gas',
  'google-drive',
  'google-docs',
  'clasp',
  'gas-library',
] as const;

/**
 * GASライブラリスクレイパーのデフォルト設定
 */
export const DEFAULT_SCRAPER_CONFIG: ScraperConfig = {
  rateLimit: {
    maxRequestsPerHour: 60, // 認証なしの場合
    delayBetweenRequests: 1200, // ms
  },
  scriptIdPatterns: DEFAULT_SCRIPT_ID_PATTERNS,
  webAppPatterns: DEFAULT_WEB_APP_PATTERNS,
  gasTags: DEFAULT_GAS_TAGS.slice(0, 5), // 上位5つのタグを使用
  verbose: true,
};
