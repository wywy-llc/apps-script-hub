import { describe, it, expect } from 'vitest';
import { truncateUrl } from './url';

describe('truncateUrl', () => {
  describe('正常なケース', () => {
    it('短いURLをそのまま返す', () => {
      const url = 'https://example.com';
      const result = truncateUrl(url);
      expect(result).toBe(url);
    });

    it('最大長と同じ長さのURLをそのまま返す', () => {
      const url = 'https://example.com/path/to'; // 28文字
      const result = truncateUrl(url, 28);
      expect(result).toBe(url);
    });

    it('長いURLを正しく短縮する（デフォルト長）', () => {
      const url = 'https://github.com/googleworkspace/apps-script-oauth2';
      const result = truncateUrl(url);
      expect(result).toBe('https://github.com/googlewo...');
      expect(result.length).toBe(30);
    });

    it('長いURLを正しく短縮する（カスタム長）', () => {
      const url = 'https://github.com/googleworkspace/apps-script-oauth2';
      const result = truncateUrl(url, 20);
      expect(result).toBe('https://github.co...');
      expect(result.length).toBe(20);
    });

    it('最小長（4文字）で正しく短縮する', () => {
      const url = 'https://example.com';
      const result = truncateUrl(url, 4);
      expect(result).toBe('h...');
      expect(result.length).toBe(4);
    });

    it('空文字列を処理する', () => {
      const result = truncateUrl('');
      expect(result).toBe('');
    });

    it('日本語を含むURLを処理する', () => {
      const url = 'https://example.com/検索?q=テスト';
      const result = truncateUrl(url, 20);
      expect(result).toBe('https://example.c...');
      expect(result.length).toBe(20);
    });

    it('特殊文字を含むURLを処理する', () => {
      const url = 'https://example.com/path?param=value&another=123';
      const result = truncateUrl(url, 25);
      expect(result).toBe('https://example.com/pa...');
      expect(result.length).toBe(25);
    });
  });

  describe('エラーケース', () => {
    it('非文字列の入力でエラーを投げる', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => truncateUrl(null as any)).toThrow('URLは文字列である必要があります');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => truncateUrl(undefined as any)).toThrow('URLは文字列である必要があります');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => truncateUrl(123 as any)).toThrow('URLは文字列である必要があります');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => truncateUrl({} as any)).toThrow('URLは文字列である必要があります');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => truncateUrl([] as any)).toThrow('URLは文字列である必要があります');
    });

    it('maxLengthが数値でない場合エラーを投げる', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => truncateUrl('https://example.com', 'invalid' as any)).toThrow(
        'maxLengthは4以上の数値である必要があります'
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => truncateUrl('https://example.com', null as any)).toThrow(
        'maxLengthは4以上の数値である必要があります'
      );
    });

    it('maxLengthがundefinedの場合はデフォルト値を使用', () => {
      const url = 'https://github.com/googleworkspace/apps-script-oauth2';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = truncateUrl(url, undefined as any);
      expect(result).toBe('https://github.com/googlewo...');
      expect(result.length).toBe(30);
    });

    it('maxLengthが4未満の場合エラーを投げる', () => {
      expect(() => truncateUrl('https://example.com', 3)).toThrow(
        'maxLengthは4以上の数値である必要があります'
      );
      expect(() => truncateUrl('https://example.com', 0)).toThrow(
        'maxLengthは4以上の数値である必要があります'
      );
      expect(() => truncateUrl('https://example.com', -1)).toThrow(
        'maxLengthは4以上の数値である必要があります'
      );
    });

    it('maxLengthが小数点の場合は整数として処理される', () => {
      const url = 'https://example.com/long/path';
      const result = truncateUrl(url, 10.5);
      expect(result).toBe('https:/...');
      expect(result.length).toBe(10);
    });
  });

  describe('境界値テスト', () => {
    it('maxLength = 4（最小値）で動作する', () => {
      const url = 'https://example.com';
      const result = truncateUrl(url, 4);
      expect(result).toBe('h...');
    });

    it('URL長 = maxLength - 1で短縮されない', () => {
      const url = 'test'; // 4文字
      const result = truncateUrl(url, 5);
      expect(result).toBe('test');
    });

    it('URL長 = maxLengthで短縮されない', () => {
      const url = 'tests'; // 5文字
      const result = truncateUrl(url, 5);
      expect(result).toBe('tests');
    });

    it('URL長 = maxLength + 1で短縮される', () => {
      const url = 'testss'; // 6文字 (testで始まる文字列)
      const result = truncateUrl(url, 5);
      expect(result).toBe('te...');
    });
  });

  describe('実用例', () => {
    it('GitHub URLを短縮する', () => {
      const url = 'https://github.com/googleworkspace/apps-script-oauth2';
      const result = truncateUrl(url, 50);
      expect(result).toBe('https://github.com/googleworkspace/apps-script-...');
      expect(result.length).toBe(50);
    });

    it('Google Apps Script URLを短縮する', () => {
      const url = 'https://script.google.com/macros/library/d/1234567890abcdef/0';
      const result = truncateUrl(url, 40);
      expect(result).toBe('https://script.google.com/macros/libr...');
      expect(result.length).toBe(40);
    });

    it('長いクエリパラメータを持つURLを短縮する', () => {
      const url =
        'https://example.com/search?q=very+long+search+query+with+many+parameters&sort=date&filter=all';
      const result = truncateUrl(url, 30);
      expect(result).toBe('https://example.com/search?...');
      expect(result.length).toBe(30);
    });
  });
});
