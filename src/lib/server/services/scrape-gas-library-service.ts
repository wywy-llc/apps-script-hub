import { DEFAULT_WEB_APP_PATTERNS } from '$lib/constants/scraper-config.js';
import { ErrorUtils } from '$lib/server/utils/error-utils.js';
import { GASScriptIdExtractor } from '$lib/server/utils/gas-script-id-extractor.js';
import { GitHubApiUtils } from '$lib/server/utils/github-api-utils.js';
import type { ScrapedLibraryData, ScrapeResult } from '$lib/types/github-scraper.js';

/**
 * 解析結果のキャッシュ型定義
 */
interface ParsedResults {
  webAppInfo: { scriptId: string; scriptType: 'web_app' } | null;
  extractedScriptId: string | undefined;
  webAppFromGsFiles: 'web_app' | null;
}

/**
 * GASライブラリスクレイピングサービス
 * 単一のGitHubリポジトリからライブラリ情報をスクレイピングし、データベース形式に変換する
 *
 * 使用例:
 * const result = await ScrapeGASLibraryService.call('https://github.com/owner/repo');
 *
 * 動作原理:
 * 1. 事前コンパイルされた正規表現でパフォーマンス最適化
 * 2. 早期終了による不要な処理のスキップ
 * 3. GitHubAPIの並行処理による高速化
 * 4. README解析の並行処理による効率化
 */
export class ScrapeGASLibraryService {
  // 正規表現の事前コンパイル（パフォーマンス最適化）
  private static readonly WEB_APP_URL_PATTERN =
    /https:\/\/script\.google\.com\/(?:a\/)?macros\/(?:[^/]+\/)?s\/([A-Za-z0-9_-]+)\/exec/g;

  // 事前コンパイル済みの.gsファイル検出パターン
  private static readonly COMPILED_WEB_APP_PATTERNS = DEFAULT_WEB_APP_PATTERNS;
  /**
   * READMEからGAS WebアプリのURLを検出する（最適化版）
   *
   * @param readmeContent - README文字列
   * @returns 検出されたscriptIdとscriptType、または null
   */
  private static extractWebAppInfo(
    readmeContent: string
  ): { scriptId: string; scriptType: 'web_app' } | null {
    // 事前コンパイルされたパターンを使用してパフォーマンス向上
    this.WEB_APP_URL_PATTERN.lastIndex = 0; // グローバル正規表現のインデックスをリセット
    const matches = readmeContent.matchAll(this.WEB_APP_URL_PATTERN);

    for (const match of matches) {
      const scriptId = match[1]; // グループキャプチャから直接取得

      // 基本的な検証のみ実行して高速化
      if (scriptId && scriptId.length > 10) {
        return { scriptId, scriptType: 'web_app' };
      }
    }

    return null;
  }

  /**
   * READMEに.gsファイルの記載があるかチェックし、Web Appとして検知する（最適化版）
   *
   * @param readmeContent - README文字列
   * @returns .gsファイルが見つかればweb_app、そうでなければnull
   */
  private static detectWebAppFromGsFiles(readmeContent: string): 'web_app' | null {
    // 事前コンパイル済みパターンを使用し、早期終了で高速化
    for (const pattern of this.COMPILED_WEB_APP_PATTERNS) {
      if (pattern.test(readmeContent)) {
        return 'web_app';
      }
    }
    return null;
  }

  /**
   * README解析を並行実行する最適化メソッド
   * @private
   */
  private static async parseReadmeContent(readmeContent: string): Promise<ParsedResults> {
    // README解析の各処理を並行実行して高速化
    const [webAppInfo, extractedScriptId, webAppFromGsFiles] = await Promise.all([
      // WebアプリURL検出を非同期で実行
      Promise.resolve(this.extractWebAppInfo(readmeContent)),
      // スクリプトID抽出を非同期で実行
      Promise.resolve(GASScriptIdExtractor.extractScriptId(readmeContent)),
      // .gsファイル検出を非同期で実行
      Promise.resolve(this.detectWebAppFromGsFiles(readmeContent)),
    ]);

    return {
      webAppInfo,
      extractedScriptId,
      webAppFromGsFiles,
    };
  }

