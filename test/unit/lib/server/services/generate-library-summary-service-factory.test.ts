import { describe, expect, test } from 'vitest';
import { LibrarySummaryTestDataFactories } from '../../../../factories/index.js';

describe('LibrarySummaryTestDataFactories', () => {
  test('デフォルトのライブラリ要約データを生成できる', () => {
    const summary = LibrarySummaryTestDataFactories.default.build();

    expect(summary).toMatchObject({
      basicInfo: {
        libraryName: {
          ja: expect.any(String),
          en: expect.any(String),
        },
        purpose: {
          ja: expect.any(String),
          en: expect.any(String),
        },
        targetUsers: {
          ja: expect.any(String),
          en: expect.any(String),
        },
        tags: {
          ja: expect.any(Array),
          en: expect.any(Array),
        },
      },
      functionality: {
        coreProblem: {
          ja: expect.any(String),
          en: expect.any(String),
        },
        mainBenefits: expect.arrayContaining([
          expect.objectContaining({
            title: {
              ja: expect.any(String),
              en: expect.any(String),
            },
            description: {
              ja: expect.any(String),
              en: expect.any(String),
            },
          }),
        ]),
      },
    });
  });

  test('OAuth認証ライブラリのテストデータを生成できる', () => {
    const summary = LibrarySummaryTestDataFactories.oauth.build();

    expect(summary.basicInfo.libraryName.ja).toBe('OAuth2認証ライブラリ');
    expect(summary.basicInfo.libraryName.en).toBe('OAuth2 Authentication Library');
    expect(summary.basicInfo.tags.ja).toContain('OAuth2');
    expect(summary.basicInfo.tags.en).toContain('OAuth2');
  });

  test('ユーティリティライブラリのテストデータを生成できる', () => {
    const summary = LibrarySummaryTestDataFactories.utility.build();

    expect(summary.basicInfo.libraryName.ja).toBe('GASユーティリティライブラリ');
    expect(summary.basicInfo.libraryName.en).toBe('GAS Utility Library');
    expect(summary.basicInfo.tags.ja).toContain('ユーティリティ');
    expect(summary.basicInfo.tags.en).toContain('utility');
  });

  test('カスタムデータでオーバーライドできる', () => {
    const customSummary = LibrarySummaryTestDataFactories.default.build({
      basicInfo: {
        libraryName: {
          ja: 'カスタムライブラリ',
          en: 'Custom Library',
        },
        purpose: {
          ja: 'カスタム用途',
          en: 'Custom purpose',
        },
        targetUsers: {
          ja: 'カスタムユーザー',
          en: 'Custom users',
        },
        tags: {
          ja: ['カスタム'],
          en: ['custom'],
        },
      },
    });

    expect(customSummary.basicInfo.libraryName.ja).toBe('カスタムライブラリ');
    expect(customSummary.basicInfo.libraryName.en).toBe('Custom Library');
    expect(customSummary.basicInfo.tags.ja).toEqual(['カスタム']);
    expect(customSummary.basicInfo.tags.en).toEqual(['custom']);

    // オーバーライドしていない部分はデフォルト値を保持
    expect(customSummary.functionality.coreProblem.ja).toBe(
      'E2Eテストでの実際のAPI呼び出しによるコスト発生'
    );
  });

  test('全てのプリセットが正しい構造を持つ', () => {
    const presets = ['default', 'oauth', 'utility'] as const;

    for (const preset of presets) {
      const summary = LibrarySummaryTestDataFactories[preset].build();

      // 基本構造の検証
      expect(summary).toHaveProperty('basicInfo');
      expect(summary).toHaveProperty('functionality');
      expect(summary.basicInfo).toHaveProperty('libraryName');
      expect(summary.basicInfo).toHaveProperty('purpose');
      expect(summary.basicInfo).toHaveProperty('targetUsers');
      expect(summary.basicInfo).toHaveProperty('tags');
      expect(summary.functionality).toHaveProperty('coreProblem');
      expect(summary.functionality).toHaveProperty('mainBenefits');

      // 多言語対応の検証
      expect(summary.basicInfo.libraryName).toHaveProperty('ja');
      expect(summary.basicInfo.libraryName).toHaveProperty('en');
      expect(summary.basicInfo.purpose).toHaveProperty('ja');
      expect(summary.basicInfo.purpose).toHaveProperty('en');
      expect(summary.basicInfo.targetUsers).toHaveProperty('ja');
      expect(summary.basicInfo.targetUsers).toHaveProperty('en');
      expect(summary.basicInfo.tags).toHaveProperty('ja');
      expect(summary.basicInfo.tags).toHaveProperty('en');
      expect(summary.functionality.coreProblem).toHaveProperty('ja');
      expect(summary.functionality.coreProblem).toHaveProperty('en');

      // mainBenefitsの構造検証
      expect(Array.isArray(summary.functionality.mainBenefits)).toBe(true);
      expect(summary.functionality.mainBenefits.length).toBeGreaterThan(0);

      for (const benefit of summary.functionality.mainBenefits) {
        expect(benefit).toHaveProperty('title');
        expect(benefit).toHaveProperty('description');
        expect(benefit.title).toHaveProperty('ja');
        expect(benefit.title).toHaveProperty('en');
        expect(benefit.description).toHaveProperty('ja');
        expect(benefit.description).toHaveProperty('en');
      }
    }
  });
});
