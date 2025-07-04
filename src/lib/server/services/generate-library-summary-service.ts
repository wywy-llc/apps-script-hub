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
あなたはGoogle Apps Script (GAS)の専門家であり、与えられた情報から本質を読み解く能力に長けたAIアシスタントです。

# Goal
GASライブラリのGitHubリポジトリを多角的に分析・推論し、他の開発者がライブラリの価値を即座に理解できる、構造化されたJSON要約を生成します。

# Input
- GitHub Repository URL: ${params.githubUrl}

# 推論プロセス (Reasoning Process)
以下のステップに従って、思考を進め、最終的なJSONを構築してください。

### Step 1: 全体像の把握 (High-Level Understanding)
1.  まず、リポジトリの概要、説明、トピックを読み、このライブラリが何であるかを大まかに把握します。
2.  この第一印象に基づき、\`libraryName\`と\`tags\`の候補を考えます。

### Step 2: 課題と目的の特定 (Identifying Problem and Purpose)
1.  \`README.md\`を精読し、「このライブラリは何を解決するために作られたのか？」という観点から\`coreProblem\`（開発者が直面する根源的な課題）を特定します。
2.  次に、その課題解決のためにライブラリが提供する具体的な機能や役割を分析し、\`purpose\`（ライブラリの目的）として言語化します。

### Step 3: 対象ユーザーの推論 (Inferring Target Users)
1.  コード例の複雑さ、ドキュメントの記述スタイル、そして解決する課題の性質を評価します。
2.  その評価に基づき、「どのようなスキルセットを持つ、どんな状況のGAS開発者」が最もこのライブラリから恩恵を受けるかを推論し、具体的な\`targetUsers\`像を記述します。

### Step 4: 利点の論理的構造化 (Structuring the Main Benefits)
1.  Step 2で特定した\`coreProblem\`を解決する上で、最もインパクトのある主要な機能や特徴を1〜3つ選び出します。
2.  それぞれを\`mainBenefits\`の項目として、利点が伝わるように\`title\`と\`description\`を記述します。

### Step 5: \`usageExample\`の作成 (READMEのコード例を詳細解説)
1.  まず、リポジトリの\`README.md\`に掲載されている主要なコード例を探してください。
2.  そのコード例をベースにして、\`usageExample\`を作成します。あなたの主なタスクは、**READMEに書かれている以上の、より詳細で分かりやすい解説を加えること**です。各行や主要な引数が何を意味し、どのように機能するかを丁寧に説明してください。
3.  もし\`README.md\`に適切なコード例がない場合のみ、これまでの分析に基づいて、以下の要件を満たす実践的なコード例を新規に作成してください。
    * **ES6以降のモダンな文法**（\`const\`, \`let\`, アロー関数など）を使用する。
    * **Google Apps Scriptの文脈**で、現実に即したコードであること。
    * メソッドに渡す**典型的な引数**と、その**戻り値を変数に格納して利用する**流れが明確にわかること。
4.  最終的なアウトプットは、言語識別子\`javascript\`を指定したMarkdownのコードブロックと、その前後の詳細な解説文で構成してください。
5.  このMarkdown形式の解説付きコードを、日本語(ja)と英語(en)の両方で生成してください。
6.  以下の出力例を参考に、品質の高い解説とコードを生成してください。

--- 出力例 (Example Output) ---

**[ja]**
このライブラリの中心的なメソッド \`MyLogger.log()\` の使用例です。
以下のコードでは、まずロガーを初期化し、'INFO' レベルで構造化されたメッセージを記録しています。

\`\`\`javascript
// スプレッドシートIDを渡してロガーライブラリを初期化します
const logger = new MyLogger('XXXXXXXXXXXXXXXXXXXXXXXXXXXX');

// 記録したい情報をオブジェクトとして準備します
const userInfo = { id: 'user001', action: 'login' };
const message = JSON.stringify(userInfo);

// 'INFO' レベルでログを記録し、結果を受け取ります
const result = logger.log(message, 'INFO');

console.log(\`ログが記録されました。行番号: \${result.row}\`);
\`\`\`

このように、第1引数に記録したいメッセージ、第2引数にログレベルを渡します。戻り値として、ログが書き込まれたスプレッドシートの行番号などが含まれるオブジェクトが返されるため、後続処理に利用できます。

**[en]**
This is an example of how to use the library's core method, \`MyLogger.log()\`.
In the following code, we first initialize the logger and then record a structured message with the 'INFO' level.

\`\`\`javascript
// Initialize the logger library with a spreadsheet ID
const logger = new MyLogger('XXXXXXXXXXXXXXXXXXXXXXXXXXXX');

// Prepare the information you want to log as an object
const userInfo = { id: 'user001', action: 'login' };
const message = JSON.stringify(userInfo);

// Log the message with the 'INFO' level and receive the result
const result = logger.log(message, 'INFO');

console.log(\`Log recorded. Row number: \${result.row}\`);
\`\`\`

As shown, you pass the message to record as the first argument and the log level as the second. The method returns an object containing results, such as the row number in the spreadsheet where the log was written, which can be used for subsequent actions.

---

### Step 6: JSONの構築と最終レビュー (Constructing and Finalizing the JSON)
1.  上記ステップで得られた推論結果を、厳格なJSONスキーマに従って組み立てます。
2.  全てのテキストフィールドを日本語（ja）と英語（en）の両方で生成します。
3.  最後に、生成したJSONが全ての制約を満たし、リポジトリの内容と論理的に一致しているかセルフレビューしてください。

# Output Constraints
- 応答にはJSONオブジェクトのみを含めてください。説明文や思考プロセス、コードフェンス(\`\`\`json)は一切出力しないでください。
- 情報は提供されたGitHubリポジトリの内容にのみ基づいてください。
`;
  }
}
