import { GITHUB_TOKEN } from '$env/static/private';
import type {
  GitHubReadmeResponse,
  GitHubRepository,
  GitHubSearchResponse,
  ScraperConfig,
  TagSearchResult,
} from '$lib/types/github-scraper.js';

/**
 * GitHub API操作用ユーティリティクラス
 * 各種GitHub API呼び出しの共通機能を提供
 */
export class GitHubApiUtils {
  private static readonly GITHUB_API_BASE = 'https://api.github.com';

  /**
   * GitHub API用の認証ヘッダーを生成
   * プロジェクト全体で共通利用可能な認証ヘッダー生成メソッド
   */
  public static createHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'app-script-hub',
    };

    if (!GITHUB_TOKEN) {
      throw new Error(
        'GITHUB_TOKENが設定されていません。GitHub APIへのアクセスには認証トークンが必要です。'
      );
    }
    headers['Authorization'] = `token ${GITHUB_TOKEN}`;

    return headers;
  }

  /**
   * GitHub APIからリポジトリ情報を取得
   */
  public static async fetchRepositoryInfo(owner: string, repo: string): Promise<GitHubRepository> {
    const headers = this.createHeaders();
    const response = await fetch(`${this.GITHUB_API_BASE}/repos/${owner}/${repo}`, { headers });
    if (!response.ok) {
      throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * GitHub APIからREADMEを取得
   */
  public static async fetchReadme(owner: string, repo: string): Promise<string | undefined> {
    try {
      const headers = this.createHeaders();
      const response = await fetch(`${this.GITHUB_API_BASE}/repos/${owner}/${repo}/readme`, {
        headers,
      });
      if (!response.ok) {
        return undefined;
      }

      const readmeData: GitHubReadmeResponse = await response.json();

      // Base64デコード
      if (readmeData.encoding === 'base64') {
        return atob(readmeData.content.replace(/\n/g, ''));
      }

      return readmeData.content;
    } catch (error) {
      console.warn('README取得に失敗:', error);
      return undefined;
    }
  }

  /**
   * GitHub Search APIでGASタグのリポジトリを検索
   */
  public static async searchRepositoriesByTags(
    config: ScraperConfig,
    maxResults: number = 10
  ): Promise<TagSearchResult> {
    try {
      // gasTagsが空の場合はデフォルトタグを使用
      const tagsToUse =
        config.gasTags && config.gasTags.length > 0
          ? config.gasTags
          : ['google-apps-script', 'apps-script'];

      const searchQueries = tagsToUse.map(tag => `topic:${tag}`);
      const query = `${searchQueries.join(' OR ')} language:javascript`;

      const searchUrl = `${this.GITHUB_API_BASE}/search/repositories?q=${encodeURIComponent(
        query
      )}&sort=stars&order=desc&per_page=${Math.min(maxResults, 100)}`;

      if (config.verbose) {
        console.log('GitHub Search Query:', query);
        console.log('GitHub Search URL:', searchUrl);
      }

      const headers = this.createHeaders();
      const response = await fetch(searchUrl, { headers });

      // エラーレスポンスの詳細情報を取得
      if (!response.ok) {
        let errorDetails = `${response.status} ${response.statusText}`;
        try {
          const errorBody = await response.text();
          if (errorBody) {
            const errorData = JSON.parse(errorBody);
            if (errorData.message) {
              errorDetails += `: ${errorData.message}`;
            }
            if (errorData.errors) {
              errorDetails += ` - ${JSON.stringify(errorData.errors)}`;
            }
          }
        } catch {
          // JSONパースエラーは無視
        }
        throw new Error(`GitHub Search API Error: ${errorDetails}`);
      }

      const searchResult: GitHubSearchResponse = await response.json();

      return {
        success: true,
        repositories: searchResult.items,
        totalFound: searchResult.total_count,
        processedCount: searchResult.items.length,
      };
    } catch (error) {
      console.error('GitHub Search エラー:', error);

      // フォールバック: より単純な検索を試行
      if (error instanceof Error && error.message.includes('422')) {
        if (config.verbose) {
          console.log('フォールバック検索を実行中...');
        }
        return this.fallbackSearch(maxResults, config.verbose);
      }

      return {
        success: false,
        repositories: [],
        totalFound: 0,
        processedCount: 0,
        error: error instanceof Error ? error.message : 'GitHub検索に失敗しました',
      };
    }
  }

  /**
   * フォールバック検索（最もシンプルなクエリを使用）
   */
  private static async fallbackSearch(
    maxResults: number,
    verbose: boolean = false
  ): Promise<TagSearchResult> {
    try {
      // 最もシンプルなクエリを使用
      const query = 'topic:google-apps-script language:javascript';
      const searchUrl = `${this.GITHUB_API_BASE}/search/repositories?q=${encodeURIComponent(
        query
      )}&sort=stars&order=desc&per_page=${Math.min(maxResults, 50)}`; // 件数も制限

      if (verbose) {
        console.log('Fallback Search Query:', query);
      }

      const headers = this.createHeaders();
      const response = await fetch(searchUrl, { headers });
      if (!response.ok) {
        throw new Error(`Fallback Search API Error: ${response.status} ${response.statusText}`);
      }

      const searchResult: GitHubSearchResponse = await response.json();

      return {
        success: true,
        repositories: searchResult.items,
        totalFound: searchResult.total_count,
        processedCount: searchResult.items.length,
      };
    } catch (error) {
      console.error('フォールバック検索エラー:', error);
      return {
        success: false,
        repositories: [],
        totalFound: 0,
        processedCount: 0,
        error: error instanceof Error ? error.message : 'フォールバック検索に失敗しました',
      };
    }
  }

  /**
   * GitHub URLからowner/repoを抽出
   */
  public static parseGitHubUrl(url: string): { owner: string; repo: string } | null {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname !== 'github.com') {
        return null;
      }

      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      if (pathParts.length < 2) {
        return null;
      }

      return {
        owner: pathParts[0],
        repo: pathParts[1].replace(/\.git$/, ''),
      };
    } catch {
      return null;
    }
  }
}
