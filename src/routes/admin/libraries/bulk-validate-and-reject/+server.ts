import { LIBRARY_STATUS } from '$lib/constants/library-status.js';
import { db } from '$lib/server/db/index.js';
import { library } from '$lib/server/db/schema.js';
import { ValidateLibraryPatternsService } from '$lib/server/services/validate-library-patterns-service.js';
import { json, type RequestHandler } from '@sveltejs/kit';
import { ne, eq } from 'drizzle-orm';

/**
 * 既存ライブラリの一括検証・却下処理APIエンドポイント
 *
 * 最新のスクレイピングパターンに適合しないライブラリを自動的に却下ステータスに更新します。
 */
export const POST: RequestHandler = async () => {
  try {
    console.log('🔍 既存ライブラリの一括パターン検証を開始...');

    // 却下以外のすべてのライブラリを取得
    const libraries = await db
      .select({
        id: library.id,
        name: library.name,
        repositoryUrl: library.repositoryUrl,
        status: library.status,
      })
      .from(library)
      .where(ne(library.status, LIBRARY_STATUS.REJECTED));

    console.log(`📋 検証対象ライブラリ数: ${libraries.length}件`);

    let processedCount = 0;
    let rejectedCount = 0;
    let validCount = 0;
    let errorCount = 0;
    const rejectedLibraries: Array<{ id: string; name: string; reason: string }> = [];

    for (const lib of libraries) {
      try {
        console.log(`🔍 検証中 (${processedCount + 1}/${libraries.length}): ${lib.name}`);

        // パターン検証を実行
        const validationResult = await ValidateLibraryPatternsService.call(lib.repositoryUrl);

        if (!validationResult.isValid) {
          // パターンに適合しない場合は却下ステータスに更新
          await db
            .update(library)
            .set({
              status: LIBRARY_STATUS.REJECTED,
              updatedAt: new Date(),
            })
            .where(eq(library.id, lib.id));

          rejectedCount++;
          const reason =
            validationResult.error || 'スクリプトIDまたはWebアプリパターンが検出されませんでした';
          rejectedLibraries.push({
            id: lib.id,
            name: lib.name,
            reason,
          });

          console.log(`❌ 却下: ${lib.name} - ${reason}`);
        } else {
          validCount++;
          console.log(`✅ 有効: ${lib.name}`);
        }

        processedCount++;

        // リクエスト間隔を制御（GitHub API制限対策）
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        errorCount++;
        console.error(`❌ 検証エラー: ${lib.name}`, error);
      }
    }

    const response = {
      success: true,
      message: `一括検証が完了しました。処理: ${processedCount}件、有効: ${validCount}件、却下: ${rejectedCount}件、エラー: ${errorCount}件`,
      summary: {
        total: libraries.length,
        processed: processedCount,
        valid: validCount,
        rejected: rejectedCount,
        errors: errorCount,
      },
      rejectedLibraries,
    };

    console.log('✅ 一括検証完了:', response.message);

    return json(response);
  } catch (error) {
    console.error('❌ 一括検証エラー:', error);

    return json(
      {
        success: false,
        message: '一括検証中にエラーが発生しました。',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
};
