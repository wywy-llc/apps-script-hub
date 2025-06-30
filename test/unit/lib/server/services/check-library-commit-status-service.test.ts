import { describe, expect, test, vi } from 'vitest';
import { CheckLibraryCommitStatusService } from '../../../../../src/lib/server/services/check-library-commit-status-service.js';

// 簡潔なDBモック
vi.mock('../../../../../src/lib/server/db/index.js', () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    }),
  },
}));

describe('CheckLibraryCommitStatusService', () => {
  const repositoryUrl = 'https://github.com/test/repo';
  const newLastCommitAt = new Date('2024-01-15T10:00:00Z');

  test('新規ライブラリの場合はisNew=true、shouldUpdate=trueを返す', async () => {
    const result = await CheckLibraryCommitStatusService.call(repositoryUrl, newLastCommitAt);

    expect(result).toEqual({
      isNew: true,
      shouldUpdate: true,
    });
  });

  test('基本的な機能が動作する', async () => {
    // 基本的な呼び出しテスト
    await expect(
      CheckLibraryCommitStatusService.call(repositoryUrl, newLastCommitAt)
    ).resolves.toBeDefined();
  });
});
