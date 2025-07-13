import { describe, expect, test } from 'vitest';
import {
  DEFAULT_SCRIPT_ID_PATTERNS,
  SCRIPT_ID_EXCLUSION_PATTERNS,
} from '../../../../src/lib/constants/scraper-config.js';
import { GASScriptIdExtractor } from '../../../../src/lib/server/utils/gas-script-id-extractor.js';

describe('ScriptSync README スクリプトID抽出バグの再現', () => {
  const scriptSyncReadme = `# ScriptSync

<a name="top"></a>
[![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)

<a name="overview"></a>

# Overview

**This library helps maintain the relevance of a script on the user's end.**

<a name="description"></a>

# Description

ScriptSync is a library designed to make it easier for developers to quickly deploy scripts on the user side. It allows to update script files without requiring any direct involvement from the user.

# Library's project key

\`\`\`
1nUiajCHQReVwWPq7rNAvsIcWvPptmMUSzeytnzVHDpdoxUIvuX0e_reL
\`\`\`

<a name="Howtoinstall"></a>

# How to install

In order to use this library, please install this library.

1. [Install library](https://developers.google.com/apps-script/guides/libraries).
   - Library's project key is **\`1nUiajCHQReVwWPq7rNAvsIcWvPptmMUSzeytnzVHDpdoxUIvuX0e_reL\`**.
1. Copy the dependencies of the Apps Script ([appsscript.json](#appsscript)).`;

  const expectedScriptId = '1nUiajCHQReVwWPq7rNAvsIcWvPptmMUSzeytnzVHDpdoxUIvuX0e_reL';

  test('ScriptSyncのREADMEでスクリプトIDが抽出できるかテスト', () => {
    console.log('ScriptSync README内容をテスト中...');
    console.log(`期待されるスクリプトID: ${expectedScriptId} (文字数: ${expectedScriptId.length})`);

    const foundScriptIds: string[] = [];

    // 各パターンを個別にテスト
    DEFAULT_SCRIPT_ID_PATTERNS.forEach((pattern, index) => {
      const matches = [...scriptSyncReadme.matchAll(pattern)];

      if (matches.length > 0) {
        console.log(`パターン ${index + 1} で検出:`);
        matches.forEach(match => {
          const extractedId = match[1] || match[0];
          console.log(`  - ${extractedId}`);
          if (extractedId === expectedScriptId) {
            foundScriptIds.push(extractedId);
            console.log(`  ✅ 期待されるスクリプトIDを検出!`);
          }
        });
      }
    });

    console.log(`\\n検出されたスクリプトID数: ${foundScriptIds.length}`);
    console.log('検出されたスクリプトID:', foundScriptIds);

    // 期待されるスクリプトIDが検出されるかをテスト
    expect(foundScriptIds).toContain(expectedScriptId);
  });

  test('個別パターンテスト: ライブラリキー明示記載パターン', () => {
    const pattern =
      /(?:library["']?s?\s*project\s*key|project\s*key|ライブラリ.*?プロジェクト.*?キー|ライブラリ.*?キー)[^:]*[:：]?\s*(?:is\s*)?(?:as\s*follows[.。]?)?\s*```?\s*(1[A-Za-z0-9_-]{24,69})\s*```?/gi;

    const testText = `# Library's project key

\`\`\`
1nUiajCHQReVwWPq7rNAvsIcWvPptmMUSzeytnzVHDpdoxUIvuX0e_reL
\`\`\``;

    const matches = [...testText.matchAll(pattern)];
    console.log('ライブラリキーパターンのマッチ結果:', matches);

    expect(matches.length).toBeGreaterThan(0);
    if (matches.length > 0) {
      expect(matches[0][1]).toBe(expectedScriptId);
    }
  });

  test('個別パターンテスト: コードブロック内パターン', () => {
    const pattern = /```[^`]*?(1[A-Za-z0-9_-]{24,69})[^`]*?```/gs;

    const testText = `\`\`\`
1nUiajCHQReVwWPq7rNAvsIcWvPptmMUSzeytnzVHDpdoxUIvuX0e_reL
\`\`\``;

    const matches = [...testText.matchAll(pattern)];
    console.log('コードブロックパターンのマッチ結果:', matches);

    expect(matches.length).toBeGreaterThan(0);
    if (matches.length > 0) {
      expect(matches[0][1]).toBe(expectedScriptId);
    }
  });

  test('文字数制限の確認: 57文字のスクリプトIDは範囲内か', () => {
    const scriptId = '1nUiajCHQReVwWPq7rNAvsIcWvPptmMUSzeytnzVHDpdoxUIvuX0e_reL';
    console.log(`スクリプトIDの文字数: ${scriptId.length}`);
    console.log('文字数制限: 24-69文字');

    expect(scriptId.length).toBeGreaterThanOrEqual(24);
    expect(scriptId.length).toBeLessThanOrEqual(69);
    expect(scriptId.startsWith('1')).toBe(true);
  });

  test('実際のGasScriptIdExtractorでスクリプトIDが抽出できるかテスト', () => {
    console.log('GasScriptIdExtractorを使用してスクリプトIDを抽出中...');

    const extractedId = GASScriptIdExtractor.extractScriptId(
      scriptSyncReadme,
      DEFAULT_SCRIPT_ID_PATTERNS
    );
    console.log(`抽出されたスクリプトID: ${extractedId}`);
    console.log(`期待されるスクリプトID: ${expectedScriptId}`);

    expect(extractedId).toBe(expectedScriptId);
  });

  test('問題が発生する可能性のあるケースをテスト', () => {
    // より複雑なREADME内容でテスト
    const complexReadme = `# ScriptSync

This is a complex README with various elements.

## Installation

Install this library with the following steps:

1. Go to Libraries
2. Add the library ID: \`1nUiajCHQReVwWPq7rNAvsIcWvPptmMUSzeytnzVHDpdoxUIvuX0e_reL\`
3. Save

## Code Examples

Here are some examples:

\`\`\`javascript
function test() {
  console.log('test');
}
\`\`\`

### Library Configuration

The library ID is: **\`1nUiajCHQReVwWPq7rNAvsIcWvPptmMUSzeytnzVHDpdoxUIvuX0e_reL\`**

\`\`\`json
{
  "libraries": [
    {
      "userSymbol": "ScriptSync",
      "libraryId": "1nUiajCHQReVwWPq7rNAvsIcWvPptmMUSzeytnzVHDpdoxUIvuX0e_reL",
      "version": "6"
    }
  ]
}
\`\`\``;

    console.log('複雑なREADMEでGasScriptIdExtractorを使用してスクリプトIDを抽出中...');

    const extractedId = GASScriptIdExtractor.extractScriptId(
      complexReadme,
      DEFAULT_SCRIPT_ID_PATTERNS
    );
    console.log(`抽出されたスクリプトID: ${extractedId}`);
    console.log(`期待されるスクリプトID: ${expectedScriptId}`);

    expect(extractedId).toBe(expectedScriptId);
  });

  test('除外パターンのデバッグ: 各除外パターンの動作確認', () => {
    const complexReadme = `# ScriptSync

This is a complex README with various elements.

## Installation

Install this library with the following steps:

1. Go to Libraries
2. Add the library ID: \`1nUiajCHQReVwWPq7rNAvsIcWvPptmMUSzeytnzVHDpdoxUIvuX0e_reL\`
3. Save

## Code Examples

Here are some examples:

\`\`\`javascript
function test() {
  console.log('test');
}
\`\`\`

### Library Configuration

The library ID is: **\`1nUiajCHQReVwWPq7rNAvsIcWvPptmMUSzeytnzVHDpdoxUIvuX0e_reL\`**

\`\`\`json
{
  "libraries": [
    {
      "userSymbol": "ScriptSync",
      "libraryId": "1nUiajCHQReVwWPq7rNAvsIcWvPptmMUSzeytnzVHDpdoxUIvuX0e_reL",
      "version": "6"
    }
  ]
}
\`\`\``;

    console.log('\\n=== 除外パターンのデバッグ ===');

    // 各除外パターンをテスト
    SCRIPT_ID_EXCLUSION_PATTERNS.forEach((pattern, index) => {
      console.log(`\\n除外パターン ${index + 1}: ${pattern.source}`);
      const matches = [...complexReadme.matchAll(new RegExp(pattern.source, pattern.flags))];

      if (matches.length > 0) {
        console.log(`  マッチ数: ${matches.length}`);
        matches.forEach((match, matchIndex) => {
          console.log(`  マッチ ${matchIndex + 1}: "${match[0]}"`);
          if (match[0].includes(expectedScriptId)) {
            console.log(`  ⚠️ このマッチが対象スクリプトIDを除外している可能性があります`);
          }
        });
      } else {
        console.log(`  マッチなし`);
      }
    });

    // パターンの個別確認用（失敗を許可）
    expect(true).toBe(true);
  });
});
