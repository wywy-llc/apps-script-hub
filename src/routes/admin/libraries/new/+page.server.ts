import { error } from '@sveltejs/kit';
import { nanoid } from 'nanoid';
import type { Actions } from './$types.js';

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const scriptId = formData.get('scriptId')?.toString();
    const repoUrl = formData.get('repoUrl')?.toString();

    if (!scriptId || !repoUrl) {
      throw error(400, { message: '必要な情報が不足しています。' });
    }

    // バリデーション
    const githubRepoPattern = /^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+$/;
    if (!githubRepoPattern.test(repoUrl)) {
      throw error(400, {
        message:
          'GitHub リポジトリURLの形式が正しくありません。「owner/repo」の形式で入力してください。',
      });
    }

    try {
      const [owner, repo] = repoUrl.split('/');

      // GitHub API から情報を取得
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('指定されたGitHubリポジトリが見つかりません。');
        }
        throw new Error('GitHubリポジトリの情報取得に失敗しました。');
      }

      const repoData = await response.json();

      // テスト用ID生成
      const libraryId = nanoid();

      console.log('ライブラリ作成（データベース無し）:', {
        id: libraryId,
        scriptId,
        repoUrl,
        name: repoData.name,
        description: repoData.description,
        author: repoData.owner.login,
      });

      return {
        success: true,
        id: libraryId,
        message: `ライブラリ「${repoData.name}」の情報を取得しました。データベース機能は開発中です。`,
      };
    } catch (err) {
      console.error('ライブラリ作成エラー:', err);
      throw error(500, {
        message:
          err instanceof Error
            ? err.message
            : 'ライブラリの作成に失敗しました。',
      });
    }
  },
};
