import { Factory } from 'fishery';

/**
 * 検索テスト用のライブラリデータインターフェース
 */
export interface SearchLibraryTestData {
  /** ライブラリ名 */
  name: string;
  /** Google Apps Script ID */
  scriptId: string;
  /** GitHubリポジトリURL */
  repositoryUrl: string;
  /** 作者URL */
  authorUrl: string;
  /** 作者名 */
  authorName: string;
  /** 説明 */
  description: string;
  /** README内容 */
  readmeContent: string;
  /** スター数 */
  starCount: number;
  /** ステータス */
  status: 'pending' | 'published' | 'rejected';
}

/**
 * 公開済みライブラリのテストデータファクトリ
 * 検索結果に表示されるライブラリ用
 */
export const PublishedLibraryFactory = Factory.define<SearchLibraryTestData>(() => ({
  name: 'GasLogger',
  scriptId: '1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF',
  repositoryUrl: 'https://github.com/gas-developer/GasLogger',
  authorUrl: 'https://github.com/gas-developer',
  authorName: 'gas-developer',
  description:
    'スプレッドシートやCloud Loggingに簡単・高機能なログ出力機能を追加します。デバッグ効率を飛躍的に向上させます。',
  readmeContent: '# GasLogger\n\nGoogle Apps Script用のロギングライブラリです。',
  starCount: 847,
  status: 'published',
}));

/**
 * 承認待ちライブラリのテストデータファクトリ
 * 検索結果に表示されないライブラリ用
 */
export const PendingLibraryFactory = Factory.define<SearchLibraryTestData>(() => ({
  name: 'PendingLibrary',
  scriptId: '1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890',
  repositoryUrl: 'https://github.com/test-user/PendingLibrary',
  authorUrl: 'https://github.com/test-user',
  authorName: 'test-user',
  description: '承認待ちのライブラリです。検索結果には表示されません。',
  readmeContent: '# PendingLibrary\n\n承認待ちのライブラリです。',
  starCount: 10,
  status: 'pending',
}));

/**
 * 拒否されたライブラリのテストデータファクトリ
 * 検索結果に表示されないライブラリ用
 */
export const RejectedLibraryFactory = Factory.define<SearchLibraryTestData>(() => ({
  name: 'RejectedLibrary',
  scriptId: '1ZyXwVuTsRqPoNmLkJiHgFeDcBa0987654321',
  repositoryUrl: 'https://github.com/bad-user/RejectedLibrary',
  authorUrl: 'https://github.com/bad-user',
  authorName: 'bad-user',
  description: '拒否されたライブラリです。検索結果には表示されません。',
  readmeContent: '# RejectedLibrary\n\n拒否されたライブラリです。',
  starCount: 5,
  status: 'rejected',
}));

/**
 * 検索テスト用の複数ライブラリセット
 */
export const SearchTestLibrariesFactory = Factory.define(() => ({
  published: [
    PublishedLibraryFactory.build({
      name: 'GasLogger',
      authorName: 'gas-developer',
      description: 'ログ出力ライブラリ',
    }),
    PublishedLibraryFactory.build({
      name: 'GasDateFormatter',
      scriptId: '1DaTeFoRmAtTeR1234567890AbCdEfGhIjKlMnOpQrStUvWxYz',
      authorName: 'date-wizard',
      description: 'Moment.jsライクな日時フォーマットライブラリ',
    }),
    PublishedLibraryFactory.build({
      name: 'GasCalendarSync',
      scriptId: '1CaLeNdArSyNc1234567890AbCdEfGhIjKlMnOpQrStUvWxYz',
      authorName: 'sync-expert',
      description: 'Googleカレンダー同期ライブラリ',
    }),
  ],
  pending: [
    PendingLibraryFactory.build({
      name: 'PendingUtility',
      description: '承認待ちのユーティリティライブラリ',
    }),
  ],
  rejected: [
    RejectedLibraryFactory.build({
      name: 'RejectedTool',
      description: '拒否されたツールライブラリ',
    }),
  ],
}));
