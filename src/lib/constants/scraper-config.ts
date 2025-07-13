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
 * 1. ライブラリキー明示記載（最高精度）
 * 2. コードブロック内のライブラリID（高精度）
 * 3. Google Script URL形式（高精度）
 * 4. 明示的な「スクリプトID」「Script ID」ラベル付き
 * 5. script.google.comドメインの一般URL
 * 6. GAS特有のコンテキストでの文字列リテラル
 *
 * 注意: 誤検出を防ぐため、JSON形式のemail_idやその他のIDと区別
 */
export const DEFAULT_SCRIPT_ID_PATTERNS: RegExp[] = [
  // 1. ライブラリキー明示記載（最高精度）
  // 「The library's project key is as follows」や「ライブラリのプロジェクトキー」の後のID
  /(?:library["']?s?\s*project\s*key|project\s*key|ライブラリ.*?プロジェクト.*?キー|ライブラリ.*?キー)[^:]*[:：]?\s*(?:is\s*)?(?:as\s*follows[.。]?)?\s*```?\s*(1[A-Za-z0-9_-]{24,69})\s*```?/gi,

  // 2. コードブロック内のライブラリID（高精度）
  // Markdownコードブロック内の1で始まる長い文字列
  /```[^`]*?(1[A-Za-z0-9_-]{24,69})[^`]*?```/gs,

  // 3. Google Script URL形式（高精度）
  /https:\/\/script\.google\.com\/macros\/d\/([A-Za-z0-9_-]{25,70})\/edit/gi,
  /https:\/\/script\.google\.com\/macros\/d\/([A-Za-z0-9_-]{25,70})/gi,

  // 4. 明示的ラベル付き（高精度）
  /(?:スクリプト|script)\s*(?:id|ID)[：:\s=]*['"`]?([A-Za-z0-9_-]{25,70})['"`]?/gi,
  /(?:gas|GAS)\s*(?:id|ID)[：:\s=]*['"`]?([A-Za-z0-9_-]{25,70})['"`]?/gi,

  // 4.1. ライブラリインストール手順でのスクリプトID（高精度）
  /(?:library|ライブラリ).*?(?:script\s*id|スクリプトID)[：:\s]*['"`]?([A-Za-z0-9_-]{25,70})['"`]?/gi,
  /(?:find\s*a\s*library|ライブラリ.*?検索).*?['"`]?([A-Za-z0-9_-]{25,70})['"`]?/gi,

  // 5. script.google.comドメインの一般URL（中精度）
  /script\.google\.com\/.*?\/([A-Za-z0-9_-]{25,70})/gi,

  // 6. GAS特有のコンテキストでの文字列リテラル（中精度）
  // 'library_id'や'clasp'等のコンテキストの近くにある場合のみ
  // キャプチャグループに先頭の「1」も含める
  /(?:library_id|clasp|apps.?script)[^a-zA-Z0-9_-]*['"`]?(1[A-Za-z0-9_-]{24,69})['"`]?/gi,

  // 7. 基本的な1で始まる文字列（キャプチャグループに先頭の「1」も含める）
  /\b(1[A-Za-z0-9_-]{24,69})\b/g,
];

/**
 * スクリプトID候補から除外すべきパターン
 * 誤検知を防ぐため、これらのパターンに一致する文字列は除外される
 */
export const SCRIPT_ID_EXCLUSION_PATTERNS: RegExp[] = [
  // URL内の文字列を除外（GitHub画像URL等、ただしscript.google.comは除外しない）
  /https?:\/\/(?!script\.google\.com)[^\s)]+\/[A-Za-z0-9_-]+/gi,

  // 画像ファイル拡張子を除外
  /1[A-Za-z0-9_-]{24,69}\.(png|jpg|jpeg|gif|webp|svg)/gi,

  // JSON形式のIDフィールドを除外
  /["'](?:email_id|session_id|api_key|user_id|token)["']\s*:\s*["'][A-Za-z0-9_-]+["']/gi,

  // UUID形式（ハイフン区切り）を除外
  /1[a-f0-9]{7}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi,

  // JSON配列やオブジェクト内の値を除外
  /["'][A-Za-z0-9_-]+["']\s*[,}]/gi,
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
