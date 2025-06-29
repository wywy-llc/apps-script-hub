import type {
  GitHubRepository,
  GitHubReadmeResponse,
  GitHubSearchResponse,
  TagSearchResult,
  ScraperConfig,
} from '$lib/types/github-scraper.js';

/**
 * GitHub API操作用ユーティリティクラス
 * 各種GitHub API呼び出しの共通機能を提供
 */
export class GitHubApiUtils {
  private static readonly GITHUB_API_BASE = 'https://api.github.com';

  /**
   * GitHub APIからリポジトリ情報を取得
   */
  public static async fetchRepositoryInfo(owner: string, repo: string): Promise<GitHubRepository> {
    const response = await fetch(`${this.GITHUB_API_BASE}/repos/${owner}/${repo}`);
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
   * GitHub Search APIでGASタグのリポジトリを検索
   */
  public static async searchRepositoriesByTags(
    config: ScraperConfig,
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
