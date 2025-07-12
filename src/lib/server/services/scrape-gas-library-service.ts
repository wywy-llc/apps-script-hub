import { DEFAULT_WEB_APP_PATTERNS } from '$lib/constants/scraper-config.js';
import { extractGasScriptId, isValidGasWebAppUrl } from '$lib/helpers/url.js';
import { ErrorUtils } from '$lib/server/utils/error-utils.js';
import { GASScriptIdExtractor } from '$lib/server/utils/gas-script-id-extractor.js';
import { GitHubApiUtils } from '$lib/server/utils/github-api-utils.js';
import type { ScrapedLibraryData, ScrapeResult } from '$lib/types/github-scraper.js';

/**
 * GASライブラリスクレイピングサービス
 * 単一のGitHubリポジトリからライブラリ情報をスクレイピングし、データベース形式に変換する
 *
 * 使用例:
 * const result = await ScrapeGASLibraryService.call('https://github.com/owner/repo');
 */
export class ScrapeGASLibraryService {
  /**
   * READMEからGAS WebアプリのURLを検出する
   *
   * @param readmeContent - README文字列
   * @returns 検出されたscriptIdとscriptType、または null
   */
  private static extractWebAppInfo(
    readmeContent: string
  ): { scriptId: string; scriptType: 'web_app' } | null {
    // GAS実行URLのパターンを検索（標準形式と/a/macros/形式の両方に対応）
    const webAppUrlPattern =
      /https:\/\/script\.google\.com\/(?:a\/)?macros\/(?:[^/]+\/)?s\/([A-Za-z0-9_-]+)\/exec/g;
    const matches = readmeContent.matchAll(webAppUrlPattern);

    for (const match of matches) {
      const url = match[0];
      if (isValidGasWebAppUrl(url)) {
        const scriptId = extractGasScriptId(url);
        if (scriptId) {
          return { scriptId, scriptType: 'web_app' };
        }
      }
    }

    return null;
  }

  /**
   * READMEに.gsファイルの記載があるかチェックし、Web Appとして検知する
   *
   * @param readmeContent - README文字列
   * @returns .gsファイルが見つかればweb_app、そうでなければnull
   */
  private static detectWebAppFromGsFiles(readmeContent: string): 'web_app' | null {
    for (const pattern of DEFAULT_WEB_APP_PATTERNS) {
      if (pattern.test(readmeContent)) {
        return 'web_app';
      }
    }
    return null;
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

      // READMEからスクリプトIDを抽出（ライブラリ形式を優先）
      let scriptId = readmeContent
        ? GASScriptIdExtractor.extractScriptId(readmeContent)
        : undefined;

      let scriptType: 'library' | 'web_app' = 'library';

      // WebアプリURLを最初にチェック（優先度高）
      if (readmeContent) {
        const webAppInfo = this.extractWebAppInfo(readmeContent);
        if (webAppInfo) {
          scriptId = webAppInfo.scriptId;
          scriptType = webAppInfo.scriptType;
        } else if (!scriptId) {
          // ライブラリ形式のスクリプトIDが見つからず、WebアプリURLもない場合、.gsファイルをチェック
          const webAppType = this.detectWebAppFromGsFiles(readmeContent);
          if (webAppType) {
            // .gsファイルが見つかったがスクリプトIDが無い場合は、web_appタイプとして処理を継続
            scriptType = 'web_app';
            // スクリプトIDが無い場合はowner/repo形式をscriptIdとして使用（重複回避）
            scriptId = `${owner}/${repo}`;
          }
        } else {
          // ライブラリIDがある場合でも、.gsファイルの記載があればweb_appタイプに変更
          const webAppType = this.detectWebAppFromGsFiles(readmeContent);
          if (webAppType) {
            scriptType = 'web_app';
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
