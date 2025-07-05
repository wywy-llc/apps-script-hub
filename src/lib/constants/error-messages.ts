/**
 * エラーメッセージ定数
 * プロジェクト全体で使用するエラーメッセージを一元管理
 */
export const ERROR_MESSAGES = {
  // ライブラリ登録関連
  REPOSITORY_ALREADY_REGISTERED: 'This repository is already registered.',
  SCRIPT_ID_ALREADY_REGISTERED: 'This script ID is already registered.',
  INVALID_REPOSITORY_URL: 'The GitHub repository URL format is incorrect.',
  INVALID_SCRIPT_ID: 'Invalid script ID format.',
  SCRIPT_ID_REQUIRED: 'Please enter the GAS Script ID.',
  REPOSITORY_URL_REQUIRED: 'Please enter the GitHub repository URL.',

  // GitHub API関連
  REPOSITORY_NOT_FOUND: 'The specified GitHub repository was not found.',
  GITHUB_API_ERROR: 'GitHub API error occurred.',
  GITHUB_API_RATE_LIMIT: 'GitHub API rate limit reached. Please try again later.',
  GITHUB_REPO_INFO_FETCH_FAILED: 'Failed to fetch GitHub repository information.',

  // 一般的なエラー
  NETWORK_ERROR: 'Network error occurred.',
  INTERNAL_SERVER_ERROR: 'Internal server error occurred.',
  VALIDATION_ERROR: 'Validation error occurred.',
  DATABASE_CONNECTION_FAILED: 'Database connection failed.',
  LAST_COMMIT_DATE_FETCH_FAILED: 'Failed to fetch last commit date.',
} as const;

export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;
