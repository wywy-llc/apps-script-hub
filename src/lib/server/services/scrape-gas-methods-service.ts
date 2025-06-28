import { db } from '$lib/server/db';
import { library, libraryMethod } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

interface ScrapedMethod {
  name: string;
  description: string;
  parameters: Array<{
    name: string;
    type: string;
    description: string;
  }>;
  returnType: string;
  returnDescription: string;
}

/**
 * Google Apps Scriptライブラリページからメソッド情報をスクレイピングして保存するサービス
 */
export class ScrapeGasMethodsService {
  /**
   * スクレイピング実行のメインメソッド
   * @param libraryId - ライブラリID
   */
  static async call(libraryId: string): Promise<{ methodCount: number }> {
    // ライブラリ情報を取得
    const [libraryRecord] = await db
      .select()
      .from(library)
      .where(eq(library.id, libraryId))
      .limit(1);

    if (!libraryRecord) {
      throw new Error('ライブラリが見つかりません');
    }

    console.log(
      `Starting GAS method scraping for library: ${libraryRecord.name} (${libraryRecord.scriptId})`
    );

    // Google Apps Scriptライブラリページをスクレイピング
    const scrapedMethods = await this.scrapeGasLibraryMethods(
      libraryRecord.scriptId
    );

    if (scrapedMethods.length === 0) {
      throw new Error('メソッド情報を取得できませんでした');
    }

    // 既存のメソッド情報を削除
    await db
      .delete(libraryMethod)
      .where(eq(libraryMethod.libraryId, libraryId));

    // 新しいメソッド情報を保存
    for (const method of scrapedMethods) {
      await db.insert(libraryMethod).values({
        id: `${libraryId}_${method.name}_${Date.now()}`, // 一意性を保証
        libraryId: libraryId,
        name: method.name,
        description: method.description,
        parameters: JSON.stringify(method.parameters),
        returnType: method.returnType,
        returnDescription: method.returnDescription,
      });
    }

    console.log(
      `Successfully scraped ${scrapedMethods.length} methods for library ${libraryRecord.name}`
    );

    return { methodCount: scrapedMethods.length };
  }

  /**
   * Google Apps Scriptライブラリページをスクレイピングしてメソッド情報を取得
   * @param scriptId - GASスクリプトID
   */
  private static async scrapeGasLibraryMethods(
    scriptId: string
  ): Promise<ScrapedMethod[]> {
    const url = `https://script.google.com/macros/library/d/${scriptId}/0`;

    try {
      console.log(`Scraping URL: ${url}`);

      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(
            'ライブラリページが見つかりません。スクリプトIDが正しいか確認してください。'
          );
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      console.log('HTML fetched successfully, length:', html.length);

      // HTMLからメソッド情報を抽出
      const methods = this.extractMethodsFromHtml(html);
      console.log('Extracted methods:', methods.length);

      return methods;
    } catch (error) {
      console.error('スクレイピングエラー:', error);
      throw new Error(
        `スクレイピングに失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * HTMLからメソッド情報を抽出する関数
   * @param html - スクレイピングしたHTML文字列
   */
  private static extractMethodsFromHtml(html: string): ScrapedMethod[] {
    const methods: ScrapedMethod[] = [];

    try {
      // Google Apps Scriptのライブラリページの構造に基づいてメソッド情報を抽出
      // HTMLの中から関数定義部分を探す

      // パターン1: function定義を探す
      const functionMatches = html.match(/function\s+(\w+)\s*\([^)]*\)/g);

      if (functionMatches) {
        functionMatches.forEach(match => {
          const methodNameMatch = match.match(/function\s+(\w+)/);
          const parametersMatch = match.match(/\(([^)]*)\)/);

          if (methodNameMatch) {
            const methodName = methodNameMatch[1];
            const parametersString = parametersMatch ? parametersMatch[1] : '';

            // パラメータを解析
            const parameters = parametersString
              .split(',')
              .map(param => param.trim())
              .filter(param => param.length > 0)
              .map(param => ({
                name: param,
                type: 'any',
                description: `${param}パラメータ`,
              }));

            methods.push({
              name: methodName,
              description: `${methodName}メソッド`,
              parameters,
              returnType: 'any',
              returnDescription: `${methodName}の実行結果`,
            });
          }
        });
      }

      // パターン2: JSDocコメントからより詳細な情報を抽出
      const jsdocMatches = html.match(/\/\*\*[\s\S]*?\*\/\s*function\s+(\w+)/g);

      if (jsdocMatches) {
        jsdocMatches.forEach(match => {
          const methodNameMatch = match.match(/function\s+(\w+)/);
          if (methodNameMatch) {
            const methodName = methodNameMatch[1];

            // 既存のメソッドがあるかチェック
            const existingMethodIndex = methods.findIndex(
              m => m.name === methodName
            );

            // JSDocから説明を抽出
            const descriptionMatch = match.match(/\*\s*([^@\n\r]+)/);
            const description = descriptionMatch
              ? descriptionMatch[1].trim()
              : `${methodName}メソッド`;

            if (existingMethodIndex >= 0) {
              // 既存のメソッドの説明を更新
              methods[existingMethodIndex].description = description;
            } else {
              // 新しいメソッドとして追加
              methods.push({
                name: methodName,
                description,
                parameters: [],
                returnType: 'any',
                returnDescription: `${methodName}の実行結果`,
              });
            }
          }
        });
      }

      // HTMLにメソッド情報が見つからない場合、例外を投げる
      if (methods.length === 0) {
        throw new Error(
          'Google Apps Scriptライブラリページからメソッド情報を抽出できませんでした。ライブラリが公開されているか、スクリプトIDが正しいか確認してください。'
        );
      }

      return methods;
    } catch (error) {
      console.error('HTMLパースエラー:', error);
      return [];
    }
  }
}
