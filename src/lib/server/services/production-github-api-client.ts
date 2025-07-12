import { GITHUB_TOKEN } from '$env/static/private';
import type { GitHubSearchSortOption } from '$lib/constants/github-search.js';
import { GITHUB_SEARCH_SORT_OPTIONS } from '$lib/constants/github-search.js';
import { ErrorUtils } from '$lib/server/utils/error-utils.js';
import type { GitHubApiClient } from '$lib/types/github-api-client.js';
import type {
  GitHubReadmeResponse,
  GitHubRepository,
  GitHubSearchResponse,
  ScraperConfig,
  TagSearchResult,
} from '$lib/types/github-scraper.js';

/**
 * 本番環境用のGitHub API クライアント
 * 実際のGitHub APIを呼び出す実装
 */
export class ProductionGitHubApiClient implements GitHubApiClient {
  private static readonly GITHUB_API_BASE = 'https://api.github.com';

  /**
   * GitHub API用の認証ヘッダーを生成
   * @returns 認証ヘッダー
   */
  createHeaders(): Record<string, string> {
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
   * @param owner リポジトリオーナー名
   * @param repo リポジトリ名
   * @returns リポジトリ情報
   */
  async fetchRepositoryInfo(owner: string, repo: string): Promise<GitHubRepository> {
    const headers = this.createHeaders();
    const response = await fetch(
      `${ProductionGitHubApiClient.GITHUB_API_BASE}/repos/${owner}/${repo}`,
      { headers }
    );
    if (!response.ok) {
      throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * GitHub APIからREADMEを取得
   * @param owner リポジトリオーナー名
   * @param repo リポジトリ名
   * @returns READMEの内容（取得できない場合はundefined）
   */
  async fetchReadme(owner: string, repo: string): Promise<string | undefined> {
    try {
      const headers = this.createHeaders();
      const response = await fetch(
        `${ProductionGitHubApiClient.GITHUB_API_BASE}/repos/${owner}/${repo}/readme`,
        {
          headers,
        }
      );
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
   * @param config スクレイパー設定
   * @param maxResults 最大取得件数
   * @returns 検索結果
   */
  async searchRepositoriesByTags(
    config: ScraperConfig,
    maxResults: number = 10
  ): Promise<TagSearchResult> {
    try {
      const tagsToUse =
        config.gasTags && config.gasTags.length > 0
          ? config.gasTags
          : ['google-apps-script', 'apps-script'];

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

      const limitedTags = validTags.slice(0, 5);
      let query: string;
      if (limitedTags.length === 1) {
        query = `${limitedTags[0].trim()} in:topics`;
      } else {
        const tagTerms = limitedTags.map(tag => tag.trim()).join(' OR ');
        query = `${tagTerms} in:topics`;
      }

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

      for (let page = 1; page <= totalPages; page++) {
        const remainingResults = apiMaxResults - allRepositories.length;
        const pageSize = Math.min(perPage, remainingResults);

        const searchUrl = `${ProductionGitHubApiClient.GITHUB_API_BASE}/search/repositories?q=${encodeURIComponent(
          query
        )}&sort=stars&order=desc&per_page=${pageSize}&page=${page}`;

        if (config.verbose) {
          console.log(`ページ ${page}/${totalPages} を検索中: ${searchUrl}`);
        }

        const headers = this.createHeaders();
        const response = await fetch(searchUrl, { headers });

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

        if (page === 1) {
          totalFound = searchResult.total_count;
        }

        allRepositories.push(...searchResult.items);

        if (config.verbose) {
          console.log(
            `ページ ${page}: ${searchResult.items.length}件取得 (累計: ${allRepositories.length}件)`
          );
        }

        if (allRepositories.length >= apiMaxResults) {
          break;
        }

        if (searchResult.items.length === 0) {
          break;
        }

        if (page < totalPages) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

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
        error: ErrorUtils.getMessage(error, 'GitHub検索に失敗しました'),
      };
    }
  }

  /**
   * GitHub Search APIでGASタグのリポジトリを検索（ページ範囲指定）
   * @param config スクレイパー設定
   * @param startPage 開始ページ
   * @param endPage 終了ページ
   * @param perPage 1ページあたりの件数
   * @param sortOption 並び順オプション
   * @returns ページ範囲指定検索結果
   */
  async searchRepositoriesByPageRange(
    config: ScraperConfig,
    startPage: number,
    endPage: number,
    perPage: number,
    sortOption?: GitHubSearchSortOption
  ): Promise<TagSearchResult> {
    try {
      const tagsToUse =
        config.gasTags && config.gasTags.length > 0
          ? config.gasTags
          : ['google-apps-script', 'apps-script'];

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

      const limitedTags = validTags.slice(0, 5);
      let query: string;
      if (limitedTags.length === 1) {
        query = `${limitedTags[0].trim()} in:topics`;
      } else {
        const tagTerms = limitedTags.map(tag => tag.trim()).join(' OR ');
        query = `${tagTerms} in:topics`;
      }

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

      for (let page = startPage; page <= endPage; page++) {
        const searchUrl = `${ProductionGitHubApiClient.GITHUB_API_BASE}/search/repositories?q=${encodeURIComponent(
          query
        )}&sort=${sortParams.value}&order=${sortParams.order}&per_page=${perPage}&page=${page}`;

        if (config.verbose) {
          console.log(`ページ ${page}/${endPage} を検索中: ${searchUrl}`);
        }

        const headers = this.createHeaders();
        const response = await fetch(searchUrl, { headers });

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

        if (page === startPage) {
          totalFound = searchResult.total_count;
        }

        allRepositories.push(...searchResult.items);

        if (config.verbose) {
          console.log(
            `ページ ${page}: ${searchResult.items.length}件取得 (累計: ${allRepositories.length}件)`
          );
        }

        if (searchResult.items.length === 0) {
          if (config.verbose) {
            console.log(`ページ ${page} で検索結果が0件のため処理を終了します`);
          }
          break;
        }

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
        error: ErrorUtils.getMessage(error, 'GitHub検索に失敗しました'),
      };
    }
  }

  /**
   * リポジトリの最終コミット日時を取得
   * @param owner リポジトリオーナー名
   * @param repo リポジトリ名
   * @returns 最終コミット日時（取得できない場合はnull）
   */
  async fetchLastCommitDate(owner: string, repo: string): Promise<Date | null> {
    try {
      const headers = this.createHeaders();

      const latestResponse = await fetch(
        `${ProductionGitHubApiClient.GITHUB_API_BASE}/repos/${owner}/${repo}/commits?per_page=1`,
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

  /**
   * フォールバック検索（最もシンプルなクエリを使用）
   * @param maxResults 最大取得件数
   * @param verbose 詳細ログを出力するか
   * @returns 検索結果
   */
  private async fallbackSearch(
    maxResults: number,
    verbose: boolean = false
  ): Promise<TagSearchResult> {
    try {
      const query = 'google-apps-script in:topics';
      const searchUrl = `${ProductionGitHubApiClient.GITHUB_API_BASE}/search/repositories?q=${encodeURIComponent(
        query
      )}&sort=stars&order=desc&per_page=${Math.min(maxResults, 50)}`;

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
        error: ErrorUtils.getMessage(error, 'フォールバック検索に失敗しました'),
      };
    }
  }
}
