<script lang="ts">
  import Footer from '$lib/components/Footer.svelte';
  import * as m from '$lib/paraglide/messages.js';

  // 利用規約ページ
  // AppsScriptHubの利用規約を表示
</script>

<svelte:head>
  <title>{m.terms_page_title()} - AppsScriptHub</title>
  <meta name="description" content={m.terms_page_description()} />
</svelte:head>

<main class="min-h-screen bg-gray-50">
  <!-- Header -->
  <header class="bg-white shadow-sm">
    <div class="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between">
        <a href="/" class="text-2xl font-bold text-blue-600">AppsScriptHub</a>
        <nav class="flex space-x-4">
          <a href="/" class="text-gray-600 hover:text-gray-900">{m.libraries_title()}</a>
          <a href="/terms" class="font-medium text-blue-600">{m.terms()}</a>
          <a href="/privacy" class="text-gray-600 hover:text-gray-900">{m.privacy()}</a>
        </nav>
      </div>
    </div>
  </header>

  <!-- Terms Content -->
  <div class="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-4xl">
      <div class="rounded-lg bg-white p-8 shadow-sm">
        <!-- Title -->
        <h1 class="mb-8 text-4xl font-bold text-gray-900">{m.terms_title()}</h1>

        <!-- Last Updated -->
        <div class="mb-8 text-sm text-gray-500">
          {m.last_updated()}: {m.terms_last_updated()}
        </div>

        <!-- Terms Content -->
        <div class="prose prose-lg max-w-none">
          <!-- Introduction -->
          <p class="mb-6">
            {m.terms_introduction()}
          </p>

          <!-- Article 1: 適用 -->
          <h2 id="article-1" class="mt-8 mb-4 text-2xl font-semibold text-gray-900">
            {m.terms_article_1_title()}
          </h2>
          <p class="mb-6">
            {m.terms_article_1_content()}
          </p>

          <!-- Article 2: 利用登録 -->
          <h2 id="article-2" class="mt-8 mb-4 text-2xl font-semibold text-gray-900">
            {m.terms_article_2_title()}
          </h2>
          <p class="mb-4">
            {m.terms_article_2_content_1()}
          </p>
          <ol class="mb-6 list-decimal pl-6">
            <li class="mb-2">{m.terms_article_2_point_1()}</li>
            <li class="mb-2">{m.terms_article_2_point_2()}</li>
            <li class="mb-2">{m.terms_article_2_point_3()}</li>
          </ol>

          <!-- Article 3: ユーザーIDおよびパスワードの管理 -->
          <h2 id="article-3" class="mt-8 mb-4 text-2xl font-semibold text-gray-900">
            {m.terms_article_3_title()}
          </h2>
          <p class="mb-6">
            {m.terms_article_3_content()}
          </p>

          <!-- Article 4: 利用料金および支払方法 -->
          <h2 id="article-4" class="mt-8 mb-4 text-2xl font-semibold text-gray-900">
            {m.terms_article_4_title()}
          </h2>
          <p class="mb-6">
            {m.terms_article_4_content()}
          </p>

          <!-- Article 5: 禁止事項 -->
          <h2 id="article-5" class="mt-8 mb-4 text-2xl font-semibold text-gray-900">
            {m.terms_article_5_title()}
          </h2>
          <p class="mb-4">
            {m.terms_article_5_content_intro()}
          </p>
          <ol class="mb-6 list-decimal pl-6">
            <li class="mb-2">{m.terms_article_5_point_1()}</li>
            <li class="mb-2">{m.terms_article_5_point_2()}</li>
            <li class="mb-2">{m.terms_article_5_point_3()}</li>
            <li class="mb-2">{m.terms_article_5_point_4()}</li>
            <li class="mb-2">{m.terms_article_5_point_5()}</li>
            <li class="mb-2">{m.terms_article_5_point_6()}</li>
            <li class="mb-2">{m.terms_article_5_point_7()}</li>
            <li class="mb-2">{m.terms_article_5_point_8()}</li>
            <li class="mb-2">{m.terms_article_5_point_9()}</li>
            <li class="mb-2">{m.terms_article_5_point_10()}</li>
          </ol>

          <!-- Article 6: 本サービスの提供の停止等 -->
          <h2 id="article-6" class="mt-8 mb-4 text-2xl font-semibold text-gray-900">
            {m.terms_article_6_title()}
          </h2>
          <p class="mb-4">
            {m.terms_article_6_content_intro()}
          </p>
          <ol class="mb-6 list-decimal pl-6">
            <li class="mb-2">{m.terms_article_6_point_1()}</li>
            <li class="mb-2">{m.terms_article_6_point_2()}</li>
            <li class="mb-2">{m.terms_article_6_point_3()}</li>
            <li class="mb-2">{m.terms_article_6_point_4()}</li>
          </ol>

          <!-- Article 7: 利用制限および登録抹消 -->
          <h2 id="article-7" class="mt-8 mb-4 text-2xl font-semibold text-gray-900">
            {m.terms_article_7_title()}
          </h2>
          <p class="mb-4">
            {m.terms_article_7_content_intro()}
          </p>
          <ol class="mb-6 list-decimal pl-6">
            <li class="mb-2">{m.terms_article_7_point_1()}</li>
            <li class="mb-2">{m.terms_article_7_point_2()}</li>
            <li class="mb-2">{m.terms_article_7_point_3()}</li>
          </ol>

          <!-- Article 8: 免責事項 -->
          <h2 id="article-8" class="mt-8 mb-4 text-2xl font-semibold text-gray-900">
            {m.terms_article_8_title()}
          </h2>
          <p class="mb-6">
            {m.terms_article_8_content()}
          </p>

          <!-- Article 9: サービス内容の変更等 -->
          <h2 id="article-9" class="mt-8 mb-4 text-2xl font-semibold text-gray-900">
            {m.terms_article_9_title()}
          </h2>
          <p class="mb-6">
            {m.terms_article_9_content()}
          </p>

          <!-- Article 10: 利用規約の変更 -->
          <h2 id="article-10" class="mt-8 mb-4 text-2xl font-semibold text-gray-900">
            {m.terms_article_10_title()}
          </h2>
          <p class="mb-6">
            {m.terms_article_10_content()}
          </p>

          <!-- Article 11: 個人情報の取扱い -->
          <h2 id="article-11" class="mt-8 mb-4 text-2xl font-semibold text-gray-900">
            {m.terms_article_11_title()}
          </h2>
          <p class="mb-6">
            {m.terms_article_11_content()}
          </p>

          <!-- Article 12: 通知または連絡 -->
          <h2 id="article-12" class="mt-8 mb-4 text-2xl font-semibold text-gray-900">
            {m.terms_article_12_title()}
          </h2>
          <p class="mb-6">
            {m.terms_article_12_content()}
          </p>

          <!-- Article 13: 権利義務の譲渡の禁止 -->
          <h2 id="article-13" class="mt-8 mb-4 text-2xl font-semibold text-gray-900">
            {m.terms_article_13_title()}
          </h2>
          <p class="mb-6">
            {m.terms_article_13_content()}
          </p>

          <!-- Article 14: 準拠法・裁判管轄 -->
          <h2 id="article-14" class="mt-8 mb-4 text-2xl font-semibold text-gray-900">
            {m.terms_article_14_title()}
          </h2>
          <p class="mb-6">
            {m.terms_article_14_content()}
          </p>

          <!-- Contact -->
          <div class="mt-12 rounded-lg bg-gray-50 p-6">
            <h3 class="mb-4 text-lg font-semibold text-gray-900">{m.terms_contact_title()}</h3>
            <p class="text-gray-700">
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
