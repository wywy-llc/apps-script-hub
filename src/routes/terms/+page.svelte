<script lang="ts">
  import Footer from '$lib/components/Footer.svelte';
  import Header from '$lib/components/Header.svelte';
  import { createFullUrl, getLogoUrl, APP_CONFIG } from '$lib/constants/app-config.js';
  import * as m from '$lib/paraglide/messages.js';

  // 利用規約ページ
  // Apps Script Hubの利用規約を表示
</script>

<svelte:head>
  <title>{m.terms_page_title()} - {APP_CONFIG.SITE_NAME}</title>
  <meta name="description" content={m.terms_page_description()} />
  <meta
    name="keywords"
    content="利用規約, 利用条件, AppsScriptHub, Google Apps Script, GAS, ライブラリ"
  />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content={createFullUrl('/terms')} />
  <meta property="og:title" content={`${m.terms_page_title()} - ${APP_CONFIG.SITE_NAME}`} />
  <meta property="og:description" content={m.terms_page_description()} />
  <meta property="og:image" content={getLogoUrl()} />

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content={createFullUrl('/terms')} />
  <meta property="twitter:title" content={`${m.terms_page_title()} - ${APP_CONFIG.SITE_NAME}`} />
  <meta property="twitter:description" content={m.terms_page_description()} />
  <meta property="twitter:image" content={getLogoUrl()} />

  <!-- Additional SEO Meta Tags -->
  <meta name="author" content="wywy LLC" />
  <link rel="canonical" href={createFullUrl('/terms')} />
</svelte:head>

<!-- Header -->
<Header />

