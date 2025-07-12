import { describe, test, expect } from 'vitest';
import { GASScriptIdExtractor } from '../../../../../src/lib/server/utils/gas-script-id-extractor.js';
import { LibraryTestDataFactories } from '../../../../factories/library-test-data.factory.js';

describe('GASScriptIdExtractor', () => {
  describe('extractScriptId', () => {
    test('日本語スクリプトID記述から抽出できる', () => {
      const readme = 'スクリプトID: 1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF';
      const result = GASScriptIdExtractor.extractScriptId(readme);
      expect(result).toBe('1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF');
    });

    test('英語Script ID記述から抽出できる', () => {
      const readme = 'Script ID: 1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF';
      const result = GASScriptIdExtractor.extractScriptId(readme);
      expect(result).toBe('1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF');
    });

    test('クオート付きscript id記述から抽出できる', () => {
      const readme = 'script id: "1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF"';
      const result = GASScriptIdExtractor.extractScriptId(readme);
      expect(result).toBe('1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF');
    });

    test('GoogleAppsScript macros URLから抽出できる', () => {
      const readme =
        'https://script.google.com/macros/d/1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF/edit';
      const result = GASScriptIdExtractor.extractScriptId(readme);
      expect(result).toBe('1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF');
    });

    test('script.google.comドメインの一般URLから抽出できる', () => {
      const readme =
        'https://script.google.com/u/1/home/projects/1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF/edit';
      const result = GASScriptIdExtractor.extractScriptId(readme);
      expect(result).toBe('1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF');
    });

    test('1で始まる25文字以上の文字列から抽出する（修正されたパターンで完全なIDが抽出される）', () => {
      const readme =
        'Use this script: 1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF for testing';
      const result = GASScriptIdExtractor.extractScriptId(readme);
      // 修正されたパターンでは先頭の「1」も含めて完全なIDが抽出される
      expect(result).toBe('1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF');
    });

    test('複数のスクリプトIDがある場合は最初のものを返す', () => {
      const readme = `
        スクリプトID: 1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF
        Script ID: 1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
      `;
      const result = GASScriptIdExtractor.extractScriptId(readme);
      expect(result).toBe('1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF');
    });

    test('20文字未満のIDは抽出しない', () => {
      const readme = 'スクリプトID: 1B7FSrk5Zi6L1rSx'; // 18文字
      const result = GASScriptIdExtractor.extractScriptId(readme);
      expect(result).toBeUndefined();
    });

    test('スクリプトIDが見つからない場合はundefinedを返す', () => {
      const readme = 'This is a normal README without any script ID';
      const result = GASScriptIdExtractor.extractScriptId(readme);
      expect(result).toBeUndefined();
    });

    test('テストファクトリーのデータから抽出できる', () => {
      const testData = LibraryTestDataFactories.default.build();
      const readme = `
        # ${testData.name}
        
        ${testData.description}
        
        スクリプトID: ${testData.scriptId}
      `;
      const result = GASScriptIdExtractor.extractScriptId(readme);
      expect(result).toBe(testData.scriptId);
    });

    test('カスタムパターンを使用できる', () => {
      const customPatterns = [/MY_SCRIPT_ID:\s*([A-Za-z0-9_-]{20,})/gi];
      const readme = 'MY_SCRIPT_ID: 1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF';
      const result = GASScriptIdExtractor.extractScriptId(readme, customPatterns);
      expect(result).toBe('1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF');
    });

    test('カスタムパターンでマッチしない場合はundefined', () => {
      const customPatterns = [/MY_SCRIPT_ID:\s*([A-Za-z0-9_-]{20,})/gi];
      const readme = 'スクリプトID: 1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF';
      const result = GASScriptIdExtractor.extractScriptId(readme, customPatterns);
      expect(result).toBeUndefined();
    });
  });

  describe('extractScriptIdFromConfig', () => {
    test('ScraperConfigのパターンを使用してスクリプトIDを抽出できる', () => {
      const config = {
        scriptIdPatterns: [/スクリプトID[：:\s]*([A-Za-z0-9_-]{20,})/gi],
        gasTags: ['test'],
        rateLimit: { maxRequestsPerHour: 60, delayBetweenRequests: 1000 },
        verbose: false,
      };

      const readme = 'スクリプトID: 1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF';
      const result = GASScriptIdExtractor.extractScriptIdFromConfig(readme, config);
      expect(result).toBe('1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF');
    });

    test('設定のパターンでマッチしない場合はundefined', () => {
      const config = {
        scriptIdPatterns: [/MY_CUSTOM_ID:\s*([A-Za-z0-9_-]{20,})/gi],
        gasTags: ['test'],
        rateLimit: { maxRequestsPerHour: 60, delayBetweenRequests: 1000 },
        verbose: false,
      };

      const readme = 'スクリプトID: 1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF';
      const result = GASScriptIdExtractor.extractScriptIdFromConfig(readme, config);
      expect(result).toBeUndefined();
    });
  });

  describe('DEFAULT_SCRIPT_ID_PATTERNS', () => {
    test('デフォルトパターンが正しく定義されている', () => {
      expect(GASScriptIdExtractor.DEFAULT_SCRIPT_ID_PATTERNS).toHaveLength(7);
      expect(
        GASScriptIdExtractor.DEFAULT_SCRIPT_ID_PATTERNS.every(pattern => pattern instanceof RegExp)
      ).toBe(true);
    });

    test('各デフォルトパターンが期待通りに動作する', () => {
      const testCases = [
        {
          text: 'スクリプトID: 1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF',
          shouldMatch: true,
        },
        {
          text: 'Script ID: 1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF',
          shouldMatch: true,
        },
        {
          text: 'script id: "1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF"',
          shouldMatch: true,
        },
        {
          text: 'https://script.google.com/macros/d/1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF/edit',
          shouldMatch: true,
        },
        {
          text: 'script.google.com/u/1/home/projects/1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF/edit',
          shouldMatch: true,
        },
        {
          text: 'ID: 1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF',
          shouldMatch: true, // 改善されたパターンでは1で始まる文字列も抽出される
        },
      ];

      testCases.forEach(({ text, shouldMatch }) => {
        const result = GASScriptIdExtractor.extractScriptId(text);
        if (shouldMatch) {
          // 修正されたパターンでは常に完全なスクリプトIDが返される
          expect(result).toBe('1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF');
        } else {
          expect(result).toBeUndefined();
        }
      });
    });
  });
});
