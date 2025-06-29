import { describe, expect, it } from 'vitest';
import { formatDate, getStatusText } from '../../../../src/lib/helpers/format';

describe('formatDate', () => {
  describe('正常なケース', () => {
    it('日付を正しい日本語フォーマットで返す', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDate(date);
      expect(result).toBe('2024/01/15');
    });

    it('年末年始の日付を正しくフォーマットする', () => {
      const newYearDate = new Date('2024-01-01T15:00:00Z');
      const newYearEveDate = new Date('2024-12-31T15:00:00Z');

      expect(formatDate(newYearDate)).toBe('2024/01/02');
      expect(formatDate(newYearEveDate)).toBe('2025/01/01');
    });

    it('異なる年の日付を正しくフォーマットする', () => {
      const date2023 = new Date('2023-06-15T12:00:00Z');
      const date2025 = new Date('2025-03-20T15:45:00Z');

      expect(formatDate(date2023)).toBe('2023/06/15');
      expect(formatDate(date2025)).toBe('2025/03/21');
    });

    it('月日が1桁の場合も2桁でパディングされる', () => {
      const date = new Date('2024-03-05T08:00:00Z');
      const result = formatDate(date);
      expect(result).toBe('2024/03/05');
    });
  });

  describe('境界値テスト', () => {
    it('月の境界値を正しく処理する', () => {
      const jan = new Date('2024-01-31T12:00:00Z');
      const feb = new Date('2024-02-01T12:00:00Z');
      const dec = new Date('2024-12-01T12:00:00Z');

      expect(formatDate(jan)).toBe('2024/01/31');
      expect(formatDate(feb)).toBe('2024/02/01');
      expect(formatDate(dec)).toBe('2024/12/01');
    });

    it('うるう年の2月29日を正しく処理する', () => {
      const leapYearDate = new Date('2024-02-29T12:00:00Z');
      const result = formatDate(leapYearDate);
      expect(result).toBe('2024/02/29');
    });
  });
});

describe('getStatusText', () => {
  describe('正常なケース', () => {
    it('公開ステータスを正しいテキストに変換する', () => {
      const result = getStatusText('published');
      expect(result).toBe('公開');
    });

    it('未公開ステータスを正しいテキストに変換する', () => {
      const result = getStatusText('pending');
      expect(result).toBe('未公開');
    });
  });

  describe('エラーケース', () => {
    it('未知のステータスは「不明」を返す', () => {
      const result = getStatusText('unknown');
      expect(result).toBe('不明');
    });

    it('空文字列は「不明」を返す', () => {
      const result = getStatusText('');
      expect(result).toBe('不明');
    });

    it('nullは「不明」を返す', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = getStatusText(null as any);
      expect(result).toBe('不明');
    });

    it('undefinedは「不明」を返す', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = getStatusText(undefined as any);
      expect(result).toBe('不明');
    });
  });

  describe('大文字小文字の違い', () => {
    it('大文字のステータスは「不明」を返す', () => {
      const result = getStatusText('PUBLISHED');
      expect(result).toBe('不明');
    });

    it('混在ケースのステータスは「不明」を返す', () => {
      const result = getStatusText('Published');
      expect(result).toBe('不明');
    });
  });

  describe('実際の使用例', () => {
    it('ライブラリのステータス配列をテキストに変換する', () => {
      const statuses = ['published', 'pending', 'published'];
      const results = statuses.map(status => getStatusText(status));

      expect(results).toEqual(['公開', '未公開', '公開']);
    });
  });
});
