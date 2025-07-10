import { LibraryRepository } from '$lib/server/repositories/library-repository.js';

/**
 * ライブラリ重複検証サービス
 */
export class ValidateLibraryUniquenessService {
  /**
   * ライブラリの重複チェックを実行
   *
   * 使用例:
   * ```typescript
   * await ValidateLibraryUniquenessService.call('script123', 'https://github.com/owner/repo');
   * // 重複がある場合はエラーを投げる
   * ```
   *
   * 動作原理:
   * 1. スクリプトIDとリポジトリURLそれぞれで既存ライブラリをチェック
   * 2. いずれかが重複している場合は適切なエラーメッセージを投げる
   * 3. 重複がない場合は正常終了
   *
   * @param scriptId 検証するスクリプトID
   * @param repositoryUrl 検証するリポジトリURL
   * @throws Error 重複している場合
   */
  public static async call(scriptId: string, repositoryUrl: string): Promise<void> {
    await LibraryRepository.ensureUnique(scriptId, repositoryUrl);
  }
}