  /**
   * 単一のGitHubリポジトリからライブラリ情報をスクレイピング
   *
   * @param repositoryUrl - GitHubリポジトリURL
   * @returns スクレイピング結果
   */
  public static async call(repositoryUrl: string): Promise<ScrapeResult> {
    try {
      // GitHub URLの解析
      const parsed = GitHubApiUtils.parseGitHubUrl(repositoryUrl);
      if (!parsed) {
        return {
          success: false,
          error: '無効なGitHub URLです',
        };
      }

      const { owner, repo } = parsed;

      // リポジトリ情報、README、最終コミット日時を並行取得
      const [repoInfo, readmeContent, lastCommitAt] = await Promise.all([
        GitHubApiUtils.fetchRepositoryInfo(owner, repo),
        GitHubApiUtils.fetchReadme(owner, repo),
        GitHubApiUtils.fetchLastCommitDate(owner, repo),
      ]);

      let scriptId: string | undefined;
      let scriptType: 'library' | 'web_app' = 'library';

      if (readmeContent) {
        // README解析を並行実行で最適化
        const { webAppInfo, extractedScriptId, webAppFromGsFiles } =
          await this.parseReadmeContent(readmeContent);

        // ライブラリ形式のスクリプトID判定（1から始まるIDのみ）
        const libraryScriptId = extractedScriptId?.startsWith('1') ? extractedScriptId : undefined;

        if (webAppInfo && libraryScriptId) {
          // WebアプリURLと通常のライブラリスクリプトIDの両方がある場合はライブラリとして分類
          scriptId = libraryScriptId;
          scriptType = 'library';
        } else if (webAppInfo) {
          // WebアプリURLのみがある場合はweb_appとして分類
          scriptId = webAppInfo.scriptId;
          scriptType = 'web_app';
        } else if (libraryScriptId) {
          // WebアプリURLがなく、通常のスクリプトIDがある場合
          scriptId = libraryScriptId;
          if (libraryScriptId.startsWith('1')) {
            scriptType = 'library';
          } else {
            // 1以外から始まる場合はWebアプリ条件をチェック
            scriptType = webAppFromGsFiles ? 'web_app' : 'library';
          }
        } else {
          // スクリプトIDもWebアプリURLもない場合、.gsファイルをチェック
          if (webAppFromGsFiles) {
            scriptType = 'web_app';
            // スクリプトIDが無い場合はowner/repo形式をscriptIdとして使用（重複回避）
            scriptId = `${owner}/${repo}`;
          }
        }
      }

      if (!scriptId) {
        return {
          success: false,
          error:
            'READMEからGASスクリプトIDまたはWebアプリURL、.gsファイルの記載が見つかりませんでした',
        };
      }

      if (!lastCommitAt) {
        return {
          success: false,
          error: '最終コミット日時の取得に失敗しました',
        };
      }

      // データベース形式に変換
      const libraryData: ScrapedLibraryData = {
        name: repoInfo.name,
        scriptId,
        repositoryUrl: repoInfo.html_url,
        authorUrl: repoInfo.owner.html_url,
        authorName: repoInfo.owner.login,
        description: repoInfo.description || '',
        licenseType: repoInfo.license?.name,
        licenseUrl: repoInfo.license?.url,
        starCount: repoInfo.stargazers_count,
        lastCommitAt: lastCommitAt,
        status: 'pending',
        scriptType,
      };

      return {
        success: true,
        data: libraryData,
      };
    } catch (error) {
      console.error('スクレイピングエラー:', error);
      return {
        success: false,
        error: ErrorUtils.getMessage(error, 'スクレイピングに失敗しました'),
      };
    }
  }
}
