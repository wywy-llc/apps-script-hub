import type {
  GitHubRepository,
  GitHubReadmeResponse,
  GitHubSearchResponse,
  ScrapedLibraryData,
  ScrapeResult,
  BulkScrapeResult,
  TagSearchResult,
  ScraperConfig,
} from '$lib/types/github-scraper.js';

/**
 * GAS Library Scraper Service
 * GitHub APIを使用してライブラリ情報をスクレイピングし、データベース形式に変換する
 */
export class GASLibraryScraper {
  private static readonly GITHUB_API_BASE = 'https://api.github.com';

  private static readonly DEFAULT_CONFIG: ScraperConfig = {
    rateLimit: {
      maxRequestsPerHour: 60, // 認証なしの場合
      delayBetweenRequests: 1200, // ms
    },
    scriptIdPatterns: [
      /スクリプトID[：:\s]*([A-Za-z0-9_-]{20,})/gi,
      /Script[\s]*ID[：:\s]*([A-Za-z0-9_-]{20,})/gi,
      /script[\s]*id[：:\s]*['"`]([A-Za-z0-9_-]{20,})['"`]/gi,
      /https:\/\/script\.google\.com\/macros\/d\/([A-Za-z0-9_-]{20,})/gi,
      /script\.google\.com\/.*?\/([A-Za-z0-9_-]{20,})/gi,
      /\b1[A-Za-z0-9_-]{20,}\b/g,
    ],
    gasTags: [
      'google-apps-script',
      'apps-script',
      'google-workspace',
      'google-sheets',
      'gas-library',
      'clasp',
    ],
    verbose: false,
  };

  /**
   * GitHub APIからリポジトリ情報を取得
   */
  private static async fetchRepositoryInfo(owner: string, repo: string): Promise<GitHubRepository> {
    const response = await fetch(`${this.GITHUB_API_BASE}/repos/${owner}/${repo}`);
    if (!response.ok) {
      throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * GitHub APIからREADMEを取得
   */
  private static async fetchReadme(owner: string, repo: string): Promise<string | undefined> {
    try {
      const response = await fetch(`${this.GITHUB_API_BASE}/repos/${owner}/${repo}/readme`);
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
   * READMEからGASスクリプトIDを抽出
   */
  private static extractScriptIdFromReadme(
    readme: string,
    config: ScraperConfig = this.DEFAULT_CONFIG
  ): string | undefined {
    for (const pattern of config.scriptIdPatterns) {
      const matches = readme.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].length >= 20) {
          return match[1];
        }
      }
    }

    return undefined;
  }

  /**
   * GitHub Search APIでGASタグのリポジトリを検索
   */
  private static async searchRepositoriesByTags(
    config: ScraperConfig = this.DEFAULT_CONFIG,
    maxResults: number = 10
  ): Promise<TagSearchResult> {
    try {
      const searchQueries = config.gasTags.map(tag => `topic:${tag}`);
      const query = `${searchQueries.join(' OR ')} language:javascript`;

      const searchUrl = `${this.GITHUB_API_BASE}/search/repositories?q=${encodeURIComponent(
        query
      )}&sort=stars&order=desc&per_page=${Math.min(maxResults, 100)}`;

      if (config.verbose) {
        console.log('GitHub Search Query:', query);
      }

      const response = await fetch(searchUrl);
      if (!response.ok) {
        throw new Error(`GitHub Search API Error: ${response.status} ${response.statusText}`);
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
   * 単一のGitHubリポジトリからライブラリ情報をスクレイピング
   *
   * @param repositoryUrl - GitHubリポジトリURL
   * @returns スクレイピング結果
   */
  public static async call(repositoryUrl: string): Promise<ScrapeResult> {
    try {
      // GitHub URLの解析
      let owner: string, repo: string;
      try {
        const urlObj = new URL(repositoryUrl);
        if (urlObj.hostname !== 'github.com') {
          return {
            success: false,
            error: '無効なGitHub URLです',
          };
        }

        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        if (pathParts.length < 2) {
          return {
            success: false,
            error: '無効なGitHub URLです',
          };
        }

        owner = pathParts[0];
        repo = pathParts[1].replace(/\.git$/, '');
      } catch {
        return {
          success: false,
          error: '無効なGitHub URLです',
        };
      }

      // リポジトリ情報とREADMEを並行取得
      const [repoInfo, readmeContent] = await Promise.all([
        this.fetchRepositoryInfo(owner, repo),
        this.fetchReadme(owner, repo),
      ]);

      // READMEからスクリプトIDを抽出
      const scriptId = readmeContent ? this.extractScriptIdFromReadme(readmeContent) : undefined;

      if (!scriptId) {
        return {
          success: false,
          error: 'READMEからGASスクリプトIDが見つかりませんでした',
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
        readmeContent,
        licenseType: repoInfo.license?.name,
        licenseUrl: repoInfo.license?.url,
        starCount: repoInfo.stargazers_count,
        status: 'pending',
      };

      return {
        success: true,
        data: libraryData,
      };
    } catch (error) {
      console.error('スクレイピングエラー:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'スクレイピングに失敗しました',
      };
    }
  }

  /**
   * GASタグでリポジトリを検索し、一括でスクレイピング
   *
   * @param maxResults - 検索する最大リポジトリ数
   * @param duplicateChecker - 重複チェック関数
   * @param config - スクレイパー設定
   * @returns 一括スクレイピング結果
   */
  public static async bulkScrapeByTags(
    maxResults: number = 10,
    duplicateChecker?: (scriptId: string) => Promise<boolean>,
    config: ScraperConfig = this.DEFAULT_CONFIG
  ): Promise<BulkScrapeResult> {
    const results: ScrapeResult[] = [];
    let duplicateCount = 0;

    try {
      // GASタグでリポジトリを検索
      const searchResult = await this.searchRepositoriesByTags(config, maxResults);

      if (!searchResult.success) {
        return {
          success: false,
          results: [
            {
              success: false,
              error: searchResult.error || 'GitHub検索に失敗しました',
            },
          ],
          total: 0,
          successCount: 0,
          errorCount: 1,
          duplicateCount: 0,
        };
      }

      if (config.verbose) {
        console.log(
          `GitHub検索結果: ${searchResult.totalFound}件中${searchResult.processedCount}件を処理`
        );
      }

      // 各リポジトリを逐次処理
      for (const repo of searchResult.repositories) {
        try {
          const result = await this.call(repo.html_url);

          // 重複チェック
          if (result.success && result.data && duplicateChecker) {
            const isDuplicate = await duplicateChecker(result.data.scriptId);
            if (isDuplicate) {
              duplicateCount++;
              results.push({
                success: false,
                error: `重複: スクリプトID ${result.data.scriptId} は既に存在します (${repo.name})`,
              });
              continue;
            }
          }

          results.push(result);

          // GitHub API制限対策: 各リクエスト間に待機
          await new Promise(resolve => setTimeout(resolve, config.rateLimit.delayBetweenRequests));
        } catch (error) {
          results.push({
            success: false,
            error: `${repo.name}: ${error instanceof Error ? error.message : 'スクレイピングに失敗しました'}`,
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const errorCount = results.filter(r => !r.success).length;

      return {
        success: successCount > 0,
        results,
        total: searchResult.processedCount,
        successCount,
        errorCount,
        duplicateCount,
      };
    } catch (error) {
      console.error('一括スクレイピングエラー:', error);
      return {
        success: false,
        results: [
          {
            success: false,
            error: error instanceof Error ? error.message : '一括スクレイピングに失敗しました',
          },
        ],
        total: 0,
        successCount: 0,
        errorCount: 1,
        duplicateCount: 0,
      };
    }
  }
}
