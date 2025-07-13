import { describe, expect, it } from 'vitest';
import { DEFAULT_SCRIPT_ID_PATTERNS } from '../../../../src/lib/constants/scraper-config.js';

describe('GeminiWithFiles ライブラリID抽出テスト', () => {
  it('GeminiWithFilesのREADMEからライブラリIDが正しく抽出される', () => {
    // 実際のGeminiWithFilesのREADME内容（ライブラリIDの記載部分）
    const geminiWithFilesReadme = `# GeminiWithFiles

A Google Apps Script library for Gemini API with files.

## Usage

In order to test this script, please do the following steps.

### 2. Use GeminiWithFiles as a Google Apps Script library

If you use this library as a Google Apps Script library, please install the library to your Google Apps Script project as follows.

1. Create a Google Apps Script project. Or, open your Google Apps Script project.

   - You can use this library for the Google Apps Script project of both the standalone and container-bound script types.

2. [Install this library](https://developers.google.com/apps-script/guides/libraries).

   - The library's project key is as follows.

\`\`\`
1dolXnIeXKz-BH1BlwRDaKhzC2smJcGyVxMxGYhaY2kqiLa857odLXrIC
\`\`\`

### 3. Use GeminiWithFiles in your own Google Apps Script project

If you use this library in your own Google Apps Script project, please copy and paste the script.`;

    console.log('GeminiWithFilesのREADME内容をテスト中...');
    console.log(
      '期待されるライブラリID: 1dolXnIeXKz-BH1BlwRDaKhzC2smJcGyVxMxGYhaY2kqiLa857odLXrIC'
    );

    // 各スクリプトIDパターンをテストして、どれがマッチするかを確認
    const foundMatches: Array<{ patternIndex: number; pattern: RegExp; matches: string[] }> = [];

    DEFAULT_SCRIPT_ID_PATTERNS.forEach((pattern, index) => {
      // 正規表現を実行前にリセット
      pattern.lastIndex = 0;

      const matches: string[] = [];
      let match;

      while ((match = pattern.exec(geminiWithFilesReadme)) !== null) {
        // グループ1がある場合はそれを、ない場合は全体マッチを取得
        const matchedString = match[1] || match[0];
        matches.push(matchedString);

        // 無限ループ防止
        if (!pattern.global) break;
      }

      if (matches.length > 0) {
        foundMatches.push({
          patternIndex: index,
          pattern,
          matches,
        });
      }
    });

    console.log('マッチしたスクリプトIDパターン:');
    foundMatches.forEach(({ patternIndex, pattern, matches }) => {
      console.log(`パターン ${patternIndex}: ${pattern}`);
      console.log(`マッチした文字列: ${matches.join(', ')}`);
    });

    // 期待されるライブラリIDが抽出されているかを確認
    const expectedLibraryId = '1dolXnIeXKz-BH1BlwRDaKhzC2smJcGyVxMxGYhaY2kqiLa857odLXrIC';
    const extractedIds = foundMatches.flatMap(f => f.matches);
    const hasExpectedId = extractedIds.includes(expectedLibraryId);

    console.log('抽出されたID:', extractedIds);
    console.log('期待されるIDが含まれているか:', hasExpectedId);

    if (hasExpectedId) {
      console.log('✅ ライブラリIDが正しく抽出されている');
    } else {
      console.log('🐛 ライブラリIDが抽出されていない');
    }
    
    // 期待されるIDが必ず抽出されることを検証
    expect(hasExpectedId).toBe(true);
  });

  it('ライブラリID記載パターンの個別テスト', () => {
    // 様々なライブラリID記載パターンをテスト
    const testCases = [
      {
        name: 'コードブロック内のライブラリID',
        content: `\`\`\`
1dolXnIeXKz-BH1BlwRDaKhzC2smJcGyVxMxGYhaY2kqiLa857odLXrIC
\`\`\``,
        expectedId: '1dolXnIeXKz-BH1BlwRDaKhzC2smJcGyVxMxGYhaY2kqiLa857odLXrIC',
      },
      {
        name: "「The library's project key is as follows.」の後のID",
        content: `The library's project key is as follows.

1dolXnIeXKz-BH1BlwRDaKhzC2smJcGyVxMxGYhaY2kqiLa857odLXrIC`,
        expectedId: '1dolXnIeXKz-BH1BlwRDaKhzC2smJcGyVxMxGYhaY2kqiLa857odLXrIC',
      },
      {
        name: 'ライブラリインストール手順内のID',
        content: `2. Install this library

   - The library's project key is as follows.

\`\`\`
1dolXnIeXKz-BH1BlwRDaKhzC2smJcGyVxMxGYhaY2kqiLa857odLXrIC
\`\`\``,
        expectedId: '1dolXnIeXKz-BH1BlwRDaKhzC2smJcGyVxMxGYhaY2kqiLa857odLXrIC',
      },
      {
        name: 'スクリプトIDラベル付き',
        content: `スクリプトID: 1dolXnIeXKz-BH1BlwRDaKhzC2smJcGyVxMxGYhaY2kqiLa857odLXrIC`,
        expectedId: '1dolXnIeXKz-BH1BlwRDaKhzC2smJcGyVxMxGYhaY2kqiLa857odLXrIC',
      },
      {
        name: 'Library IDラベル付き',
        content: `Library ID: 1dolXnIeXKz-BH1BlwRDaKhzC2smJcGyVxMxGYhaY2kqiLa857odLXrIC`,
        expectedId: '1dolXnIeXKz-BH1BlwRDaKhzC2smJcGyVxMxGYhaY2kqiLa857odLXrIC',
      },
      {
        name: 'クォート内のID',
        content: `"1dolXnIeXKz-BH1BlwRDaKhzC2smJcGyVxMxGYhaY2kqiLa857odLXrIC"`,
        expectedId: '1dolXnIeXKz-BH1BlwRDaKhzC2smJcGyVxMxGYhaY2kqiLa857odLXrIC',
      },
    ];

    testCases.forEach(({ name, content, expectedId }) => {
      const foundMatches: Array<{ patternIndex: number; matches: string[] }> = [];

      DEFAULT_SCRIPT_ID_PATTERNS.forEach((pattern, patternIndex) => {
        pattern.lastIndex = 0;
        const matches: string[] = [];
        let match;

        while ((match = pattern.exec(content)) !== null) {
          const matchedString = match[1] || match[0];
          matches.push(matchedString);

          if (!pattern.global) break;
        }

        if (matches.length > 0) {
          foundMatches.push({ patternIndex, matches });
        }
      });

      const extractedIds = foundMatches.flatMap(f => f.matches);
      const hasExpectedId = extractedIds.includes(expectedId);

      if (hasExpectedId) {
        console.log(`✅ ${name}: 正しく抽出`);
      } else {
        console.log(`🐛 ${name}: 抽出失敗`);
        console.log(`  期待ID: ${expectedId}`);
        console.log(`  抽出ID: ${extractedIds.join(', ')}`);
        foundMatches.forEach(({ patternIndex, matches }) => {
          console.log(`  パターン ${patternIndex}: ${matches.join(', ')}`);
        });
      }

      // 期待されるIDが正しく抽出されることを検証
      expect(foundMatches.flatMap(f => f.matches)).toContain(expectedId);
    });
  });

  it('誤検知の回避テスト', () => {
    // ライブラリIDではない文字列が誤検知されないことを確認
    const falsePositiveCases = [
      {
        name: 'GitHub URL内のコミットハッシュ',
        content: 'https://github.com/user/repo/commit/1a2b3c4d5e6f7890abcdef1234567890abcdef12',
        shouldNotMatch: true,
      },
      {
        name: 'UUID形式',
        content: '1a2b3c4d-5e6f-7890-abcd-ef1234567890',
        shouldNotMatch: true,
      },
      {
        name: 'JSONのemail_id',
        content: '"email_id": "1a2b3c4d5e6f7890abcdef1234567890"',
        shouldNotMatch: true,
      },
      {
        name: '画像ファイルURL',
        content: 'https://example.com/image_1a2b3c4d5e6f7890abcdef1234567890.png',
        shouldNotMatch: true,
      },
    ];

    falsePositiveCases.forEach(({ name, content, shouldNotMatch }) => {
      const foundMatches: string[] = [];

      DEFAULT_SCRIPT_ID_PATTERNS.forEach(pattern => {
        pattern.lastIndex = 0;
        let match;

        while ((match = pattern.exec(content)) !== null) {
          const matchedString = match[1] || match[0];
          foundMatches.push(matchedString);

          if (!pattern.global) break;
        }
      });

      if (shouldNotMatch) {
        if (foundMatches.length === 0) {
          console.log(`✅ ${name}: 正しく誤検知を回避`);
        } else {
          console.log(`🐛 ${name}: 誤検知が発生`);
          console.log(`  誤検知されたID: ${foundMatches.join(', ')}`);
        }
        
        // 誤検知が発生しないことを検証
        expect(foundMatches.length).toBe(0);
      }
    });
  });
});
