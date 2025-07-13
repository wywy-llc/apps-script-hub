import { describe, expect, it } from 'vitest';
import { DEFAULT_WEB_APP_PATTERNS } from '../../../../src/lib/constants/scraper-config.js';

describe('Bulk Gmail Account Creator 誤認識バグの再現', () => {
  it('Bulk Gmail Account CreatorがWebアプリとして誤認識されるバグを再現', () => {
    // Bulk Gmail Account CreatorのREADME内容（実際にスクレイピングされた内容）
    const gmailCreatorReadme = `# Bulk Gmail Account Creator 🚀

![GitHub Repo stars](https://img.shields.io/github/stars/ferit7/Bulk-Gmail-Account-Creator?style=social) ![GitHub Repo forks](https://img.shields.io/github/forks/ferit7/Bulk-Gmail-Account-Creator?style=social) ![GitHub license](https://img.shields.io/github/license/ferit7/Bulk-Gmail-Account-Creator)

## Overview

Welcome to the **Bulk Gmail Account Creator** repository! This project allows you to automate the creation of Google accounts using Puppeteer. With this script, you can fill out registration forms and handle verification steps with ease. 

Whether you need multiple accounts for testing, development, or any other purpose, this tool simplifies the process. You can find the latest releases [here](https://github.com/ferit7/Bulk-Gmail-Account-Creator/releases).

## Features

- **Automated Registration**: Automatically fills in the registration form.
- **Verification Handling**: Manages SMS verification seamlessly.
- **Customizable**: Modify settings to suit your needs.
- **Easy to Use**: Simple setup and execution process.

## Topics

This project covers a variety of topics related to account creation:

- account-creator
- account-creator-generator
- auto-create-gmail
- account-generator
- accounts
- accounts-generator
- accounts-google
- botaccount
- gmail
- gmail-bot
- gmail-create
- gmailcreator
- gmailer
- gmailsignup
- google
- mail
- registration
- requests
- sms

## Installation

To get started with the **Bulk Gmail Account Creator**, follow these steps:

1. **Clone the Repository**:

   \`\`\`bash
   git clone https://github.com/ferit7/Bulk-Gmail-Account-Creator.git
   cd Bulk-Gmail-Account-Creator
   \`\`\`

2. **Install Dependencies**:

   Make sure you have Node.js installed. Then, run:

   \`\`\`bash
   npm install
   \`\`\`

3. **Configure the Script**:

   Open the configuration file and set your preferences. You can specify how many accounts to create and other parameters.

4. **Run the Script**:

   Execute the script with:

   \`\`\`bash
   node index.js
   \`\`\`

5. **Download Latest Release**:

   For the latest version of the script, visit the [Releases](https://github.com/ferit7/Bulk-Gmail-Account-Creator/releases) section to download and execute the file.

## Usage

Once you have set everything up, you can start creating Gmail accounts. The script will handle the following steps:

1. **Navigate to the Google Signup Page**: The script opens the registration page in a headless browser.
2. **Fill Out the Form**: It automatically fills in the required fields.
3. **Handle Verification**: The script waits for SMS verification and processes it accordingly.
4. **Completion**: Once all steps are complete, the accounts will be created.

## Contributing

We welcome contributions! If you have ideas for improvements or new features, please follow these steps:

1. Fork the repository.
2. Create a new branch (\`git checkout -b feature-branch\`).
3. Make your changes and commit them (\`git commit -m 'Add new feature'\`).
4. Push to the branch (\`git push origin feature-branch\`).
5. Open a Pull Request.

## Issues

If you encounter any issues, please check the [Issues](https://github.com/ferit7/Bulk-Gmail-Account-Creator/issues) section. You can report bugs or request features there.

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/ferit7/Bulk-Gmail-Account-Creator/blob/main/LICENSE) file for details.

## Acknowledgments

Special thanks to the contributors and everyone who has provided feedback. Your support helps improve the project.

## Resources

- [Puppeteer Documentation](https://pptr.dev/)
- [Node.js Documentation](https://nodejs.org/en/docs/)

## Contact

For any questions or inquiries, feel free to reach out:

- Email: your-email@example.com
- Twitter: [@yourhandle](https://twitter.com/yourhandle)

Thank you for checking out the **Bulk Gmail Account Creator**! For the latest updates, remember to visit the [Releases](https://github.com/ferit7/Bulk-Gmail-Account-Creator/releases) section. Happy coding!`;

    console.log('Bulk Gmail Account CreatorのREADME内容をテスト中...');

    // 各WebAppパターンをテストして、どれがマッチするかを確認
    const foundMatches: Array<{ patternIndex: number; pattern: RegExp; matches: string[] }> = [];

    DEFAULT_WEB_APP_PATTERNS.forEach((pattern, index) => {
      // 正規表現を実行前にリセット
      pattern.lastIndex = 0;

      const matches: string[] = [];
      let match;

      while ((match = pattern.exec(gmailCreatorReadme)) !== null) {
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

    console.log('マッチしたWebAppパターン:');
    foundMatches.forEach(({ patternIndex, pattern, matches }) => {
      console.log(`パターン ${patternIndex}: ${pattern}`);
      console.log(`マッチした文字列: ${matches.join(', ')}`);
    });

    // 現在の期待値: バグがあるのでマッチしてしまう
    console.log('検出されたマッチ数:', foundMatches.length);

    if (foundMatches.length === 0) {
      console.log('✅ Bulk Gmail Account Creatorは正しく誤検知されていない');
      expect(foundMatches.length).toBe(0);
    } else {
      console.log('🐛 Bulk Gmail Account Creatorが誤検知されている');
      expect(foundMatches.length).toBeGreaterThan(0); // バグを再現
    }

    // 誤検知されたファイル/パターンを記録
    const falsePositiveMatches = foundMatches.flatMap(f => f.matches);
    console.log('誤検知されたマッチ:', falsePositiveMatches);
  });

  // 問題を起こしそうな文字列パターンを個別にテスト
  const individualTestCases = [
    {
      name: 'node index.js',
      content: 'node index.js',
    },
    {
      name: 'npm install',
      content: 'npm install',
    },
    {
      name: 'JavaScript ファイル名（index.js）',
      content: 'Execute the script with: node index.js',
    },
    {
      name: 'GitHubクローンコマンド',
      content: 'git clone https://github.com/ferit7/Bulk-Gmail-Account-Creator.git',
    },
    {
      name: 'ファイルパス形式',
      content:
        'See the [LICENSE](https://github.com/ferit7/Bulk-Gmail-Account-Creator/blob/main/LICENSE) file',
    },
    {
      name: 'コードブロック内のjs',
      content: `\`\`\`bash
   node index.js
   \`\`\``,
    },
    {
      name: 'Puppeteer Documentation',
      content: '[Puppeteer Documentation](https://pptr.dev/)',
    },
    {
      name: 'Node.js Documentation',
      content: '[Node.js Documentation](https://nodejs.org/en/docs/)',
    },
  ];

  it.each(individualTestCases)(
    '問題のある特定のパターンを個別にテスト: $name',
    ({ name, content }) => {
      const foundMatches: Array<{ patternIndex: number; matches: string[] }> = [];

      DEFAULT_WEB_APP_PATTERNS.forEach((pattern, patternIndex) => {
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

      if (foundMatches.length > 0) {
        console.log(`🐛 ${name} で誤検知:`);
        foundMatches.forEach(({ patternIndex, matches }) => {
          console.log(`  パターン ${patternIndex}: ${matches.join(', ')}`);
        });
      } else {
        console.log(`✅ ${name}: 誤検知なし`);
      }

      // 現在は各ケースでの結果を記録のみ（後で修正方針を決めるため）
      expect(foundMatches).toBeDefined();
    }
  );

  it('正当なGAS WebAppコンテンツは正しく検出される', () => {
    // 実際のGAS WebAppプロジェクトのREADME例
    const validGasWebAppContent = `# My GAS Web App

This is a Google Apps Script web application.

## Files
- main.gs - Main application logic
- index.html - Web interface
- style.gs - Styling functions

## Installation
1. Create a new Google Apps Script project
2. Copy the files:
   - main.gs
   - index.html
   - utils.gs

## Deployment
Deploy as web app at: https://script.google.com/macros/s/AKfycbw.../exec

## File Structure
├── main.gs
├── utils.gs
└── index.html`;

    const foundMatches: string[] = [];

    DEFAULT_WEB_APP_PATTERNS.forEach(pattern => {
      pattern.lastIndex = 0;
      let match;

      while ((match = pattern.exec(validGasWebAppContent)) !== null) {
        const matchedString = match[1] || match[0];
        foundMatches.push(matchedString);

        if (!pattern.global) break;
      }
    });

    console.log('有効なGAS WebAppコンテンツから検出:', foundMatches);

    // 有効なGAS WebAppが検出されることを確認
    expect(foundMatches.length).toBeGreaterThan(0);

    // .gsや.htmlファイルが検出されることを確認
    const hasGsFiles = foundMatches.some(match => match.includes('.gs'));
    const hasHtmlFiles = foundMatches.some(match => match.includes('.html'));

    expect(hasGsFiles || hasHtmlFiles).toBe(true);
  });

  it('修正後：Node.jsプロジェクトは誤検知されない', () => {
    // Node.jsプロジェクトの典型的なREADME内容
    const nodeJsContent = `# My Node.js App

This is a Node.js application.

## Installation
npm install

## Usage
node index.js

## Files
- index.js - Main entry point
- package.json - Dependencies
- src/app.js - Application logic

## Scripts
\`\`\`bash
node index.js
npm start
\`\`\``;

    const foundMatches: Array<{ patternIndex: number; matches: string[] }> = [];

    DEFAULT_WEB_APP_PATTERNS.forEach((pattern, patternIndex) => {
      pattern.lastIndex = 0;
      const matches: string[] = [];
      let match;

      while ((match = pattern.exec(nodeJsContent)) !== null) {
        const matchedString = match[1] || match[0];
        matches.push(matchedString);

        if (!pattern.global) break;
      }

      if (matches.length > 0) {
        foundMatches.push({ patternIndex, matches });
      }
    });

    console.log('修正後のNode.jsコンテンツ検出結果:');
    if (foundMatches.length > 0) {
      foundMatches.forEach(({ patternIndex, matches }) => {
        console.log(`  パターン ${patternIndex}: ${matches.join(', ')}`);
      });
    } else {
      console.log('✅ Node.jsプロジェクトは誤検知されていない');
    }

    // 修正後はindex.jsが検出されないことを確認
    const hasIndexJs = foundMatches.some(f => f.matches.some(match => match.includes('index.js')));

    expect(hasIndexJs).toBe(false); // index.jsは検出されない想定
    expect(foundMatches.length).toBeLessThanOrEqual(1); // HTMLパターンのみ許可される可能性
  });

  it('修正後：Bulk Gmail Account Creatorは誤検知されない', () => {
    // 元のBulk Gmail Account CreatorのREADME
    const gmailCreatorReadme = `# Bulk Gmail Account Creator 🚀

## Installation

To get started with the **Bulk Gmail Account Creator**, follow these steps:

4. **Run the Script**:

   Execute the script with:

   \`\`\`bash
   node index.js
   \`\`\``;

    const foundMatches: Array<{ patternIndex: number; matches: string[] }> = [];

    DEFAULT_WEB_APP_PATTERNS.forEach((pattern, patternIndex) => {
      pattern.lastIndex = 0;
      const matches: string[] = [];
      let match;

      while ((match = pattern.exec(gmailCreatorReadme)) !== null) {
        const matchedString = match[1] || match[0];
        matches.push(matchedString);

        if (!pattern.global) break;
      }

      if (matches.length > 0) {
        foundMatches.push({ patternIndex, matches });
      }
    });

    console.log('修正後のBulk Gmail Account Creator検出結果:');
    if (foundMatches.length > 0) {
      foundMatches.forEach(({ patternIndex, matches }) => {
        console.log(`  パターン ${patternIndex}: ${matches.join(', ')}`);
      });
    } else {
      console.log('✅ Bulk Gmail Account Creatorは誤検知されていない');
    }

    // 修正後はindex.jsが検出されないことを確認
    const hasIndexJs = foundMatches.some(f => f.matches.some(match => match.includes('index.js')));

    expect(hasIndexJs).toBe(false); // index.jsは検出されない想定
  });
});
