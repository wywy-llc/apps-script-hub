import { APP_CONFIG } from '$lib/constants/app-config';
import { db } from '$lib/server/db';
import { library } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  // 公開済みの全ライブラリをデータベースから取得
  const publishedLibraries = await db
    .select({
      id: library.id,
      updatedAt: library.updatedAt,
    })
    .from(library)
    .where(eq(library.status, 'published'));

  // サイトマップに含める静的なページのリスト
  const staticPages = ['/user', '/user/search'];

  // XMLボディを生成
  const sitemap = `<?xml version="1.0" encoding="UTF-8" ?>
<urlset
  xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="https://www.w3.org/1999/xhtml"
  xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"
>
  <url>
    <loc>${APP_CONFIG.BASE_URL}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.00</priority>
  </url>
  
  ${staticPages
    .map(
      path => `
  <url>
    <loc>${APP_CONFIG.BASE_URL}${path}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.80</priority>
  </url>`
    )
    .join('')}

  ${publishedLibraries
    .map(
      lib => `
  <url>
    <loc>${APP_CONFIG.BASE_URL}/user/libraries/${lib.id}</loc>
    <lastmod>${new Date(lib.updatedAt).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.90</priority>
  </url>`
    )
    .join('')}
</urlset>`;

  // XMLレスポンスを返す
  return new Response(sitemap.trim(), {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=0, s-maxage=3600', // 1時間キャッシュ
    },
  });
}
