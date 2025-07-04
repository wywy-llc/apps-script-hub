/**
 * GitHub API レスポンス型定義
 * GAS Library Scraper用の型定義
 */

export interface ScraperConfig {
  rateLimit: {
    maxRequestsPerHour: number;
    delayBetweenRequests: number;
  };
  scriptIdPatterns: RegExp[];
  gasTags: string[];
  verbose: boolean;
}

export interface GitHubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubRepository[];
}

export interface GitHubRepository {
  name: string;
  description: string | null;
  html_url: string;
  clone_url: string;
  stargazers_count: number;
  owner: {
    login: string;
    html_url: string;
  };
  license: {
    name: string;
    url: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface GitHubReadmeResponse {
  content: string;
  encoding: string;
}

export interface ScrapedLibraryData {
  name: string;
  scriptId: string;
  repositoryUrl: string;
  authorUrl: string;
  authorName: string;
  description: string;
  licenseType?: string;
  licenseUrl?: string;
  starCount?: number;
  lastCommitAt: Date;
  status: 'pending';
}

export interface ScrapeResult {
  success: boolean;
  data?: ScrapedLibraryData;
  error?: string;
}

export interface BulkScrapeResult {
  success: boolean;
  results: ScrapeResult[];
  total: number;
  successCount: number;
  errorCount: number;
  duplicateCount: number;
}

export interface TagSearchResult {
  success: boolean;
  repositories: GitHubRepository[];
  totalFound: number;
  processedCount: number;
  error?: string;
}
