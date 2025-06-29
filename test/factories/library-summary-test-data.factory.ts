import type { LibrarySummary } from '../../src/lib/types/library-summary.js';
import { createTestDataFactory } from './base.factory.js';

/**
 * LibrarySummary用のテストデータファクトリー
 * E2Eテストやユニットテストで使用するモックデータを生成
 */

// デフォルトのLibrarySummaryテストデータ
const defaultLibrarySummaryData: LibrarySummary = {
  basicInfo: {
    libraryName: {
      ja: 'テストライブラリ',
      en: 'Test Library',
    },
    purpose: {
      ja: 'テスト用のGoogle Apps Scriptライブラリ',
      en: 'Test Google Apps Script Library',
    },
    targetUsers: {
      ja: 'テスト開発者、テスト自動化エンジニア',
      en: 'Test developers, Test automation engineers',
    },
    tags: {
      ja: ['テスト', 'モック', 'E2E'],
      en: ['test', 'mock', 'e2e'],
    },
  },
  functionality: {
    coreProblem: {
      ja: 'E2Eテストでの実際のAPI呼び出しによるコスト発生',
      en: 'Cost incurred by actual API calls in E2E testing',
    },
    mainBenefits: [
      {
        title: {
          ja: 'コスト削減',
          en: 'Cost Reduction',
        },
        description: {
          ja: 'OpenAI APIの実際の呼び出しを避けてテスト実行コストを削減',
          en: 'Reduce test execution costs by avoiding actual OpenAI API calls',
        },
      },
      {
        title: {
          ja: '高速実行',
          en: 'Fast Execution',
        },
        description: {
          ja: 'モックデータの使用により、テストの実行速度を向上',
          en: 'Improve test execution speed by using mock data',
        },
      },
    ],
  },
};

// OAuth認証ライブラリのテストデータ
const oauthLibrarySummaryData: LibrarySummary = {
  basicInfo: {
    libraryName: {
      ja: 'OAuth2認証ライブラリ',
      en: 'OAuth2 Authentication Library',
    },
    purpose: {
      ja: 'Google Apps ScriptでOAuth2認証を簡単に実装するためのライブラリ',
      en: 'Library for easy OAuth2 authentication implementation in Google Apps Script',
    },
    targetUsers: {
      ja: 'GAS開発者、OAuth2認証を必要とする開発者',
      en: 'GAS developers, OAuth2 authentication developers',
    },
    tags: {
      ja: ['OAuth2', '認証', 'セキュリティ', 'API'],
      en: ['OAuth2', 'authentication', 'security', 'API'],
    },
  },
  functionality: {
    coreProblem: {
      ja: 'Google Apps ScriptでのOAuth2認証実装の複雑さ',
      en: 'Complexity of OAuth2 authentication implementation in Google Apps Script',
    },
    mainBenefits: [
      {
        title: {
          ja: '簡単な認証実装',
          en: 'Easy Authentication Implementation',
        },
        description: {
          ja: '複雑なOAuth2フローを簡単なメソッド呼び出しで実現',
          en: 'Realize complex OAuth2 flow with simple method calls',
        },
      },
      {
        title: {
          ja: 'セキュリティ強化',
          en: 'Enhanced Security',
        },
        description: {
          ja: '安全なトークン管理と自動リフレッシュ機能',
          en: 'Secure token management and automatic refresh functionality',
        },
      },
      {
        title: {
          ja: '多様なプロバイダ対応',
          en: 'Multiple Provider Support',
        },
        description: {
          ja: 'Google、GitHub、Slack等の主要なOAuth2プロバイダをサポート',
          en: 'Support for major OAuth2 providers like Google, GitHub, Slack',
        },
      },
    ],
  },
};

// ユーティリティライブラリのテストデータ
const utilityLibrarySummaryData: LibrarySummary = {
  basicInfo: {
    libraryName: {
      ja: 'GASユーティリティライブラリ',
      en: 'GAS Utility Library',
    },
    purpose: {
      ja: 'Google Apps Scriptでよく使用される便利な機能をまとめたユーティリティライブラリ',
      en: 'Utility library with commonly used convenient functions for Google Apps Script',
    },
    targetUsers: {
      ja: 'GAS開発者、業務効率化を目指す開発者',
      en: 'GAS developers, productivity-focused developers',
    },
    tags: {
      ja: ['ユーティリティ', 'ヘルパー', '業務効率化'],
      en: ['utility', 'helper', 'productivity'],
    },
  },
  functionality: {
    coreProblem: {
      ja: 'GAS開発での繰り返し作業と冗長なコード',
      en: 'Repetitive tasks and redundant code in GAS development',
    },
    mainBenefits: [
      {
        title: {
          ja: '開発効率向上',
          en: 'Improved Development Efficiency',
        },
        description: {
          ja: 'よく使用される機能を簡単に呼び出して開発時間を短縮',
          en: 'Reduce development time by easily calling commonly used functions',
        },
      },
      {
        title: {
          ja: 'コード品質向上',
          en: 'Improved Code Quality',
        },
        description: {
          ja: 'テスト済みの関数を使用してバグの少ないコードを実現',
          en: 'Achieve bug-free code by using tested functions',
        },
      },
    ],
  },
};

/**
 * LibrarySummaryテストデータファクトリーのプリセット
 */
export const LibrarySummaryTestDataFactories = {
  default: createTestDataFactory<LibrarySummary>(() => defaultLibrarySummaryData),
  oauth: createTestDataFactory<LibrarySummary>(() => oauthLibrarySummaryData),
  utility: createTestDataFactory<LibrarySummary>(() => utilityLibrarySummaryData),
};
