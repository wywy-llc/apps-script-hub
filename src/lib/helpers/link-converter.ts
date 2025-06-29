/**
 * 相対パスリンクをGitHubの絶対パスに変換するユーティリティ
 */

/**
 * GitHubリポジトリURLから、README用の絶対パスベースURLを生成
 * @param repositoryUrl - GitHubリポジトリURL (例: https://github.com/owner/repo)
 * @returns READMEリンク用のベースURL (例: https://github.com/owner/repo/blob/main)
 */
export function getReadmeBaseUrl(repositoryUrl: string): string {
  try {
    const url = new URL(repositoryUrl);
    if (url.hostname !== 'github.com') {
      return repositoryUrl;
    }

    // パスの末尾の.gitを除去し、/blob/mainを追加
    const cleanPath = url.pathname.replace(/\.git$/, '');
    return `https://github.com${cleanPath}/blob/main`;
  } catch {
    return repositoryUrl;
  }
}

/**
 * 相対パスをGitHubの絶対パスに変換
 * @param href - 元のhref属性値
 * @param baseUrl - GitHubリポジトリのベースURL
 * @returns 変換後の絶対URL
 */
export function convertRelativeToAbsolute(href: string, baseUrl: string): string {
  // 既に絶対URLの場合はそのまま返す
  if (href.startsWith('http://') || href.startsWith('https://')) {
    return href;
  }

  // アンカーリンクの場合はそのまま返す（ページ内リンク）
  if (href.startsWith('#')) {
    return href;
  }

  // 相対パスの場合は絶対パスに変換
  if (
    href.startsWith('./') ||
    href.startsWith('../') ||
    (!href.startsWith('/') && !href.includes('://'))
  ) {
    try {
      const url = new URL(href, baseUrl + '/');
      return url.href;
    } catch {
      // URL変換に失敗した場合は元のhrefを返す
      return href;
    }
  }

  // ルート相対パス（/で始まる）の場合
  if (href.startsWith('/')) {
    return `https://github.com${href}`;
  }

  return href;
}

/**
 * マークダウン内のリンクを一括変換
 * @param content - マークダウンコンテンツ
 * @param repositoryUrl - GitHubリポジトリURL
 * @returns リンクが変換されたマークダウンコンテンツ
 */
export function convertMarkdownLinks(content: string, repositoryUrl: string): string {
  const baseUrl = getReadmeBaseUrl(repositoryUrl);

  // マークダウンリンク記法 [text](url) を変換
  return content.replace(/\[([^\]]*)\]\(([^)]+)\)/g, (_, text, href) => {
    const convertedHref = convertRelativeToAbsolute(href, baseUrl);
    return `[${text}](${convertedHref})`;
  });
}
