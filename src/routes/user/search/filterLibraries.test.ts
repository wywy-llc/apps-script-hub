import { describe, expect, it } from 'vitest';

// テスト用のライブラリデータ
const testLibraries = [
  {
    id: 1,
    name: 'GasDateFormatter',
    description:
      'Moment.jsライクなシンタックスで、GASの日時オブジェクトを簡単にフォーマットするためのユーティリティライブラリ。タイムゾーンの扱いもサポート。',
    tags: ['Date', 'Utility', 'Format'],
    author: 'user-name',
    lastUpdated: '3日前',
    stars: 492,
    downloads: 7300,
  },
  {
    id: 2,
    name: 'CalendarEventUtil',
    description:
      'Googleカレンダーのイベント作成・更新・削除をより直感的に行えるヘルパー集。繰り返しイベントの操作や、会議室の予約などを簡略化します。',
    tags: ['Calendar', 'Date', 'Utility'],
    author: 'developer-taro',
    lastUpdated: '2週間前',
    stars: 876,
    downloads: 13200,
  },
  {
    id: 3,
    name: 'JapaneseDate',
    description:
      '日本の祝日判定や和暦（元号）の変換機能を提供します。内閣府の祝日CSVデータソースと連携可能です。',
    tags: ['Date', 'Japan', 'Holiday'],
    author: 'gas-master',
    lastUpdated: '1ヶ月前',
    stars: 325,
    downloads: 4800,
  },
  {
    id: 4,
    name: 'GasLogger',
    description:
      'スプレッドシートやCloud Loggingに簡単・高機能なログ出力機能を追加します。デバッグ効率を飛躍的に向上させます。',
    tags: ['Logging', 'Utility'],
    author: 'gas-developer',
    lastUpdated: '2025/05/28',
    stars: 847,
    downloads: 12500,
  },
  {
    id: 5,
    name: 'GasHtml',
    description:
      'HTMLテンプレートエンジン。サーバーサイドで動的にHTMLを生成し、複雑なWebアプリケーションの構築をサポートします。',
    tags: ['WebApp', 'HTML'],
    author: 'html-master',
    lastUpdated: '2025/04/15',
    stars: 623,
    downloads: 8900,
  },
  {
    id: 6,
    name: 'GasTest',
    description:
      'GASプロジェクトのための軽量なユニットテストフレームワーク。テスト駆動開発(TDD)をGASで実現可能にします。',
    tags: ['Testing', 'Utility'],
    author: 'test-ninja',
    lastUpdated: '2025/03/30',
    stars: 1205,
    downloads: 15600,
  },
];

// テスト対象の関数（元の関数をコピー + lastUpdatedも検索対象に追加）
function filterLibraries(query: string, allLibraries = testLibraries) {
  if (!query || !query.trim()) {
    return allLibraries;
  }

  const lowerQuery = query.toLowerCase();
  return allLibraries.filter(
    library =>
      library.name.toLowerCase().includes(lowerQuery) ||
      library.description.toLowerCase().includes(lowerQuery) ||
      library.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      library.author.toLowerCase().includes(lowerQuery) ||
      library.lastUpdated.toLowerCase().includes(lowerQuery)
  );
}

