import { describe, expect, test } from 'vitest';
import {
  convertMarkdownLinks,
  convertRelativeToAbsolute,
  getReadmeBaseUrl,
} from '../../../../src/lib/helpers/link-converter.js';

describe('link-converter', () => {
  describe('getReadmeBaseUrl', () => {
    test('GitHub URLからREADME用ベースURLを生成', () => {
      const url = 'https://github.com/owner/repo';
      const result = getReadmeBaseUrl(url);
      expect(result).toBe('https://github.com/owner/repo/blob/main');
    });

    test('.git拡張子を除去してベースURLを生成', () => {
      const url = 'https://github.com/owner/repo.git';
      const result = getReadmeBaseUrl(url);
      expect(result).toBe('https://github.com/owner/repo/blob/main');
    });

    test('GitHub以外のURLはそのまま返す', () => {
      const url = 'https://gitlab.com/owner/repo';
      const result = getReadmeBaseUrl(url);
      expect(result).toBe('https://gitlab.com/owner/repo');
    });

    test('無効なURLはそのまま返す', () => {
      const url = 'invalid-url';
      const result = getReadmeBaseUrl(url);
      expect(result).toBe('invalid-url');
    });
  });

  describe('convertRelativeToAbsolute', () => {
    const baseUrl = 'https://github.com/owner/repo/blob/main';

    test('既に絶対URLの場合はそのまま返す', () => {
      const href = 'https://example.com/page';
      const result = convertRelativeToAbsolute(href, baseUrl);
      expect(result).toBe('https://example.com/page');
    });

    test('httpで始まる絶対URLはそのまま返す', () => {
      const href = 'http://example.com/page';
      const result = convertRelativeToAbsolute(href, baseUrl);
      expect(result).toBe('http://example.com/page');
    });

    test('アンカーリンクはそのまま返す', () => {
      const href = '#section1';
      const result = convertRelativeToAbsolute(href, baseUrl);
      expect(result).toBe('#section1');
    });

    test('相対パス（./）を絶対パスに変換', () => {
      const href = './docs/README.md';
      const result = convertRelativeToAbsolute(href, baseUrl);
      expect(result).toBe('https://github.com/owner/repo/blob/main/docs/README.md');
    });

    test('相対パス（../）を絶対パスに変換', () => {
      const href = '../LICENSE';
      const result = convertRelativeToAbsolute(href, baseUrl);
      expect(result).toBe('https://github.com/owner/repo/blob/LICENSE');
    });

    test('ファイル名のみの相対パスを絶対パスに変換', () => {
      const href = 'CONTRIBUTING.md';
      const result = convertRelativeToAbsolute(href, baseUrl);
      expect(result).toBe('https://github.com/owner/repo/blob/main/CONTRIBUTING.md');
    });

    test('ルート相対パス（/で始まる）をGitHubドメインで変換', () => {
      const href = '/owner/repo/issues';
      const result = convertRelativeToAbsolute(href, baseUrl);
      expect(result).toBe('https://github.com/owner/repo/issues');
    });

    test('URL変換に失敗した場合は元のhrefを返す', () => {
      const href = '../';
      const result = convertRelativeToAbsolute(href, 'invalid-base-url');
      expect(result).toBe('../');
    });
  });

  describe('convertMarkdownLinks', () => {
    const repositoryUrl = 'https://github.com/owner/repo';

    test('マークダウンリンクの相対パスを絶対パスに変換', () => {
      const content = 'リンク: [ドキュメント](./docs/guide.md)';
      const result = convertMarkdownLinks(content, repositoryUrl);
      expect(result).toBe(
        'リンク: [ドキュメント](https://github.com/owner/repo/blob/main/docs/guide.md)'
      );
    });

    test('複数のマークダウンリンクを一括変換', () => {
      const content = `
# プロジェクト

[使い方](./docs/usage.md)と[API](../api/README.md)を参照してください。
[ライセンス](LICENSE)も確認してください。
      `.trim();

      const result = convertMarkdownLinks(content, repositoryUrl);

      expect(result).toContain('[使い方](https://github.com/owner/repo/blob/main/docs/usage.md)');
      expect(result).toContain('[API](https://github.com/owner/repo/blob/api/README.md)');
      expect(result).toContain('[ライセンス](https://github.com/owner/repo/blob/main/LICENSE)');
    });

    test('絶対URLは変換しない', () => {
      const content = 'リンク: [外部サイト](https://example.com)';
      const result = convertMarkdownLinks(content, repositoryUrl);
      expect(result).toBe('リンク: [外部サイト](https://example.com)');
    });

    test('アンカーリンクは変換しない', () => {
      const content = 'リンク: [セクション](#section1)';
      const result = convertMarkdownLinks(content, repositoryUrl);
      expect(result).toBe('リンク: [セクション](#section1)');
    });

    test('マークダウンリンクを変換する', () => {
      const content = `
# タイトル

これは普通のテキストです。
[リンク](./relative.md)
      `.trim();

      const result = convertMarkdownLinks(content, repositoryUrl);

      // リンク部分のみ変換される
      expect(result).toContain('[リンク](https://github.com/owner/repo/blob/main/relative.md)');
      // その他のテキストは変更されない
      expect(result).toContain('これは普通のテキストです。');
    });

    test('空文字列の場合は空文字列を返す', () => {
      const content = '';
      const result = convertMarkdownLinks(content, repositoryUrl);
      expect(result).toBe('');
    });

    test('リンクが含まれていない場合は元のコンテンツをそのまま返す', () => {
      const content = '# タイトル\n\nリンクのないテキストです。';
      const result = convertMarkdownLinks(content, repositoryUrl);
      expect(result).toBe('# タイトル\n\nリンクのないテキストです。');
    });
  });
});
