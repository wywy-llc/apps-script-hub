import {
  OGP_IMAGE_CONFIG,
  OGP_IMAGE_HEADERS,
  OGP_IMAGE_MESSAGES,
} from '$lib/constants/ogp-image-config.js';
import { db } from '$lib/server/db';
import { library } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { readFileSync } from 'fs';
import { join } from 'path';
import sharp from 'sharp';
import type { RequestHandler } from './$types';

// ビルド時にロゴ画像をインポート（Viteが自動的にBase64に変換）
import logoUrl from '$lib/assets/logo.png';

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

    // PNG画像を直接生成（SVGを使用せず、フォント問題を回避）
    const pngBuffer = await convertSvgToPngWithLogo(name, authorName);

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

/**
 * PNG画像を直接生成（フォント問題を回避）
 * Sharpライブラリで背景、テキスト、ロゴを合成
 */
async function convertSvgToPngWithLogo(title: string, authorName: string): Promise<Buffer> {
  const { WIDTH, HEIGHT, LOGO_SIZE, PADDING, MAX_TITLE_LENGTH, TRUNCATE_SUFFIX } = OGP_IMAGE_CONFIG;

  // グラデーション背景を作成
  const backgroundSvg = `
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1a1f36;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#2a2f4a;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)" />
      <circle cx="${WIDTH - 100}" cy="100" r="60" fill="#6366f1" opacity="0.1" />
      <circle cx="100" cy="${HEIGHT - 100}" r="40" fill="#6366f1" opacity="0.1" />
    </svg>
  `;

  // 背景をPNGに変換
  let basePng = await sharp(Buffer.from(backgroundSvg, 'utf8'))
    .png()
    .resize(WIDTH, HEIGHT)
    .toBuffer();

  // タイトルを表示用に調整
  const displayTitle =
    title.length > MAX_TITLE_LENGTH
      ? title.substring(0, MAX_TITLE_LENGTH - TRUNCATE_SUFFIX.length) + TRUNCATE_SUFFIX
      : title;

  // テキストをSVGで描画し、エラー時はボックスでフォールバック
  let textOverlay;
  try {
    // テキストSVGを作成（フォントをシンプルに指定）
    const textSvg = `
      <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
        <text x="60" y="116" fill="#f5f5f5" font-size="56" font-weight="bold" font-family="sans-serif">
          ${escapeXml(displayTitle)}
        </text>
        <text x="60" y="${HEIGHT - 60 - 80 / 2 + 28 / 3}" fill="#9ca3af" font-size="28" font-family="sans-serif">
          ${OGP_IMAGE_MESSAGES.AUTHOR_PREFIX}${escapeXml(authorName)}
        </text>
        <text x="${WIDTH - 60}" y="${HEIGHT - 60 - 80 - 20}" fill="#9ca3af" font-size="20" font-family="sans-serif" text-anchor="end">
          ${OGP_IMAGE_MESSAGES.SITE_NAME}
        </text>
      </svg>
    `;
    textOverlay = Buffer.from(textSvg, 'utf8');

    // テキストを合成
    basePng = await sharp(basePng)
      .composite([{ input: textOverlay, top: 0, left: 0 }])
      .png()
      .toBuffer();

    console.log('Text overlay successful');
  } catch (error) {
    console.error('Text overlay failed, using fallback boxes:', error);

    // フォールバック: 色付きボックスでテキスト領域を示す
    const titleBox = await sharp({
      create: {
        width: Math.min(displayTitle.length * 32, WIDTH - 120),
        height: 70,
        channels: 4,
        background: { r: 245, g: 245, b: 245, alpha: 0.9 },
      },
    })
      .png()
      .toBuffer();

    const authorBox = await sharp({
      create: {
        width: Math.min((OGP_IMAGE_MESSAGES.AUTHOR_PREFIX + authorName).length * 16, WIDTH - 120),
        height: 35,
        channels: 4,
        background: { r: 156, g: 163, b: 175, alpha: 0.8 },
      },
    })
      .png()
      .toBuffer();

    const siteBox = await sharp({
      create: {
        width: Math.min(OGP_IMAGE_MESSAGES.SITE_NAME.length * 12, 200),
        height: 25,
        channels: 4,
        background: { r: 156, g: 163, b: 175, alpha: 0.7 },
      },
    })
      .png()
      .toBuffer();

    // ボックスを合成
    try {
      basePng = await sharp(basePng)
        .composite([
          { input: titleBox, top: 60, left: 60 },
          { input: authorBox, top: HEIGHT - 60 - 80 / 2 - 15, left: 60 },
          { input: siteBox, top: HEIGHT - 60 - 80 - 30, left: WIDTH - 60 - 200 },
        ])
        .png()
        .toBuffer();
    } catch (boxError) {
      console.error('Box overlay also failed:', boxError);
      // ボックス合成にも失敗した場合は背景のみを使用
    }
  }

  let logoBuffer;
  try {
    // logoUrlがファイルパスの場合の処理
    if (typeof logoUrl === 'string' && logoUrl.startsWith('data:')) {
      const base64Data = logoUrl.split(',')[1];
      logoBuffer = Buffer.from(base64Data, 'base64');
    } else if (typeof logoUrl === 'string' && logoUrl.startsWith('/')) {
      // ファイルパスの場合は実際のファイルを読み込み
      const logoPath = join(process.cwd(), logoUrl);
      logoBuffer = readFileSync(logoPath);
    } else {
      // 既にBase64データの場合
      logoBuffer = Buffer.from(logoUrl, 'base64');
    }
  } catch (error) {
    console.error('Logo processing error:', error);
    logoBuffer = await sharp({
      create: {
        width: LOGO_SIZE,
        height: LOGO_SIZE,
        channels: 4,
        background: { r: 99, g: 102, b: 241, alpha: 1 },
      },
    })
      .png()
      .toBuffer();
  }

  // ロゴをリサイズして合成
  let resizedLogo;
  try {
    resizedLogo = await sharp(logoBuffer).resize(LOGO_SIZE, LOGO_SIZE).png().toBuffer();
  } catch (error) {
    console.error('Logo resize error:', error);
    resizedLogo = await sharp({
      create: {
        width: LOGO_SIZE,
        height: LOGO_SIZE,
        channels: 4,
        background: { r: 99, g: 102, b: 241, alpha: 1 },
      },
    })
      .png()
      .toBuffer();
  }

  // ロゴを右下に合成
  return await sharp(basePng)
    .composite([
      {
        input: resizedLogo,
        top: HEIGHT - PADDING - LOGO_SIZE,
        left: WIDTH - PADDING - LOGO_SIZE,
      },
    ])
    .png()
    .toBuffer();
}
