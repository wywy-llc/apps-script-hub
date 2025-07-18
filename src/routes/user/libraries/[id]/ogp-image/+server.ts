import {
  OGP_IMAGE_CONFIG,
  OGP_IMAGE_HEADERS,
  OGP_IMAGE_MESSAGES,
} from '$lib/constants/ogp-image-config.js';
import { db } from '$lib/server/db';
import { library } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import sharp from 'sharp';
import type { RequestHandler } from './$types';

/**
 * 動的OGP画像生成API
 * library名とauthorNameを使用してSNSシェア用の画像を生成
 */
export const GET: RequestHandler = async ({ params }) => {
  try {
    // Fontconfig警告を抑制する環境変数を設定
    process.env.FONTCONFIG_FILE = '/dev/null';
    process.env.FONTCONFIG_PATH = '/dev/null';

    const libraryId = params.id;

    // ライブラリ情報を取得
    const libraryData = await db.select().from(library).where(eq(library.id, libraryId)).limit(1);

    if (!libraryData.length) {
      throw error(404, OGP_IMAGE_MESSAGES.LIBRARY_NOT_FOUND);
    }

    const { name, authorName } = libraryData[0];

    // PNG画像を直接生成（SVGを使用せず、フォント問題を回避）
    const pngBuffer = await generatePngDirectly(name, authorName);

    return new Response(pngBuffer, {
      headers: {
        'Content-Type': OGP_IMAGE_HEADERS.CONTENT_TYPE,
        'Cache-Control': OGP_IMAGE_HEADERS.CACHE_CONTROL,
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err) {
    console.error(OGP_IMAGE_MESSAGES.GENERATION_ERROR_LOG, err);
    throw error(500, OGP_IMAGE_MESSAGES.GENERATION_FAILED);
  }
};

/**
 * PNG画像を直接生成（フォント問題を回避）
 * SharpライブラリでSVGテキストを生成してPNGに変換
 */
async function generatePngDirectly(title: string, authorName: string): Promise<Buffer> {
  const { WIDTH, HEIGHT, MAX_TITLE_LENGTH, TRUNCATE_SUFFIX } = OGP_IMAGE_CONFIG;

  // タイトルを表示用に調整
  const displayTitle =
    title.length > MAX_TITLE_LENGTH
      ? title.substring(0, MAX_TITLE_LENGTH - TRUNCATE_SUFFIX.length) + TRUNCATE_SUFFIX
      : title;

  console.log('Generating PNG with text - Title:', displayTitle, 'Author:', authorName);

  // SVG内容を文字列として作成
  const svgContent = `
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1a1f36;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#2a2f4a;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- 背景 -->
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bgGradient)" />
      
      <!-- 装飾的な円 -->
      <circle cx="${WIDTH - 100}" cy="100" r="60" fill="rgba(99, 102, 241, 0.1)" />
      <circle cx="100" cy="${HEIGHT - 80}" r="40" fill="rgba(99, 102, 241, 0.1)" />
      
      <!-- タイトル -->
      <text x="60" y="120" font-family="Arial, sans-serif" font-size="56" font-weight="bold" fill="#f5f5f5">
        ${escapeXml(displayTitle)}
      </text>
      
      <!-- 作者名 -->
      <text x="60" y="${HEIGHT - 100}" font-family="Arial, sans-serif" font-size="28" fill="#9ca3af">
        ${escapeXml(OGP_IMAGE_MESSAGES.AUTHOR_PREFIX + authorName)}
      </text>
      
      <!-- サイト名 -->
      <text x="${WIDTH - 260}" y="${HEIGHT - 30}" font-family="Arial, sans-serif" font-size="20" fill="#6366f1">
        ${escapeXml(OGP_IMAGE_MESSAGES.SITE_NAME)}
      </text>
    </svg>
  `;

  // SVGをPNGに変換
  return await sharp(Buffer.from(svgContent)).png().toBuffer();
}

/**
 * XML用の文字エスケープ
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
