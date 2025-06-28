<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import LibraryCard from '$lib/components/LibraryCard.svelte';
  import SearchBox from '$lib/components/SearchBox.svelte';
  import {
    app_title,
    featured_description,
    featured_libraries,
    view_all_libraries,
  } from '$lib/paraglide/messages.js';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  // GASライブラリ検索ページコンポーネント
  // ログイン済みユーザー向けのライブラリ検索ページ

  // 注目のライブラリサンプルデータ（データベーススキーマに合わせた形式）
  const featuredLibraries = [
    {
      id: 'featured-1',
      name: 'GasLogger',
      status: 'published' as const,
      scriptId: '1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF',
      repositoryUrl: 'https://github.com/gas-developer/gas-logger',
      authorUrl: 'https://github.com/gas-developer',
      authorName: 'gas-developer',
      description:
        'スプレッドシートやCloud Loggingに簡単・高機能なログ出力機能を追加します。デバッグ効率を飛躍的に向上させます。',
      readmeContent: 'GasLogger README content...',
      starCount: 847,
      copyCount: 245,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-05-28'),
    },
    {
      id: 'featured-2',
      name: 'GasHtml',
      status: 'published' as const,
      scriptId: '2C8FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF',
      repositoryUrl: 'https://github.com/html-master/gas-html',
      authorUrl: 'https://github.com/html-master',
      authorName: 'html-master',
      description:
        'HTMLテンプレートエンジン。サーバーサイドで動的にHTMLを生成し、複雑なWebアプリケーションの構築をサポートします。',
      readmeContent: 'GasHtml README content...',
      starCount: 623,
      copyCount: 182,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-04-15'),
    },
    {
      id: 'featured-3',
      name: 'GasTest',
      status: 'published' as const,
      scriptId: '3D9FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF',
      repositoryUrl: 'https://github.com/test-ninja/gas-test',
      authorUrl: 'https://github.com/test-ninja',
      authorName: 'test-ninja',
      description:
        'GASプロジェクトのための軽量なユニットテストフレームワーク。テスト駆動開発(TDD)をGASで実現可能にします。',
      readmeContent: 'GasTest README content...',
      starCount: 1205,
      copyCount: 398,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-03-30'),
    },
    {
      id: 'featured-4',
      name: 'GasDateFormatter',
      status: 'published' as const,
      scriptId: '4E0FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF',
      repositoryUrl: 'https://github.com/date-wizard/gas-date-formatter',
      authorUrl: 'https://github.com/date-wizard',
      authorName: 'date-wizard',
      description:
        'Moment.jsライクなシンタックスで、GASの日時オブジェクトを簡単にフォーマット。タイムゾーンの扱いもサポートします。',
      readmeContent: 'GasDateFormatter README content...',
      starCount: 392,
      copyCount: 128,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-02-20'),
    },
    {
      id: 'featured-5',
      name: 'GasCalendarSync',
      status: 'published' as const,
      scriptId: '5F1FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF',
      repositoryUrl: 'https://github.com/sync-expert/gas-calendar-sync',
      authorUrl: 'https://github.com/sync-expert',
      authorName: 'sync-expert',
      description:
        'GoogleカレンダーとGoogleスプレッドシートを双方向同期。イベント管理を効率化し、チーム連携を強化します。',
      readmeContent: 'GasCalendarSync README content...',
      starCount: 758,
      copyCount: 267,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-10'),
    },
    {
      id: 'featured-6',
      name: 'GasMailTemplate',
      status: 'published' as const,
      scriptId: '6G2FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF',
      repositoryUrl: 'https://github.com/mail-pro/gas-mail-template',
      authorUrl: 'https://github.com/mail-pro',
      authorName: 'mail-pro',
      description:
        'Gmail送信用のテンプレートエンジン。HTMLメール、添付ファイル、一括送信に対応した高機能メール送信ライブラリ。',
      readmeContent: 'GasMailTemplate README content...',
      starCount: 534,
      copyCount: 156,
      createdAt: new Date('2024-12-01'),
      updatedAt: new Date('2024-12-25'),
    },
  ];
</script>

<svelte:head>
  <title>GASライブラリ検索 - {app_title()}</title>
  <meta name="description" content="Google Apps Scriptライブラリの検索とダウンロード" />
</svelte:head>

<!-- GASライブラリ検索ヘッダー -->
<section class="bg-gray-50 py-12">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center">
      <h1 class="text-3xl font-bold tracking-tight text-gray-900">GASライブラリ検索</h1>
      {#if data.session?.user}
        <p class="mt-4 text-lg text-gray-600">
          ようこそ、{data.session.user.name || data.session.user.email}さん
        </p>
      {/if}
    </div>
    <div class="mx-auto mt-8 max-w-xl">
      <SearchBox />
    </div>
  </div>
</section>

<!-- 注目のライブラリセクション -->
<section class="bg-white py-16 sm:py-24">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <div class="mb-12 text-center">
      <h2 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        {featured_libraries()}
      </h2>
      <p class="mt-4 text-lg text-gray-600">
        {featured_description()}
      </p>
    </div>

    <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {#each featuredLibraries as library (library.id)}
        <LibraryCard {library} />
      {/each}
    </div>

    <div class="mt-16 text-center">
      <Button variant="outline" size="lg" href="/user/search">
        {view_all_libraries()}
      </Button>
    </div>
  </div>
</section>

<!-- ユーザーアクションセクション -->
<section class="bg-gray-50">
  <div class="container mx-auto px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-24">
    <h2 class="text-3xl font-bold tracking-tight text-gray-900">何をしますか？</h2>
    <p class="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
      ライブラリの検索や、あなたの作品を共有してください
    </p>
    <div class="mt-8 flex justify-center space-x-4">
      <Button variant="primary" size="lg" href="/user/search">詳細検索</Button>
      <Button variant="outline" size="lg" href="/contribute">ライブラリを共有</Button>
    </div>
  </div>
</section>
