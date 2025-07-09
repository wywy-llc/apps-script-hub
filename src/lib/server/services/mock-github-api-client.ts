import { ERROR_MESSAGES } from '$lib/constants/error-messages.js';
import { GitHubMockData } from '$lib/server/factories/github-api-client-factory.js';
import type { GitHubApiClient } from '$lib/types/github-api-client.js';
import type {
  GitHubRepository,
  ScraperConfig,
  TagSearchResult,
} from '$lib/types/github-scraper.js';
import type { GitHubSearchSortOption } from '$lib/constants/github-search.js';

/**
 * E2Eテスト用のGitHub API モッククライアント
 * 実際のAPIを呼び出さずにモックデータを返す実装
 */
export class MockGitHubApiClient implements GitHubApiClient {
  /**
   * モック用の認証ヘッダーを生成
   * @returns モック認証ヘッダー
   */
  createHeaders(): Record<string, string> {
    return {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'app-script-hub',
      'X-GitHub-Api-Version': '2022-11-28',
      Authorization: 'token mock-github-token-for-e2e',
    };
  }

  /**
   * モックリポジトリ情報を取得
   * @param owner リポジトリオーナー名
   * @param repo リポジトリ名
   * @returns モックリポジトリ情報
   */
  async fetchRepositoryInfo(owner: string, repo: string): Promise<GitHubRepository> {
    console.log(`🤖 [E2E Mock] リポジトリ情報取得中: ${owner}/${repo} (モックデータを使用)`);
    await new Promise(resolve => setTimeout(resolve, 50));

    // 存在しないリポジトリのテストケース
    if (owner === 'nonexistent-user-999999' && repo === 'nonexistent-repo-999999') {
      throw new Error(ERROR_MESSAGES.REPOSITORY_NOT_FOUND);
    }

    // OAuth2ライブラリの特別なケース
    if (owner === 'googleworkspace' && repo === 'apps-script-oauth2') {
      return GitHubMockData.getOauth2LibraryRepository();
    }

    // デフォルトモックデータ
    return GitHubMockData.getDefaultRepository(owner, repo);
  }

  /**
   * モックREADMEを取得
   * @param owner リポジトリオーナー名
   * @param repo リポジトリ名
   * @returns モックREADMEの内容
   */
  async fetchReadme(owner: string, repo: string): Promise<string | undefined> {
    console.log(`🤖 [E2E Mock] README取得中: ${owner}/${repo} (モックデータを使用)`);
    await new Promise(resolve => setTimeout(resolve, 50));

    // 特定のテストケース用のモックREADME
    if (owner === 'googleworkspace' && repo === 'apps-script-oauth2') {
      return GitHubMockData.getOauth2LibraryReadme();
    }

    // デフォルトのモックREADME
    return GitHubMockData.getDefaultReadme(repo);
  }

  /**
   * モック検索結果を取得（ページング対応）
   * @param config スクレイパー設定
   * @param _maxResults 最大取得件数
   * @returns モック検索結果
   */
  async searchRepositoriesByTags(
    config: ScraperConfig,
    _maxResults: number = 10 // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<TagSearchResult> {
    console.log(`🤖 [E2E Mock] タグ検索中: ${config.gasTags} (モックデータを使用)`);
    await new Promise(resolve => setTimeout(resolve, 100));

    // E2Eテストでは空の結果を返す
    return {
      success: true,
      repositories: [],
      totalFound: 0,
      processedCount: 0,
    };
  }

  /**
   * モック検索結果を取得（ページ範囲指定）
   * @param _config スクレイパー設定
   * @param startPage 開始ページ
   * @param endPage 終了ページ
   * @param _perPage 1ページあたりの件数
   * @param _sortOption 並び順オプション
   * @returns モック検索結果
   */
  async searchRepositoriesByPageRange(
    _config: ScraperConfig,
    startPage: number,
    endPage: number,
    _perPage: number, // eslint-disable-line @typescript-eslint/no-unused-vars
    _sortOption?: GitHubSearchSortOption // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<TagSearchResult> {
    console.log(`🤖 [E2E Mock] ページ範囲指定検索中: ${startPage}-${endPage} (モックデータを使用)`);
    await new Promise(resolve => setTimeout(resolve, 100));

    // E2Eテストでは空の結果を返す
    return {
      success: true,
      repositories: [],
      totalFound: 0,
      processedCount: 0,
    };
  }

  /**
   * モック最終コミット日時を取得
   * @param owner リポジトリオーナー名
   * @param repo リポジトリ名
   * @returns モック最終コミット日時
   */
  async fetchLastCommitDate(owner: string, repo: string): Promise<Date | null> {
    console.log(`🤖 [E2E Mock] コミット日時取得中: ${owner}/${repo} (モックデータを使用)`);
    await new Promise(resolve => setTimeout(resolve, 50));

    // 存在しないリポジトリのテストケース
    if (owner === 'nonexistent-user-999999' && repo === 'nonexistent-repo-999999') {
      return null;
    }

    // モックコミット日時を返す
    return GitHubMockData.getMockCommitDate();
  }
}
