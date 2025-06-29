import { env } from '$env/dynamic/private';
import { OpenAIUtils } from '$lib/server/utils/openai-utils.js';
import type { LibrarySummary, LibrarySummaryParams } from '$lib/types/library-summary.js';

/**
 * E2Eテスト用のモックデータを取得
 * リポジトリURLに基づいて適切なテストデータを選択
 */
function getE2EMockSummary(githubUrl: string): LibrarySummary {
  // リポジトリ名からテストデータを選択
  if (githubUrl.includes('oauth') || githubUrl.includes('auth')) {
    // OAuth認証ライブラリのモックデータ
    return {
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
        ],
      },
    };
  }

  // デフォルトのテストライブラリモックデータ
  return {
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
}

/**
 * OpenAI APIを使用してライブラリ要約を生成するサービス
 */
export class GenerateLibrarySummaryService {
  /**
   * GitHubリポジトリの情報からライブラリ要約を生成する
   * @param params ライブラリ要約生成パラメータ
   * @returns 生成されたライブラリ要約
   */
  static async call(params: LibrarySummaryParams): Promise<LibrarySummary> {
    // E2Eテストモードの場合はモックデータを返す
    if (env.PLAYWRIGHT_TEST_MODE === 'true') {
      console.log('🤖 [E2E Mock] AI要約を生成中... (モックデータを使用)');
      // 実際のAPIレスポンス時間をシミュレート
      await new Promise(resolve => setTimeout(resolve, 100));
      return getE2EMockSummary(params.githubUrl);
    }

    const client = OpenAIUtils.getClient();

    const prompt = this.buildPrompt(params);

    const response = await client.chat.completions.create({
      model: 'o4-mini',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'library_summary',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              basicInfo: {
                type: 'object',
                properties: {
                  libraryName: {
                    type: 'object',
                    properties: {
                      ja: { type: 'string' },
                      en: { type: 'string' },
                    },
                    required: ['ja', 'en'],
                    additionalProperties: false,
                  },
                  purpose: {
                    type: 'object',
                    properties: {
                      ja: { type: 'string' },
                      en: { type: 'string' },
                    },
                    required: ['ja', 'en'],
                    additionalProperties: false,
                  },
                  targetUsers: {
                    type: 'object',
                    properties: {
                      ja: { type: 'string' },
                      en: { type: 'string' },
                    },
                    required: ['ja', 'en'],
                    additionalProperties: false,
                  },
                  tags: {
                    type: 'object',
                    properties: {
                      en: {
                        type: 'array',
                        items: { type: 'string' },
                      },
                      ja: {
                        type: 'array',
                        items: { type: 'string' },
                      },
                    },
                    required: ['en', 'ja'],
                    additionalProperties: false,
                  },
                },
                required: ['libraryName', 'purpose', 'targetUsers', 'tags'],
                additionalProperties: false,
              },
              functionality: {
                type: 'object',
                properties: {
                  coreProblem: {
                    type: 'object',
                    properties: {
                      ja: { type: 'string' },
                      en: { type: 'string' },
                    },
                    required: ['ja', 'en'],
                    additionalProperties: false,
                  },
                  mainBenefits: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        title: {
                          type: 'object',
                          properties: {
                            ja: { type: 'string' },
                            en: { type: 'string' },
                          },
                          required: ['ja', 'en'],
                          additionalProperties: false,
                        },
                        description: {
                          type: 'object',
                          properties: {
                            ja: { type: 'string' },
                            en: { type: 'string' },
                          },
                          required: ['ja', 'en'],
                          additionalProperties: false,
                        },
                      },
                      required: ['title', 'description'],
                      additionalProperties: false,
                    },
                  },
                },
                required: ['coreProblem', 'mainBenefits'],
                additionalProperties: false,
              },
            },
            required: ['basicInfo', 'functionality'],
            additionalProperties: false,
          },
        },
      },
      reasoning_effort: 'medium',
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI API からの応答が空です');
    }

    try {
      const summary = JSON.parse(content) as LibrarySummary;
      return summary;
    } catch {
      throw new Error('OpenAI API からの応答をJSONとして解析できませんでした');
    }
  }

  /**
   * プロンプトを構築する
   * @param params ライブラリ要約生成パラメータ
   * @returns 構築されたプロンプト
   */
  private static buildPrompt(params: LibrarySummaryParams): string {
    return `GitHub URLからGoogle Apps Scriptライブラリの要約JSONを生成してください。

**要求:**
- mainBenefitsは1-3個
- 各テキストは簡潔に
- GitHubの実際の情報のみ使用
- 完全なJSONのみ出力（説明不要）

**GithubリポジトリURL:** ${params.githubUrl}`;
  }
}
