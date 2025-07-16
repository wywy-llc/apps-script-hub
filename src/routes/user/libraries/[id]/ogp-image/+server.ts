import {
  OGP_IMAGE_CONFIG,
  OGP_IMAGE_HEADERS,
  OGP_IMAGE_MESSAGES,
} from '$lib/constants/ogp-image-config.js';
import { APP_CONFIG } from '$lib/constants/app-config.js';
import { db } from '$lib/server/db';
import { library } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

/**
 * 動的OGP画像生成API
 * library名とauthorNameを使用してSNSシェア用の画像を生成
 */
export const GET: RequestHandler = async ({ params }) => {
  try {
    const libraryId = params.id;

    // ライブラリ情報を取得
    const libraryData = await db.select().from(library).where(eq(library.id, libraryId)).limit(1);

    if (!libraryData.length) {
      throw error(404, OGP_IMAGE_MESSAGES.LIBRARY_NOT_FOUND);
    }

    const { name, authorName } = libraryData[0];

    // SVG形式でOGP画像を生成
    const svg = generateOgpSvg(name, authorName);

    return new Response(svg, {
      headers: {
        'Content-Type': OGP_IMAGE_HEADERS.CONTENT_TYPE,
        'Cache-Control': OGP_IMAGE_HEADERS.CACHE_CONTROL,
      },
    });
  } catch (err) {
    console.error(OGP_IMAGE_MESSAGES.GENERATION_ERROR_LOG, err);
    throw error(500, OGP_IMAGE_MESSAGES.GENERATION_FAILED);
  }
};

/**
 * OGP画像のSVGを生成
 */
function generateOgpSvg(title: string, authorName: string): string {
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
        ${escapeXml(displayTitle)}
      </text>
      
      <!-- 作者名（左下） - ロゴの中央に揃える -->
      <text x="${PADDING}" y="${HEIGHT - PADDING - LOGO_SIZE / 2 + FONT_SIZE.AUTHOR / 3}" 
            fill="${COLORS.AUTHOR}" 
            font-size="${FONT_SIZE.AUTHOR}" 
            font-family="Arial, sans-serif"
            dominant-baseline="middle">
        ${OGP_IMAGE_MESSAGES.AUTHOR_PREFIX}${escapeXml(authorName)}
      </text>
      
      <!-- ロゴ（右下） -->
      <g transform="translate(${WIDTH - PADDING - LOGO_SIZE}, ${HEIGHT - PADDING - LOGO_SIZE})">
        <image href="${APP_CONFIG.LOGO_PATH}" width="${LOGO_SIZE}" height="${LOGO_SIZE}" />
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
 * XMLで使用する特殊文字をエスケープ
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
