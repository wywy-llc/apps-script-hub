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
        usageExample: {
          ja: `// OAuth2認証ライブラリの基本的な使用例
const oauth = new OAuth2Lib();
// 認証URLを生成
const authUrl = oauth.getAuthUrl('client_id', 'redirect_uri');
// アクセストークンを取得
const token = oauth.getAccessToken('auth_code');`,
          en: `// Basic usage example of OAuth2 authentication library
const oauth = new OAuth2Lib();
// Generate authentication URL
const authUrl = oauth.getAuthUrl('client_id', 'redirect_uri');
// Get access token
const token = oauth.getAccessToken('auth_code');`,
        },
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
      usageExample: {
        ja: `// テストライブラリの基本的な使用例
const testLib = new TestLibrary();
// モックデータを設定
testLib.setMockData('sample_data');
// テストを実行
const result = testLib.runTest();`,
        en: `// Basic usage example of test library
const testLib = new TestLibrary();
// Set mock data
testLib.setMockData('sample_data');
// Run test
const result = testLib.runTest();`,
      },
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
      model: 'o3',
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
                  usageExample: {
                    type: 'object',
                    properties: {
                      ja: {
                        type: 'string',
                        description:
                          'Markdown形式で記述された、コードとその解説。コードブロック（```javascript）を使用すること。',
                      },
                      en: {
                        type: 'string',
                        description:
                          'Code and its explanation in Markdown format. Use code blocks (```javascript).',
                      },
                    },
                    required: ['ja', 'en'],
                    additionalProperties: false,
                  },
                },
                required: ['coreProblem', 'mainBenefits', 'usageExample'],
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
    return `
# Role
あなたは、Google Apps Script (GAS) ライブラリの価値を開発者視点で見抜き、その本質を的確に言語化する専門家です。

# Goal
提供されたGitHubリポジトリを分析・推論し、他の開発者がライブラリの採用を迅速かつ正確に判断できる、高品質なJSONデータを生成します。

# Input
- GitHub Repository URL: ${params.githubUrl}

# Reasoning Process
以下の思考プロセスに従って、JSONオブジェクトを段階的に構築してください。

### Step 1: 全体分析 (High-Level Analysis)
リポジトリ全体、特にREADMEを読み込み、ライブラリの全体像を把握します。
- **Output:** \`libraryName\`, \`tags\`

### Step 2: 提供価値の定義 (Core Value Proposition)
ライブラリの存在意義を明確にします。
- **\`purpose\`:** **このライブラリが「何をするものか？」** を一文で定義します。
- **\`coreProblem\`:** **このライブラリが「なぜ必要なのか？」** を、ライブラリが無い場合の課題や複雑さを基に一文で定義します。

### Step 3: 対象ユーザー像の解像度向上 (Target User Profile)
最も恩恵を受けるユーザー像を具体的に推論します。
- 以下の3軸を考慮し、**一行の文章**に統合してください。
  - **レベル (Level):** GAS初心者、中級者、上級者など
  - **課題 (Problem):** どんな目的や課題を持つか (例: API連携の効率化)
  - **文脈 (Context):** 何を開発しているか (例: 社内ツール、公開アドオン)
- **Output:** \`targetUsers\`

### Step 4: 主要な利点の抽出 (Key Benefits)
ライブラリの価値を3つ挙げます。
- **\`title\`:** 利点を端的に表すタイトル。
- **\`description\`:** その利点が「どのように」実現されるかの技術的な説明。
- **Output:** \`mainBenefits\`

### Step 5: 段階的なコード例の作成 (Tiered Code Examples)
READMEのコード例を基盤とし、**Step 3で定義した対象ユーザー**を意識して、以下の3段階のコード例をマークダウン形式で出力します。
- 各レベルにはH3見出し(\`###\`)を付けてください。
- **各レベルに、コードブロックと、そのコードを解説する文章の両方を含めてください。**
  - **1. 入門 (Introduction):**
      - **目的:** 最小限のコードで、ライブラリが「動く」ことを示す。
      - **内容:** コピペですぐに試せる、最も簡単なコードスニペット。
  - **2. 基礎 (Basic/Fundamental):**
      - **目的:** 中心の課題を解決する、最も標準的な使い方を示す。
      - **内容:** 引数や戻り値の扱いが明確にわかる、実用的なコード。
  - **3. 実践 (Best Practice):**
      - **目的:** 「解決する課題」と「主な特徴」をコードで示す。
      - **内容:** 実務を想定した洗練されたコード。
- **共通要件:**
    - 各レベルの見出しは、\`### レベル - 内容を表すタイトル\` という形式にしてください。（例: \`### 【基礎】スプレッドシートのデータをJSON形式でS3にアップする\`）
    - コードは**ES6+構文**の\`javascript\`コードブロックで記述します。
    - コードブロック内には、処理の流れがわかるような**インラインコメントを必ず含めてください。**
- **Output:** \`usageExample\`

### Step 6: 最終生成 (Finalization)
上記ステップで得られたすべての要素を、スキーマに従って完全なJSONオブジェクトに組み立てます。
- **要件:** 全てのテキストフィールドは、日本語(ja)と英語(en)の両方で生成してください。

# Output Constraints
- 応答には**JSONオブジェクトのみ**を、その他の説明などを一切含めずに出力してください。
`;
  }
}
