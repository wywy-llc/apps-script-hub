import { describe, expect, it } from 'vitest';
import { containsExpectedId, extractAllMatches } from './scraper-pattern-test-helper.js';

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

    // 期待されるライブラリIDが抽出されているかを確認
    const expectedLibraryId = '1dolXnIeXKz-BH1BlwRDaKhzC2smJcGyVxMxGYhaY2kqiLa857odLXrIC';
    const hasExpectedId = containsExpectedId(geminiWithFilesReadme, expectedLibraryId);

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
        name: "The library's project key is as follows.の後のID",
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

    testCases.forEach(({ content, expectedId }) => {
      const extractedIds = extractAllMatches(content);

      // 期待されるIDが正しく抽出されることを検証
      expect(extractedIds).toContain(expectedId);
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

    falsePositiveCases.forEach(({ content, shouldNotMatch }) => {
      if (shouldNotMatch) {
        const foundMatches = extractAllMatches(content);

        // 誤検知が発生しないことを検証
        expect(foundMatches.length).toBe(0);
      }
    });
  });
});
