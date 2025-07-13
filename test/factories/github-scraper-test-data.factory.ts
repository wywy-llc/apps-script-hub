import type {
  GitHubRepository,
  ScrapeResult,
  ScraperConfig,
} from '../../src/lib/types/github-scraper.js';
import { createPresetFactories } from './base.factory.js';

export type GitHubRepositoryTestData = GitHubRepository;
export type ScrapeResultTestData = ScrapeResult;
export type ScraperConfigTestData = ScraperConfig;

/**
 * GitHubRepositoryのテストデータファクトリ
 */
export const GitHubRepositoryTestDataFactories = createPresetFactories<GitHubRepositoryTestData>({
  default: () => ({
    id: 123456789,
    name: 'test-gas-library',
    full_name: 'test-user/test-gas-library',
    html_url: 'https://github.com/test-user/test-gas-library',
    clone_url: 'https://github.com/test-user/test-gas-library.git',
    description: 'A test Google Apps Script library',
    stargazers_count: 42,
    language: 'JavaScript',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-12-01T00:00:00Z',
    pushed_at: '2023-12-01T00:00:00Z',
    owner: {
      login: 'test-user',
      id: 987654321,
      avatar_url: 'https://github.com/test-user.png',
      html_url: 'https://github.com/test-user',
      type: 'User',
    },
    license: {
      name: 'MIT',
      url: 'https://github.com/test-user/test-gas-library/blob/main/LICENSE',
    },
  }),
  oauthLibrary: () => ({
    id: 987654321,
    name: 'apps-script-oauth2',
    full_name: 'googleworkspace/apps-script-oauth2',
    html_url: 'https://github.com/googleworkspace/apps-script-oauth2',
    clone_url: 'https://github.com/googleworkspace/apps-script-oauth2.git',
    description: 'An OAuth2 library for Google Apps Script',
    stargazers_count: 789,
    language: 'JavaScript',
    created_at: '2022-01-01T00:00:00Z',
    updated_at: '2023-12-02T00:00:00Z',
    pushed_at: '2023-12-02T00:00:00Z',
    owner: {
      login: 'googleworkspace',
      id: 123456789,
      avatar_url: 'https://github.com/googleworkspace.png',
      html_url: 'https://github.com/googleworkspace',
      type: 'Organization',
    },
    license: {
      name: 'Apache-2.0',
      url: 'https://github.com/googleworkspace/apps-script-oauth2/blob/main/LICENSE',
    },
  }),
});

/**
 * ScrapeResultのテストデータファクトリ
 */
export const ScrapeResultTestDataFactories = createPresetFactories<ScrapeResultTestData>({
  success: () => ({
    success: true,
    data: {
      name: 'test-gas-library',
      scriptId: 'id_1751777395643_nl1hv56sy',
      repositoryUrl: 'https://github.com/test-user/test-gas-library',
      authorUrl: 'https://github.com/test-user',
      authorName: 'test-user',
      description: 'A test Google Apps Script library',
      licenseType: 'MIT',
      licenseUrl: 'https://github.com/test-user/test-gas-library/blob/main/LICENSE',
      starCount: 42,
      lastCommitAt: new Date('2023-12-01T00:00:00Z'),
      status: 'pending' as const,
      scriptType: 'library',
    },
  }),
  successWithOAuth: () => ({
    success: true,
    data: {
      name: 'apps-script-oauth2',
      scriptId: '1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF',
      repositoryUrl: 'https://github.com/googleworkspace/apps-script-oauth2',
      authorUrl: 'https://github.com/googleworkspace',
      authorName: 'googleworkspace',
      description: 'An OAuth2 library for Google Apps Script',
      licenseType: 'Apache-2.0',
      licenseUrl: 'https://github.com/googleworkspace/apps-script-oauth2/blob/main/LICENSE',
      starCount: 789,
      lastCommitAt: new Date('2023-12-02T00:00:00Z'),
      status: 'pending' as const,
      scriptType: 'library',
    },
  }),
  failure: () => ({
    success: false,
    error: 'スクレイピングに失敗しました',
  }),
});

/**
 * ScraperConfigのテストデータファクトリ
 */
export const ScraperConfigTestDataFactories = createPresetFactories<ScraperConfigTestData>({
  default: () => ({
    gasTags: ['google-apps-script', 'apps-script'],
    scriptIdPatterns: [
      /\b[A-Za-z0-9_-]{33}([A-Za-z0-9_-]{24})?\b/,
      /script\.google\.com\/d\/([A-Za-z0-9_-]{33}([A-Za-z0-9_-]{24})?)/,
    ],
    webAppPatterns: [/script\.google\.com\/macros\/s\/([A-Za-z0-9_-]+)/],
    rateLimit: {
      maxRequestsPerHour: 5000,
    },
    verbose: false,
  }),
  verbose: () => ({
    gasTags: ['google-apps-script', 'apps-script'],
    scriptIdPatterns: [
      /\b[A-Za-z0-9_-]{33}([A-Za-z0-9_-]{24})?\b/,
      /script\.google\.com\/d\/([A-Za-z0-9_-]{33}([A-Za-z0-9_-]{24})?)/,
    ],
    webAppPatterns: [/script\.google\.com\/macros\/s\/([A-Za-z0-9_-]+)/],
    rateLimit: {
      maxRequestsPerHour: 5000,
    },
    verbose: true,
  }),
  fastMode: () => ({
    gasTags: ['google-apps-script', 'apps-script'],
    scriptIdPatterns: [
      /\b[A-Za-z0-9_-]{33}([A-Za-z0-9_-]{24})?\b/,
      /script\.google\.com\/d\/([A-Za-z0-9_-]{33}([A-Za-z0-9_-]{24})?)/,
    ],
    webAppPatterns: [/script\.google\.com\/macros\/s\/([A-Za-z0-9_-]+)/],
    rateLimit: {
      maxRequestsPerHour: 5000,
    },
    verbose: false,
  }),
});

/**
 * 重複チェッカーのテストファクトリ
 */
export const DuplicateCheckerTestDataFactories = {
  noDuplicates: () => async (): Promise<boolean> => false,
  allDuplicates: () => async (): Promise<boolean> => true,
  specificDuplicates:
    (duplicateIds: string[]) =>
    async (scriptId: string): Promise<boolean> =>
      duplicateIds.includes(scriptId),
};

/**
 * 保存コールバックのテストファクトリ（通常の保存用）
 */
export const LibrarySaveCallbackTestDataFactories = {
  alwaysSuccess: () => async (): Promise<{ success: boolean; id?: string; error?: string }> => ({
    success: true,
    id: 'test-library-id',
  }),
  alwaysFailure: () => async (): Promise<{ success: boolean; id?: string; error?: string }> => ({
    success: false,
    error: 'Save failed',
  }),
};

/**
 * 保存コールバックのテストファクトリ（AI要約付き保存用）
 */
export const SaveWithSummaryCallbackTestDataFactories = {
  alwaysSuccess: () => async (): Promise<{ success: boolean; id?: string; error?: string }> => ({
    success: true,
    id: 'test-library-id',
  }),
  alwaysFailure: () => async (): Promise<{ success: boolean; id?: string; error?: string }> => ({
    success: false,
    error: 'Save failed',
  }),
};
