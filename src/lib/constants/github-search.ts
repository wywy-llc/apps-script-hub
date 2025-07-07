/**
 * GitHub検索用の定数定義
 */

/**
 * GitHub検索の並び順オプション
 */
export const GITHUB_SEARCH_SORT_OPTIONS = {
  UPDATED_DESC: {
    value: 'updated',
    order: 'desc',
    label: '更新の新しい順',
    description: '最近更新されたリポジトリから表示',
  },
  STARS_DESC: {
    value: 'stars',
    order: 'desc',
    label: 'スターの多い順',
    description: 'スター数の多いリポジトリから表示',
  },
} as const;

/**
 * GitHub検索の並び順タイプ
 */
export type GitHubSearchSortOption = keyof typeof GITHUB_SEARCH_SORT_OPTIONS;

/**
 * GitHub検索の並び順のデフォルト値
 */
export const DEFAULT_GITHUB_SEARCH_SORT: GitHubSearchSortOption = 'UPDATED_DESC';

/**
 * GitHub検索の並び順選択肢（配列形式）
 */
export const GITHUB_SEARCH_SORT_CHOICES = Object.entries(GITHUB_SEARCH_SORT_OPTIONS).map(
  ([key, option]) => ({
    key: key as GitHubSearchSortOption,
    value: option.value,
    order: option.order,
    label: option.label,
    description: option.description,
  })
);

/**
 * GitHub検索のクエリパラメータを生成
 */
export function buildGitHubSearchQuery(
  sortOption: GitHubSearchSortOption = DEFAULT_GITHUB_SEARCH_SORT
): string {
  const option = GITHUB_SEARCH_SORT_OPTIONS[sortOption];
  return `o=${option.order}&s=${option.value}`;
}