<main class="min-h-screen bg-gray-50">
  <!-- Terms Content -->
  <div class="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-4xl">
      <div class="rounded-lg bg-white p-8 shadow-sm">
        <!-- Title -->
        <h1 class="mb-6 text-3xl font-bold text-gray-900">{m.terms_title()}</h1>

        <!-- Last Updated -->
        <div class="mb-8 text-sm text-gray-500">
          {m.last_updated()}: {m.terms_last_updated()}
        </div>

        <!-- Terms Content -->
        <div class="prose prose-sm max-w-none leading-relaxed text-gray-700">
          <!-- Introduction -->
          <p class="mb-6">
            {m.terms_introduction()}
          </p>

          <!-- Article 1: 適用 -->
          <h2 id="article-1" class="mt-6 mb-3 text-xl font-semibold text-gray-900">
            {m.terms_article_1_title()}
          </h2>
          <p class="mb-5 text-sm">
            {m.terms_article_1_content()}
          </p>

          <!-- Article 2: 利用登録 -->
          <h2 id="article-2" class="mt-6 mb-3 text-xl font-semibold text-gray-900">
            {m.terms_article_2_title()}
          </h2>
          <p class="mb-3 text-sm">
            {m.terms_article_2_content_1()}
          </p>
          <ol class="mb-5 list-decimal pl-5 text-sm">
            <li class="mb-1">{m.terms_article_2_point_1()}</li>
            <li class="mb-1">{m.terms_article_2_point_2()}</li>
            <li class="mb-1">{m.terms_article_2_point_3()}</li>
          </ol>

          <!-- Article 3: ユーザーIDおよびパスワードの管理 -->
          <h2 id="article-3" class="mt-6 mb-3 text-xl font-semibold text-gray-900">
            {m.terms_article_3_title()}
          </h2>
          <p class="mb-5 text-sm">
            {m.terms_article_3_content()}
          </p>

          <!-- Article 4: 利用料金および支払方法 -->
          <h2 id="article-4" class="mt-6 mb-3 text-xl font-semibold text-gray-900">
            {m.terms_article_4_title()}
          </h2>
          <p class="mb-5 text-sm">
            {m.terms_article_4_content()}
          </p>

          <!-- Article 5: 禁止事項 -->
          <h2 id="article-5" class="mt-6 mb-3 text-xl font-semibold text-gray-900">
            {m.terms_article_5_title()}
          </h2>
          <p class="mb-3 text-sm">
            {m.terms_article_5_content_intro()}
          </p>
          <ol class="mb-5 list-decimal pl-5 text-sm">
            <li class="mb-1">{m.terms_article_5_point_1()}</li>
            <li class="mb-1">{m.terms_article_5_point_2()}</li>
            <li class="mb-1">{m.terms_article_5_point_3()}</li>
            <li class="mb-1">{m.terms_article_5_point_4()}</li>
            <li class="mb-1">{m.terms_article_5_point_5()}</li>
            <li class="mb-1">{m.terms_article_5_point_6()}</li>
            <li class="mb-1">{m.terms_article_5_point_7()}</li>
            <li class="mb-1">{m.terms_article_5_point_8()}</li>
            <li class="mb-1">{m.terms_article_5_point_9()}</li>
            <li class="mb-1">{m.terms_article_5_point_10()}</li>
          </ol>

          <!-- Article 6: 本サービスの提供の停止等 -->
          <h2 id="article-6" class="mt-6 mb-3 text-xl font-semibold text-gray-900">
            {m.terms_article_6_title()}
          </h2>
          <p class="mb-3 text-sm">
            {m.terms_article_6_content_intro()}
          </p>
          <ol class="mb-5 list-decimal pl-5 text-sm">
            <li class="mb-1">{m.terms_article_6_point_1()}</li>
            <li class="mb-1">{m.terms_article_6_point_2()}</li>
            <li class="mb-1">{m.terms_article_6_point_3()}</li>
            <li class="mb-1">{m.terms_article_6_point_4()}</li>
          </ol>

          <!-- Article 7: 利用制限および登録抹消 -->
          <h2 id="article-7" class="mt-6 mb-3 text-xl font-semibold text-gray-900">
            {m.terms_article_7_title()}
          </h2>
          <p class="mb-3 text-sm">
            {m.terms_article_7_content_intro()}
          </p>
          <ol class="mb-5 list-decimal pl-5 text-sm">
            <li class="mb-1">{m.terms_article_7_point_1()}</li>
            <li class="mb-1">{m.terms_article_7_point_2()}</li>
            <li class="mb-1">{m.terms_article_7_point_3()}</li>
          </ol>

          <!-- Article 8: 免責事項 -->
          <h2 id="article-8" class="mt-6 mb-3 text-xl font-semibold text-gray-900">
            {m.terms_article_8_title()}
          </h2>
          <p class="mb-5 text-sm">
            {m.terms_article_8_content()}
          </p>

          <!-- Article 9: サービス内容の変更等 -->
          <h2 id="article-9" class="mt-6 mb-3 text-xl font-semibold text-gray-900">
            {m.terms_article_9_title()}
          </h2>
          <p class="mb-5 text-sm">
            {m.terms_article_9_content()}
          </p>

          <!-- Article 10: 利用規約の変更 -->
          <h2 id="article-10" class="mt-6 mb-3 text-xl font-semibold text-gray-900">
            {m.terms_article_10_title()}
          </h2>
          <p class="mb-5 text-sm">
            {m.terms_article_10_content()}
          </p>

          <!-- Article 11: 個人情報の取扱い -->
          <h2 id="article-11" class="mt-6 mb-3 text-xl font-semibold text-gray-900">
            {m.terms_article_11_title()}
          </h2>
          <p class="mb-5 text-sm">
            {m.terms_article_11_content()}
          </p>

          <!-- Article 12: 通知または連絡 -->
          <h2 id="article-12" class="mt-6 mb-3 text-xl font-semibold text-gray-900">
            {m.terms_article_12_title()}
          </h2>
          <p class="mb-5 text-sm">
            {m.terms_article_12_content()}
          </p>

          <!-- Article 13: 権利義務の譲渡の禁止 -->
          <h2 id="article-13" class="mt-6 mb-3 text-xl font-semibold text-gray-900">
            {m.terms_article_13_title()}
          </h2>
          <p class="mb-5 text-sm">
            {m.terms_article_13_content()}
          </p>

          <!-- Article 14: 準拠法・裁判管轄 -->
          <h2 id="article-14" class="mt-6 mb-3 text-xl font-semibold text-gray-900">
            {m.terms_article_14_title()}
          </h2>
          <p class="mb-5 text-sm">
            {m.terms_article_14_content()}
          </p>

          <!-- Contact -->
          <div class="mt-8 rounded-lg bg-gray-50 p-5">
            <h3 class="mb-3 text-base font-semibold text-gray-900">{m.terms_contact_title()}</h3>
            <p class="text-sm text-gray-700">
              {m.terms_contact_content()}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <Footer />
</main>
