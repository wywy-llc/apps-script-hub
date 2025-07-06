<script lang="ts">
  import Footer from '$lib/components/Footer.svelte';
  import Header from '$lib/components/Header.svelte';
  import { createFullUrl, getLogoUrl } from '$lib/constants/app.js';
  import * as m from '$lib/paraglide/messages.js';

  // プライバシーポリシーページ
  // AppsScriptHubのプライバシーポリシーを表示
</script>

<svelte:head>
  <title>{m.privacy_page_title()} - AppsScriptHub</title>
  <meta name="description" content={m.privacy_page_description()} />
  <meta
    name="keywords"
    content="プライバシーポリシー, 個人情報保護, AppsScriptHub, Google Apps Script, GAS, ライブラリ"
  />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content={createFullUrl('/privacy')} />
  <meta property="og:title" content={`${m.privacy_page_title()} - AppsScriptHub`} />
  <meta property="og:description" content={m.privacy_page_description()} />
  <meta property="og:image" content={getLogoUrl()} />

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content={createFullUrl('/privacy')} />
  <meta property="twitter:title" content={`${m.privacy_page_title()} - AppsScriptHub`} />
  <meta property="twitter:description" content={m.privacy_page_description()} />
  <meta property="twitter:image" content={getLogoUrl()} />

  <!-- Additional SEO Meta Tags -->
  <meta name="author" content="wywy LLC" />
  <link rel="canonical" href={createFullUrl('/privacy')} />
</svelte:head>

<!-- Header -->
<Header />

<main class="min-h-screen bg-gray-50">
  <!-- Privacy Policy Content -->
  <div class="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-4xl">
      <div class="rounded-lg bg-white p-8 shadow-sm">
        <!-- Title -->
        <h1 class="mb-6 text-3xl font-bold text-gray-900">{m.privacy_title()}</h1>

        <!-- Last Updated -->
        <div class="mb-8 text-sm text-gray-500">
          {m.last_updated()}: {m.privacy_last_updated()}
        </div>

        <!-- Privacy Policy Content -->
        <div class="prose prose-sm max-w-none leading-relaxed text-gray-700">
          <!-- Introduction -->
          <p class="mb-6">
            {m.privacy_introduction()}
          </p>

          <!-- Section 1: 個人情報の収集方法 -->
          <h2 id="section-1" class="mt-6 mb-3 text-xl font-semibold text-gray-900">
            {m.privacy_section_2_title()}
          </h2>
          <p class="mb-3 text-sm">
            {m.privacy_section_2_content()}
          </p>
          <ul class="mb-5 list-disc pl-5 text-sm">
            <li class="mb-1">{m.privacy_section_2_point_1()}</li>
            <li class="mb-1">{m.privacy_section_2_point_2()}</li>
            <li class="mb-1">{m.privacy_section_2_point_3()}</li>
            <li class="mb-1">{m.privacy_section_2_point_4()}</li>
          </ul>

          <!-- Section 2: 個人情報の利用目的 -->
          <h2 id="section-2" class="mt-6 mb-3 text-xl font-semibold text-gray-900">
            {m.privacy_section_3_title()}
          </h2>
          <p class="mb-3 text-sm">
            {m.privacy_section_3_content()}
          </p>
          <ul class="mb-5 list-disc pl-5 text-sm">
            <li class="mb-1">{m.privacy_section_3_point_1()}</li>
            <li class="mb-1">{m.privacy_section_3_point_2()}</li>
            <li class="mb-1">{m.privacy_section_3_point_3()}</li>
            <li class="mb-1">{m.privacy_section_3_point_4()}</li>
            <li class="mb-1">{m.privacy_section_3_point_5()}</li>
            <li class="mb-1">{m.privacy_section_3_point_6()}</li>
          </ul>

          <!-- Section 3: 個人情報の第三者提供 -->
          <h2 id="section-3" class="mt-6 mb-3 text-xl font-semibold text-gray-900">
            {m.privacy_section_4_title()}
          </h2>
          <p class="mb-3 text-sm">
            {m.privacy_section_4_content()}
          </p>
          <ul class="mb-5 list-disc pl-5 text-sm">
            <li class="mb-1">{m.privacy_section_4_point_1()}</li>
            <li class="mb-1">{m.privacy_section_4_point_2()}</li>
            <li class="mb-1">{m.privacy_section_4_point_3()}</li>
            <li class="mb-1">{m.privacy_section_4_point_4()}</li>
          </ul>

          <!-- Section 4: 個人情報の開示・訂正・削除 -->
          <h2 id="section-4" class="mt-6 mb-3 text-xl font-semibold text-gray-900">
            {m.privacy_section_5_title()}
          </h2>
          <p class="mb-5 text-sm">
            {m.privacy_section_5_content()}
          </p>

          <!-- Section 5: 個人情報の安全管理 -->
          <h2 id="section-5" class="mt-6 mb-3 text-xl font-semibold text-gray-900">
            {m.privacy_section_6_title()}
          </h2>
          <p class="mb-5 text-sm">
            {m.privacy_section_6_content()}
          </p>

          <!-- Section 6: Cookie等の使用 -->
          <h2 id="section-6" class="mt-6 mb-3 text-xl font-semibold text-gray-900">
            {m.privacy_section_7_title()}
          </h2>
          <p class="mb-3 text-sm">
            {m.privacy_section_7_content()}
          </p>
          <ul class="mb-5 list-disc pl-5 text-sm">
            <li class="mb-1">{m.privacy_section_7_point_1()}</li>
            <li class="mb-1">{m.privacy_section_7_point_2()}</li>
            <li class="mb-1">{m.privacy_section_7_point_3()}</li>
          </ul>

          <!-- Section 7: アクセス解析ツール -->
          <h2 id="section-7" class="mt-6 mb-3 text-xl font-semibold text-gray-900">
            {m.privacy_section_8_title()}
          </h2>
          <p class="mb-5 text-sm">
            {m.privacy_section_8_content()}
          </p>

          <!-- Section 8: プライバシーポリシーの変更 -->
          <h2 id="section-8" class="mt-6 mb-3 text-xl font-semibold text-gray-900">
            {m.privacy_section_9_title()}
          </h2>
          <p class="mb-5 text-sm">
            {m.privacy_section_9_content()}
          </p>

          <!-- Section 9: お問い合わせ -->
          <h2 id="section-9" class="mt-6 mb-3 text-xl font-semibold text-gray-900">
            {m.privacy_section_10_title()}
          </h2>
          <p class="mb-5 text-sm">
            {m.privacy_section_10_content()}
          </p>

          <!-- Contact -->
          <div class="mt-8 rounded-lg bg-gray-50 p-5">
            <h3 class="mb-3 text-base font-semibold text-gray-900">{m.privacy_contact_title()}</h3>
            <div class="space-y-1 text-sm text-gray-700">
              <p>{m.privacy_contact_company()}</p>
              <p>{m.privacy_contact_address()}</p>
              <p>{m.privacy_contact_web()}</p>
              <p>{m.privacy_contact_email()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <Footer />
</main>
