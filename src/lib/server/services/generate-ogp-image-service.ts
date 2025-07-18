import { OGP_IMAGE_CONFIG, OGP_IMAGE_MESSAGES } from '$lib/constants/ogp-image-config.js';
import { getLogoUrl } from '$lib/constants/app-config.js';
import { ServiceErrorUtil } from '$lib/server/utils/service-error-util.js';
import { unlink, writeFile } from 'fs/promises';
import { join } from 'path';

/**
 * OGP画像生成サービス
 *
 * 動作原理:
 * 1. SVG形式でOGP画像を生成
 * 2. 静的ファイルとしてstatic/ogp-imagesディレクトリに保存
 * 3. 既存ファイルがある場合は上書き（ファイル蓄積を防ぐ）
 * 4. Twitter Card Preview対応のSVG形式で出力
 *
 * 使用例:
 * ```typescript
 * const imagePath = await GenerateOgpImageService.call({
 *   libraryId: 'abc123',
 *   title: 'My Library',
 *   authorName: 'Author Name'
 * });
 * console.log(`OGP画像が生成されました: ${imagePath}`);
 * ```
 */
export class GenerateOgpImageService {
  /**
   * OGP画像を生成して保存する
   * @param params 生成パラメータ
   * @param params.libraryId ライブラリID
   * @param params.title ライブラリ名
   * @param params.authorName 作者名
   * @returns 生成された画像のパス
   */
  static async call(params: {
    libraryId: string;
    title: string;
    authorName: string;
  }): Promise<string> {
    const { libraryId, title, authorName } = params;

    ServiceErrorUtil.assertCondition(
      !!libraryId,
      'ライブラリIDが必要です',
      'GenerateOgpImageService.call'
    );

    ServiceErrorUtil.assertCondition(!!title, 'タイトルが必要です', 'GenerateOgpImageService.call');

    ServiceErrorUtil.assertCondition(
      !!authorName,
      '作者名が必要です',
      'GenerateOgpImageService.call'
    );

    try {
      // SVG形式でOGP画像を生成
      const svgContent = this.generateOgpSvg(title, authorName);

      // 出力ディレクトリとファイルパスを設定
      const outputDir = join(process.cwd(), 'static', 'ogp-images');
      const outputPath = join(outputDir, `${libraryId}.svg`);

      // ディレクトリが存在しない場合は作成
      await this.ensureDirectoryExists(outputDir);

      // 既存ファイルがある場合は削除（上書き処理）
      try {
        await unlink(outputPath);
        console.log(`既存のOGP画像を削除: ${outputPath}`);
      } catch (error) {
        // ファイルが存在しない場合は無視
        if (error instanceof Error && !error.message.includes('ENOENT')) {
          console.warn(`OGP画像削除警告: ${error.message}`);
        }
      }

      // 新しいSVGファイルを作成
      await writeFile(outputPath, svgContent, 'utf8');
      console.log(`OGP画像を生成: ${outputPath}`);

      // 相対パスを返す
      return `/ogp-images/${libraryId}.svg`;
    } catch (error) {
      console.error(OGP_IMAGE_MESSAGES.GENERATION_ERROR_LOG, error);
      throw new Error(OGP_IMAGE_MESSAGES.GENERATION_FAILED);
    }
  }

  /**
   * ディレクトリが存在することを確認し、なければ作成する
   * @private
   */
  private static async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      const { mkdir } = await import('fs/promises');
      await mkdir(dirPath, { recursive: true });
    } catch (error) {
      console.error('ディレクトリ作成エラー:', error);
      throw error;
    }
  }

  /**
   * OGP画像のSVGを生成
   * @private
   */
  private static generateOgpSvg(title: string, authorName: string): string {
    const {
      WIDTH,
      HEIGHT,
      FONT_SIZE,
      PADDING,
      LOGO_SIZE,
      COLORS,
      MAX_TITLE_LENGTH,
      TRUNCATE_SUFFIX,
    } = OGP_IMAGE_CONFIG;

    // タイトルを適切な長さに調整
    const displayTitle =
      title.length > MAX_TITLE_LENGTH
        ? title.substring(0, MAX_TITLE_LENGTH - TRUNCATE_SUFFIX.length) + TRUNCATE_SUFFIX
        : title;

    return `
      <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="backgroundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${COLORS.BACKGROUND_SECONDARY};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${COLORS.BACKGROUND_GRADIENT_END};stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- 背景 -->
        <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#backgroundGradient)" />
        
        <!-- 装飾的な背景パターン -->
        <circle cx="${WIDTH - 100}" cy="100" r="60" fill="${COLORS.ACCENT}" opacity="0.1" />
        <circle cx="100" cy="${HEIGHT - 100}" r="40" fill="${COLORS.ACCENT}" opacity="0.1" />
        
        <!-- タイトル（左上） -->
        <text x="${PADDING}" y="${PADDING + FONT_SIZE.TITLE}" 
              fill="${COLORS.TITLE}" 
              font-size="${FONT_SIZE.TITLE}" 
              font-weight="bold" 
              font-family="Arial, sans-serif">
          ${this.escapeXml(displayTitle)}
        </text>
        
        <!-- 作者名（左下） - ロゴの中央に揃える -->
        <text x="${PADDING}" y="${HEIGHT - PADDING - LOGO_SIZE / 2 + FONT_SIZE.AUTHOR / 3}" 
              fill="${COLORS.AUTHOR}" 
              font-size="${FONT_SIZE.AUTHOR}" 
              font-family="Arial, sans-serif"
              dominant-baseline="middle">
          ${OGP_IMAGE_MESSAGES.AUTHOR_PREFIX}${this.escapeXml(authorName)}
        </text>
        
        <!-- ロゴ（右下） -->
        <g transform="translate(${WIDTH - PADDING - LOGO_SIZE}, ${HEIGHT - PADDING - LOGO_SIZE})">
          <image href="${getLogoUrl()}" width="${LOGO_SIZE}" height="${LOGO_SIZE}" />
        </g>
        
        <!-- サイト名 -->
        <text x="${WIDTH - PADDING}" y="${HEIGHT - PADDING - LOGO_SIZE - 20}" 
              fill="${COLORS.AUTHOR}" 
              font-size="${FONT_SIZE.SITE_NAME}" 
              font-family="Arial, sans-serif" 
              text-anchor="end">
          ${OGP_IMAGE_MESSAGES.SITE_NAME}
        </text>
      </svg>
    `;
  }

  /**
   * 指定されたライブラリIDのOGP画像を削除する
   * @param libraryId ライブラリID
   */
  static async deleteOgpImage(libraryId: string): Promise<void> {
    ServiceErrorUtil.assertCondition(
      !!libraryId,
      'ライブラリIDが必要です',
      'GenerateOgpImageService.deleteOgpImage'
    );

    try {
      const outputDir = join(process.cwd(), 'static', 'ogp-images');
      const outputPath = join(outputDir, `${libraryId}.svg`);

      await unlink(outputPath);
      console.log(`OGP画像を削除: ${outputPath}`);
    } catch (error) {
      // ファイルが存在しない場合は無視
      if (error instanceof Error && !error.message.includes('ENOENT')) {
        console.warn(`OGP画像削除警告: ${error.message}`);
      }
    }
  }

  /**
   * XMLで使用する特殊文字をエスケープ
   * @private
   */
  private static escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
