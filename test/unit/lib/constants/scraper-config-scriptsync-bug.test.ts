import { describe, expect, test } from 'vitest';
import {
  DEFAULT_SCRIPT_ID_PATTERNS,
  SCRIPT_ID_EXCLUSION_PATTERNS,
} from '../../../../src/lib/constants/scraper-config.js';
import { GASScriptIdExtractor } from '../../../../src/lib/server/utils/gas-script-id-extractor.js';

describe('スクリプトID抽出バグの再現テスト', () => {
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

<a name="how-to-install"></a>

# How to install

In order to use this library, please install this library.

1. [Install library](https://developers.google.com/apps-script/guides/libraries).
   - Library's project key is **\`1nUiajCHQReVwWPq7rNAvsIcWvPptmMUSzeytnzVHDpdoxUIvuX0e_reL\`**.
1. Copy the dependencies of the Apps Script ([appsscript.json](#appsscript)).`;

  const expectedScriptId = '1nUiajCHQReVwWPq7rNAvsIcWvPptmMUSzeytnzVHDpdoxUIvuX0e_reL';

  test('ScriptSyncのREADMEでスクリプトIDが抽出できるかテスト', () => {
    const foundScriptIds: string[] = [];

    // 各パターンを個別にテスト
    DEFAULT_SCRIPT_ID_PATTERNS.forEach(pattern => {
      const matches = [...scriptSyncReadme.matchAll(pattern)];

      if (matches.length > 0) {
        matches.forEach(match => {
          const extractedId = match[1] || match[0];

          if (extractedId === expectedScriptId) {
            foundScriptIds.push(extractedId);
          }
        });
      }
    });

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

    expect(matches.length).toBeGreaterThan(0);
    if (matches.length > 0) {
      expect(matches[0][1]).toBe(expectedScriptId);
    }
  });

  test('文字数制限の確認: 57文字のスクリプトIDは範囲内か', () => {
    const scriptId = '1nUiajCHQReVwWPq7rNAvsIcWvPptmMUSzeytnzVHDpdoxUIvuX0e_reL';

    expect(scriptId.length).toBeGreaterThanOrEqual(24);
    expect(scriptId.length).toBeLessThanOrEqual(69);
    expect(scriptId.startsWith('1')).toBe(true);
  });

  test('実際のGasScriptIdExtractorでスクリプトIDが抽出できるかテスト', () => {
    const extractedId = GASScriptIdExtractor.extractScriptId(
      scriptSyncReadme,
      DEFAULT_SCRIPT_ID_PATTERNS
    );

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

    const extractedId = GASScriptIdExtractor.extractScriptId(
      complexReadme,
      DEFAULT_SCRIPT_ID_PATTERNS
    );

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

    // 各除外パターンをテスト（デバッグ用）
    const excludingPatterns = SCRIPT_ID_EXCLUSION_PATTERNS.filter(pattern => {
      const matches = [...complexReadme.matchAll(new RegExp(pattern.source, pattern.flags))];
      return matches.some(match => match[0].includes(expectedScriptId));
    });

    // 除外パターンによってスクリプトIDが除外されていないことを確認
    expect(excludingPatterns.length).toBe(0);
  });

  // aws-sdk-google-appsライブラリのバグ再現テスト
  test('aws-sdk-google-apps READMEでのスクリプトID抽出バグ再現', () => {
    const awsSdkReadme = `# aws-sdk-google-apps

[![mit license](https://badgen.net/badge/license/MIT/red)](https://github.com/dxdc/aws-sdk-google-apps/blob/master/LICENSE)
[![Donate](https://badgen.net/badge/Donate/PayPal/91BE09)](https://paypal.me/ddcaspi)

Native support for the entire AWS SDK for JavaScript in Google Apps Script.

Working examples for Simple Email Service (SES), S3, Lambda, and EC2. This project can easily accommodate _all_ other AWS services, e.g.,

\`\`\`
npm run sdk --sdk=ses,s3,ec2,lambda,dynamodb && npm run build
\`\`\`

## Library deployment

1. Add the existing Google Apps Script project [as a Library](https://developers.google.com/apps-script/guides/libraries#add_a_library_to_your_script_project)

- Script ID \`1J6iN9mJE-NK6LGTlZcngsflJEx59tE3ZOW4-2cdHbgw0So2MmEcRZxKG\`
- Choose an identifier, e.g., \`AWSLIB\`
- Versions of the Google Apps Script project map to tags on this Git repository

2. Initialize your AWS config settings and implement one of this library's [S3](dist/S3.js), [Lambda](dist/Lambda.js), [SES](dist/Ses.js), or [EC2](dist/EC2.js) functions. [Examples.js](dist/Examples.js) shows some working examples.

\`\`\`js
const AWS_CONFIG = {
  accessKey: 'AK0ZXZD0KGNG4KG6REBP', // use your own AWS key
  secretKey: 'EXrPgHC41HEW2YownLUnJLgh6bMsrmW1uva1ic24', // use your own AWS key
  region: 'us-east-1',
};

// example function to retrieve S3 object
async function getS3ObjectTest() {
  AWSLIB.initConfig(AWS_CONFIG);
  var result = await AWSLIB.getS3Object('myBucket', 'folder1/file.jpg');
  if (result === false) {
    return false;
  }

  var blob = Utilities.newBlob(result.Body, result.ContentType);
  // Logger.log(blob.getDataAsString());
  return blob;
}
\`\`\``;

    const expectedScriptId = '1J6iN9mJE-NK6LGTlZcngsflJEx59tE3ZOW4-2cdHbgw0So2MmEcRZxKG';
    const incorrectlyExtractedString = '1HEW2YownLUnJLgh6bMsrmW1uva1ic24';

    // 現在の抽出結果をテスト
    const extractedId = GASScriptIdExtractor.extractScriptId(
      awsSdkReadme,
      DEFAULT_SCRIPT_ID_PATTERNS
    );

    console.log('抽出されたスクリプトID:', extractedId);
    console.log('期待されるスクリプトID:', expectedScriptId);
    console.log('誤って抽出される可能性のある文字列:', incorrectlyExtractedString);

    // バグが発生している場合、期待されるスクリプトIDが抽出されない
    expect(extractedId).toBe(expectedScriptId);
  });

  test('aws-sdk-google-apps: 各パターンの動作確認', () => {
    const awsSdkReadme = `# aws-sdk-google-apps

- Script ID \`1J6iN9mJE-NK6LGTlZcngsflJEx59tE3ZOW4-2cdHbgw0So2MmEcRZxKG\`

\`\`\`js
const AWS_CONFIG = {
  secretKey: 'EXrPgHC41HEW2YownLUnJLgh6bMsrmW1uva1ic24', // use your own AWS key
};
\`\`\``;

    const expectedScriptId = '1J6iN9mJE-NK6LGTlZcngsflJEx59tE3ZOW4-2cdHbgw0So2MmEcRZxKG';
    const incorrectlyExtractedString = '1HEW2YownLUnJLgh6bMsrmW1uva1ic24';

    // 除外パターンのテスト
    console.log('除外パターンのテスト:');
    SCRIPT_ID_EXCLUSION_PATTERNS.forEach((pattern, index) => {
      const matches = [...awsSdkReadme.matchAll(pattern)];
      if (matches.length > 0) {
        console.log(`除外パターン ${index + 1}: ${pattern}`);
        matches.forEach(match => {
          console.log(
            `  マッチ: "${match[0]}" - 誤った文字列を含む: ${match[0].includes(incorrectlyExtractedString)}`
          );
        });
      }
    });

    // 各パターンを個別にテスト
    const foundMatches: { pattern: RegExp; matches: string[] }[] = [];

    DEFAULT_SCRIPT_ID_PATTERNS.forEach((pattern, index) => {
      const matches = [...awsSdkReadme.matchAll(pattern)];

      if (matches.length > 0) {
        const extractedIds = matches.map(match => match[1] || match[0]);
        foundMatches.push({
          pattern,
          matches: extractedIds,
        });

        console.log(`パターン ${index + 1}: ${pattern}`);
        console.log('マッチした内容:', extractedIds);
      }
    });

    // 正しいスクリプトIDがマッチしているかを確認
    const correctMatches = foundMatches.filter(fm => fm.matches.includes(expectedScriptId));

    // 誤った文字列がマッチしているかを確認
    const incorrectMatches = foundMatches.filter(fm =>
      fm.matches.includes(incorrectlyExtractedString)
    );

    console.log('正しいスクリプトIDをマッチしたパターン数:', correctMatches.length);
    console.log('誤った文字列をマッチしたパターン数:', incorrectMatches.length);

    // 正しいスクリプトIDが少なくとも1つのパターンでマッチすることを期待
    expect(correctMatches.length).toBeGreaterThan(0);

    // 誤った文字列がマッチしないことを期待
    expect(incorrectMatches.length).toBe(0);
  });
});