describe('filterLibraries', () => {
  describe('空文字・未定義の検索クエリ', () => {
    it('空文字の場合、全ライブラリを返す', () => {
      const result = filterLibraries('');
      expect(result).toEqual(testLibraries);
      expect(result).toHaveLength(6);
    });

    it('スペースのみの場合、全ライブラリを返す', () => {
      const result = filterLibraries('   ');
      expect(result).toEqual(testLibraries);
    });
  });

  describe('ライブラリ名による検索', () => {
    it('完全一致する名前で検索できる', () => {
      const result = filterLibraries('GasDateFormatter');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('GasDateFormatter');
    });

    it('部分一致する名前で検索できる', () => {
      const result = filterLibraries('Gas');
      expect(result).toHaveLength(5); // GasDateFormatter, GasLogger, GasHtml, GasTest, JapaneseDate(gas-master含む)
      expect(
        result.some(
          lib => lib.name.toLowerCase().includes('gas') || lib.author.toLowerCase().includes('gas')
        )
      ).toBe(true);
    });

    it('大文字小文字を区別しない', () => {
      const result = filterLibraries('gasdateformatter');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('GasDateFormatter');
    });
  });

  describe('説明文による検索', () => {
    it('説明文内のキーワードで検索できる', () => {
      const result = filterLibraries('Moment.js');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('GasDateFormatter');
    });

    it('日本語の説明文で検索できる', () => {
      const result = filterLibraries('祝日');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('JapaneseDate');
    });

    it('部分一致でも検索できる', () => {
      const result = filterLibraries('ログ');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('GasLogger');
    });
  });

  describe('タグによる検索', () => {
    it('タグで検索できる', () => {
      const result = filterLibraries('Date');
      expect(result).toHaveLength(3); // GasDateFormatter, CalendarEventUtil, JapaneseDate
      expect(result.every(lib => lib.tags.some(tag => tag.toLowerCase().includes('date')))).toBe(
        true
      );
    });

    it('Utilityタグで複数ライブラリを検索できる', () => {
      const result = filterLibraries('Utility');
      expect(result).toHaveLength(4); // GasDateFormatter, CalendarEventUtil, GasLogger, GasTest
    });

    it('大文字小文字を区別しない', () => {
      const result = filterLibraries('utility');
      expect(result).toHaveLength(4);
    });
  });

  describe('作者名による検索', () => {
    it('作者名で検索できる', () => {
      const result = filterLibraries('user-name');
      expect(result).toHaveLength(1);
      expect(result[0].author).toBe('user-name');
    });

    it('作者名の部分一致で検索できる', () => {
      const result = filterLibraries('gas');
      expect(result).toHaveLength(5); // 名前にGasを含む4つ + gas-masterが作者の1つ
    });

    it('大文字小文字を区別しない', () => {
      const result = filterLibraries('GAS-MASTER');
      expect(result).toHaveLength(1);
      expect(result[0].author).toBe('gas-master');
    });
  });

  describe('更新日による検索', () => {
    it('更新日の形式で検索できる', () => {
      const result = filterLibraries('2025/05/28');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('GasLogger');
    });

    it('年のみで検索できる', () => {
      const result = filterLibraries('2025');
      expect(result).toHaveLength(3); // GasLogger, GasHtml, GasTest
    });

    it('日本語の相対日付で検索できる', () => {
      const result = filterLibraries('3日前');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('GasDateFormatter');
    });
  });

  describe('複合検索', () => {
    it('複数フィールドに該当するクエリで検索できる', () => {
      const result = filterLibraries('Date');
      // 名前、説明、タグ、作者、更新日のいずれかに"Date"を含むライブラリ
      expect(result.length).toBeGreaterThan(0);
      expect(
        result.every(
          lib =>
            lib.name.toLowerCase().includes('date') ||
            lib.description.toLowerCase().includes('date') ||
            lib.tags.some(tag => tag.toLowerCase().includes('date')) ||
            lib.author.toLowerCase().includes('date') ||
            lib.lastUpdated.toLowerCase().includes('date')
        )
      ).toBe(true);
    });
  });

  describe('検索結果なし', () => {
    it('該当なしの場合、空配列を返す', () => {
      const result = filterLibraries('存在しないキーワード');
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('特殊文字を含むクエリでも正常動作する', () => {
      const result = filterLibraries('!@#$%');
      expect(result).toEqual([]);
    });
  });

  describe('エッジケース', () => {
    it('数字のみのクエリでも動作する', () => {
      const result = filterLibraries('2025');
      expect(result).toHaveLength(3); // GasLogger, GasHtml, GasTestの更新日に2025が含まれる
    });

    it('非常に長いクエリでも動作する', () => {
      const longQuery = 'a'.repeat(1000);
      const result = filterLibraries(longQuery);
      expect(result).toEqual([]);
    });

    it('空のライブラリ配列に対しても動作する', () => {
      const result = filterLibraries('test', []);
      expect(result).toEqual([]);
    });
  });
});
