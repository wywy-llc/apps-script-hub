import { GITHUB_TOKEN } from '$env/static/private';
import {
  GITHUB_SEARCH_SORT_OPTIONS,
  type GitHubSearchSortOption,
} from '$lib/constants/github-search.js';
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
      'X-GitHub-Api-Version': '2022-11-28',
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
   * GitHub Search APIでGASタグのリポジトリを検索（ページング対応）
   * maxResultsが100を超える場合は複数ページから取得
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

      // 各タグが有効かチェック
      const validTags = tagsToUse.filter(tag => tag && tag.trim().length > 0);
      if (validTags.length === 0) {
        return {
          success: false,
          repositories: [],
          totalFound: 0,
          processedCount: 0,
          error: '有効なGASタグが指定されていません',
        };
      }

      // 最初の5つのタグのみを使用してクエリの長さを制限
      const limitedTags = validTags.slice(0, 5);
      // GitHub Search APIの正しいOR検索クエリ形式を使用
      let query: string;
      if (limitedTags.length === 1) {
        // 単一タグの場合
        query = `${limitedTags[0].trim()} in:topics`;
      } else {
        // 複数タグの場合：OR演算子を使用
        const tagTerms = limitedTags.map(tag => tag.trim()).join(' OR ');
        query = `${tagTerms} in:topics`;
      }

      // GitHub APIの制限：1000件まで、1ページあたり100件まで
      const apiMaxResults = Math.min(maxResults, 1000);
      const perPage = 100;
      const totalPages = Math.ceil(apiMaxResults / perPage);

      if (config.verbose) {
        console.log('Original gasTags:', config.gasTags);
        console.log('Tags to use:', tagsToUse);
        console.log('Valid tags:', validTags);
        console.log('Limited tags:', limitedTags);
        console.log('GitHub Search Query:', query);
        console.log(`取得予定件数: ${apiMaxResults}件 (${totalPages}ページ)`);
      }

      let allRepositories: GitHubRepository[] = [];
      let totalFound = 0;

      // 複数ページから検索結果を取得
      for (let page = 1; page <= totalPages; page++) {
        const remainingResults = apiMaxResults - allRepositories.length;
        const pageSize = Math.min(perPage, remainingResults);

        const searchUrl = `${this.GITHUB_API_BASE}/search/repositories?q=${encodeURIComponent(
          query
        )}&sort=stars&order=desc&per_page=${pageSize}&page=${page}`;

        if (config.verbose) {
          console.log(`ページ ${page}/${totalPages} を検索中: ${searchUrl}`);
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

        // 初回のtotal_countを保存
        if (page === 1) {
          totalFound = searchResult.total_count;
        }

        allRepositories.push(...searchResult.items);

        if (config.verbose) {
          console.log(
            `ページ ${page}: ${searchResult.items.length}件取得 (累計: ${allRepositories.length}件)`
          );
        }

        // 必要な件数に達したら終了
        if (allRepositories.length >= apiMaxResults) {
          break;
        }

        // 検索結果が空の場合は終了
        if (searchResult.items.length === 0) {
          break;
        }

        // GitHub API レート制限対策: ページ間で少し待機
        if (page < totalPages) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      // maxResultsを超えた場合は切り詰める
      if (allRepositories.length > maxResults) {
        allRepositories = allRepositories.slice(0, maxResults);
      }

      return {
        success: true,
        repositories: allRepositories,
        totalFound,
        processedCount: allRepositories.length,
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
      const query = 'google-apps-script in:topics';
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
   * GitHub Search APIでGASタグのリポジトリを検索（ページ範囲指定）
   * 指定されたページ範囲から検索結果を取得
   *
   * @param config - スクレイパー設定
   * @param startPage - 開始ページ（1から開始）
   * @param endPage - 終了ページ
   * @param perPage - 1ページあたりの件数（10, 25, 50, 100）
   * @param sortOption - 並び順オプション（省略時はデフォルト）
   * @returns ページ範囲指定検索結果
   */
  public static async searchRepositoriesByPageRange(
    config: ScraperConfig,
    startPage: number,
    endPage: number,
    perPage: number,
    sortOption?: GitHubSearchSortOption
  ): Promise<TagSearchResult> {
    try {
      // gasTagsが空の場合はデフォルトタグを使用
      const tagsToUse =
        config.gasTags && config.gasTags.length > 0
          ? config.gasTags
          : ['google-apps-script', 'apps-script'];

      // 各タグが有効かチェック
      const validTags = tagsToUse.filter(tag => tag && tag.trim().length > 0);
      if (validTags.length === 0) {
        return {
          success: false,
          repositories: [],
          totalFound: 0,
          processedCount: 0,
          error: '有効なGASタグが指定されていません',
        };
      }

      // 最初の5つのタグのみを使用してクエリの長さを制限
      const limitedTags = validTags.slice(0, 5);
      // GitHub Search APIの正しいOR検索クエリ形式を使用
      let query: string;
      if (limitedTags.length === 1) {
        // 単一タグの場合
        query = `${limitedTags[0].trim()} in:topics`;
      } else {
        // 複数タグの場合：OR演算子を使用
        const tagTerms = limitedTags.map(tag => tag.trim()).join(' OR ');
        query = `${tagTerms} in:topics`;
      }

      // 並び順パラメータを適用
      const sortParams = sortOption
        ? GITHUB_SEARCH_SORT_OPTIONS[sortOption]
        : GITHUB_SEARCH_SORT_OPTIONS.UPDATED_DESC;

      const totalPages = endPage - startPage + 1;
      const allRepositories: GitHubRepository[] = [];
      let totalFound = 0;

      if (config.verbose) {
        console.log('Original gasTags:', config.gasTags);
        console.log('Tags to use:', tagsToUse);
        console.log('Valid tags:', validTags);
        console.log('Limited tags:', limitedTags);
        console.log('GitHub Search Query:', query);
        console.log('Sort params:', sortParams);
        console.log(
          `ページ範囲指定検索: ${startPage} - ${endPage} (${perPage}件/ページ, ${totalPages}ページ)`
        );
      }

      // 指定されたページ範囲で検索結果を取得
      for (let page = startPage; page <= endPage; page++) {
        const searchUrl = `${this.GITHUB_API_BASE}/search/repositories?q=${encodeURIComponent(
          query
        )}&sort=${sortParams.value}&order=${sortParams.order}&per_page=${perPage}&page=${page}`;

        if (config.verbose) {
          console.log(`ページ ${page}/${endPage} を検索中: ${searchUrl}`);
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

        // 初回のtotal_countを保存
        if (page === startPage) {
          totalFound = searchResult.total_count;
        }

        allRepositories.push(...searchResult.items);

        if (config.verbose) {
          console.log(
            `ページ ${page}: ${searchResult.items.length}件取得 (累計: ${allRepositories.length}件)`
          );
        }

        // 検索結果が空の場合は終了
        if (searchResult.items.length === 0) {
          if (config.verbose) {
            console.log(`ページ ${page} で検索結果が0件のため処理を終了します`);
          }
          break;
        }

        // GitHub API レート制限対策: ページ間で少し待機
        if (page < endPage) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      return {
        success: true,
        repositories: allRepositories,
        totalFound,
        processedCount: allRepositories.length,
      };
    } catch (error) {
      console.error('GitHub Search エラー:', error);

      // フォールバック: より単純な検索を試行
      if (error instanceof Error && error.message.includes('422')) {
        if (config.verbose) {
          console.log('フォールバック検索を実行中...');
        }
        return this.fallbackSearch(perPage * (endPage - startPage + 1), config.verbose);
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

  /**
   * リポジトリの最終コミット日時を取得
   */
  public static async fetchLastCommitDate(owner: string, repo: string): Promise<Date | null> {
    try {
      const headers = this.createHeaders();

      // 最新のコミット（最終コミット）を取得
      const latestResponse = await fetch(
        `${this.GITHUB_API_BASE}/repos/${owner}/${repo}/commits?per_page=1`,
        { headers }
      );
      if (!latestResponse.ok) {
        return null;
      }
      const latestCommits = await latestResponse.json();
      if (!latestCommits || latestCommits.length === 0) {
        return null;
      }
      const lastCommitAt = new Date(latestCommits[0].commit.committer.date);

      return lastCommitAt;
    } catch (error) {
      console.error('コミット日時取得エラー:', error);
      return null;
    }
  }
}
