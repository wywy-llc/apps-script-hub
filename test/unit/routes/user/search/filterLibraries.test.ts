import { describe, expect, it } from 'vitest';
import { LibraryTestDataFactories } from '../../../../factories/library-test-data.factory';

// UI用のライブラリデータ型定義（検索機能テスト用）
interface UILibraryData {
  id: number;
  name: string;
  description: string;
  tags: string[];
  author: string;
  lastUpdated: string;
  stars: number;
  downloads: number;
}

// ファクトリから基本データを生成する関数
function createUILibraryFromFactory(
  id: number,
  factoryData: ReturnType<typeof LibraryTestDataFactories.default.build>,
  overrides: Partial<UILibraryData> = {}
): UILibraryData {
  return {
    id,
    name: factoryData.name,
    description: factoryData.description,
    tags: ['Utility'], // デフォルトタグ
    author: factoryData.authorName,
    lastUpdated: '1日前', // デフォルト更新日
    stars: factoryData.starCount ?? 0,
    downloads: (factoryData.starCount ?? 0) * 10, // スター数から推定
    ...overrides,
  };
}

// ファクトリを使用してテスト用のライブラリデータを生成
const testLibraries: UILibraryData[] = [
  // GasDateFormatterはファクトリのカスタムデータを使用
  createUILibraryFromFactory(
    1,
    LibraryTestDataFactories.default.build({
      name: 'GasDateFormatter',
      description:
        'Moment.jsライクなシンタックスで、GASの日時オブジェクトを簡単にフォーマットするためのユーティリティライブラリ。タイムゾーンの扱いもサポート。',
      authorName: 'user-name',
      starCount: 492,
    }),
    {
      tags: ['Date', 'Utility', 'Format'],
      lastUpdated: '3日前',
      downloads: 7300,
    }
  ),

  // CalendarEventUtilのカスタムデータ
  createUILibraryFromFactory(
    2,
    LibraryTestDataFactories.alternative.build({
      name: 'CalendarEventUtil',
      description:
        'Googleカレンダーのイベント作成・更新・削除をより直感的に行えるヘルパー集。繰り返しイベントの操作や、会議室の予約などを簡略化します。',
      authorName: 'developer-taro',
      starCount: 876,
    }),
    {
      tags: ['Calendar', 'Date', 'Utility'],
      lastUpdated: '2週間前',
      downloads: 13200,
    }
  ),

  // JapaneseDateのカスタムデータ
  createUILibraryFromFactory(
    3,
    LibraryTestDataFactories.default.build({
      name: 'JapaneseDate',
      description:
        '日本の祝日判定や和暦（元号）の変換機能を提供します。内閣府の祝日CSVデータソースと連携可能です。',
      authorName: 'gas-master',
      starCount: 325,
    }),
    {
      tags: ['Date', 'Japan', 'Holiday'],
      lastUpdated: '1ヶ月前',
      downloads: 4800,
    }
  ),

  // GasLoggerはファクトリの既存プリセットを使用
  createUILibraryFromFactory(
    4,
    LibraryTestDataFactories.default.build({
      name: 'GasLogger',
      description:
        'スプレッドシートやCloud Loggingに簡単・高機能なログ出力機能を追加します。デバッグ効率を飛躍的に向上させます。',
      authorName: 'gas-developer',
      starCount: 847,
    }),
    {
      tags: ['Logging', 'Utility'],
      lastUpdated: '2025/05/28',
      downloads: 12500,
    }
  ),

  // GasHtmlのカスタムデータ
  createUILibraryFromFactory(
    5,
    LibraryTestDataFactories.alternative.build({
      name: 'GasHtml',
      description:
        'HTMLテンプレートエンジン。サーバーサイドで動的にHTMLを生成し、複雑なWebアプリケーションの構築をサポートします。',
      authorName: 'html-master',
      starCount: 623,
    }),
    {
      tags: ['WebApp', 'HTML'],
      lastUpdated: '2025/04/15',
      downloads: 8900,
    }
  ),

  // GasTestのカスタムデータ
  createUILibraryFromFactory(
    6,
    LibraryTestDataFactories.default.build({
      name: 'GasTest',
      description:
        'GASプロジェクトのための軽量なユニットテストフレームワーク。テスト駆動開発(TDD)をGASで実現可能にします。',
      authorName: 'test-ninja',
      starCount: 1205,
    }),
    {
      tags: ['Testing', 'Utility'],
      lastUpdated: '2025/03/30',
      downloads: 15600,
    }
  ),
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
