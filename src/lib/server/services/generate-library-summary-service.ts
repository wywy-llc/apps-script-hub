import { OpenAIUtils } from '$lib/server/utils/openai-utils.js';
import type { LibrarySummary, LibrarySummaryParams } from '$lib/types/library-summary.js';

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
