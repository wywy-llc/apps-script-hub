import { describe, expect, test, vi } from 'vitest';
import { SaveLibrarySummaryService } from '../../../../../src/lib/server/services/save-library-summary-service.js';
import type { LibrarySummary } from '../../../../../src/lib/types/library-summary.js';

// 簡潔なモック
vi.mock('../../../../../src/lib/server/db/index.js', () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    }),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    }),
  },
}));

vi.mock('../../../../../src/lib/server/utils/generate-id.js', () => ({
  generateId: vi.fn(() => 'generated_id_123'),
}));

describe('SaveLibrarySummaryService', () => {
  const mockLibraryId = 'library_123';
  const mockSummary: LibrarySummary = {
    basicInfo: {
      libraryName: { ja: 'テストライブラリ', en: 'Test Library' },
      purpose: { ja: 'テスト用ライブラリ', en: 'Library for testing' },
      targetUsers: { ja: 'テスト開発者', en: 'Test developers' },
      tags: { ja: ['テスト'], en: ['test'] },
    },
    functionality: {
      coreProblem: { ja: 'テストの複雑さ', en: 'Testing complexity' },
      mainBenefits: [
        {
          title: { ja: 'シンプルなAPI', en: 'Simple API' },
          description: { ja: 'テストが簡単', en: 'Easy testing' },
        },
      ],
      usageExample: {
        ja: '// テストライブラリの使用例\nconst testLib = new TestLibrary();\ntestLib.runTest();',
        en: '// Test Library Usage Example\nconst testLib = new TestLibrary();\ntestLib.runTest();',
      },
    },
  };

  test('ライブラリ要約を保存できる', async () => {
    await expect(
      SaveLibrarySummaryService.call(mockLibraryId, mockSummary)
    ).resolves.toBeUndefined();
  });
});
