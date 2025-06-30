import { env } from '$env/dynamic/private';
import OpenAI from 'openai';

/**
 * OpenAI APIクライアントのユーティリティ
 */
export class OpenAIUtils {
  private static client: OpenAI | null = null;

  /**
   * OpenAI APIクライアントを取得
   * @returns OpenAI APIクライアント
   */
  static getClient(): OpenAI {
    if (!OpenAIUtils.client) {
      if (!env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY environment variable is required');
      }
      OpenAIUtils.client = new OpenAI({
        apiKey: env.OPENAI_API_KEY,
      });
    }
    return OpenAIUtils.client;
  }

  /**
   * リクエストヘッダーを作成
   * @returns リクエストヘッダー
   */
  static createHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    };
  }
}
