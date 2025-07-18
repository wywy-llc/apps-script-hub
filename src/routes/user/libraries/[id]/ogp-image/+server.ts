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

  // テキストをSVGオーバーレイで描画（シンプルなアプローチ）
  console.log('Title:', displayTitle, 'Author:', authorName);

  try {
    // テキストを含むSVGオーバーレイを作成
    const textOverlaySvg = `
      <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
        <!-- タイトル背景 -->
        <rect x="50" y="50" width="${Math.min(displayTitle.length * 32, WIDTH - 100)}" height="80" fill="#f5f5f5" fill-opacity="0.9" rx="8"/>
        <!-- タイトルテキスト -->
        <text x="60" y="90" fill="#1a1f36" font-size="24" font-weight="bold" font-family="Arial, sans-serif">
          ${displayTitle}
        </text>
        
        <!-- 作者名背景 -->
        <rect x="50" y="${HEIGHT - 120}" width="${Math.min((OGP_IMAGE_MESSAGES.AUTHOR_PREFIX + authorName).length * 16, WIDTH - 100)}" height="40" fill="#9ca3af" fill-opacity="0.8" rx="6"/>
        <!-- 作者名テキスト -->
        <text x="60" y="${HEIGHT - 95}" fill="#ffffff" font-size="18" font-family="Arial, sans-serif">
          ${OGP_IMAGE_MESSAGES.AUTHOR_PREFIX}${authorName}
        </text>
        
        <!-- サイト名背景 -->
        <rect x="${WIDTH - 250}" y="${HEIGHT - 60}" width="200" height="30" fill="#6366f1" fill-opacity="0.7" rx="4"/>
        <!-- サイト名テキスト -->
        <text x="${WIDTH - 240}" y="${HEIGHT - 40}" fill="#ffffff" font-size="16" font-family="Arial, sans-serif">
          ${OGP_IMAGE_MESSAGES.SITE_NAME}
        </text>
      </svg>
    `;

    const textOverlay = Buffer.from(textOverlaySvg, 'utf8');

    // テキストオーバーレイを合成
    basePng = await sharp(basePng)
      .composite([{ input: textOverlay, top: 0, left: 0 }])
      .png()
      .toBuffer();

    console.log('Text overlay with backgrounds successful');
  } catch (textError) {
    console.error('Text overlay failed:', textError);
    // テキスト合成に失敗した場合は背景のみを使用
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
