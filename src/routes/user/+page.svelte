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
  
  // ユーザーダッシュボードコンポーネント
  // ログイン済みユーザー向けのダッシュボードページ

  // 注目のライブラリサンプルデータ
  const featuredLibraries = [
    {
      id: 1,
      name: 'GasLogger',
      description:
        'スプレッドシートやCloud Loggingに簡単・高機能なログ出力機能を追加します。デバッグ効率を飛躍的に向上させます。',
      tags: ['Logging', 'Utility'],
      author: 'gas-developer',
      lastUpdated: '2025/05/28',
      stars: 847,
      downloads: 12500,
    },
    {
      id: 2,
      name: 'GasHtml',
      description:
        'HTMLテンプレートエンジン。サーバーサイドで動的にHTMLを生成し、複雑なWebアプリケーションの構築をサポートします。',
      tags: ['WebApp', 'HTML'],
      author: 'html-master',
      lastUpdated: '2025/04/15',
      stars: 623,
      downloads: 8900,
    },
    {
      id: 3,
      name: 'GasTest',
      description:
        'GASプロジェクトのための軽量なユニットテストフレームワーク。テスト駆動開発(TDD)をGASで実現可能にします。',
      tags: ['Testing', 'Utility'],
      author: 'test-ninja',
      lastUpdated: '2025/03/30',
      stars: 1205,
      downloads: 15600,
    },
    {
      id: 4,
      name: 'GasDateFormatter',
      description:
        'Moment.jsライクなシンタックスで、GASの日時オブジェクトを簡単にフォーマット。タイムゾーンの扱いもサポートします。',
      tags: ['Date', 'Format', 'Utility'],
      author: 'date-wizard',
      lastUpdated: '2025/02/20',
      stars: 392,
      downloads: 6800,
    },
    {
      id: 5,
      name: 'GasCalendarSync',
      description:
        'GoogleカレンダーとGoogleスプレッドシートを双方向同期。イベント管理を効率化し、チーム連携を強化します。',
      tags: ['Calendar', 'Spreadsheet', 'API'],
      author: 'sync-expert',
      lastUpdated: '2025/01/10',
      stars: 758,
      downloads: 11200,
    },
    {
      id: 6,
      name: 'GasMailTemplate',
      description:
        'Gmail送信用のテンプレートエンジン。HTMLメール、添付ファイル、一括送信に対応した高機能メール送信ライブラリ。',
      tags: ['Email', 'Template', 'API'],
      author: 'mail-pro',
      lastUpdated: '2024/12/25',
      stars: 534,
      downloads: 7400,
    },
  ];
</script>

<svelte:head>
  <title>ダッシュボード - {app_title()}</title>
  <meta name="description" content="ユーザーダッシュボード" />
</svelte:head>

<!-- ユーザーダッシュボードヘッダー -->
<section class="py-12 bg-gray-50">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center">
      <h1 class="text-3xl font-bold tracking-tight text-gray-900">
        ダッシュボード
      </h1>
      {#if data.session?.user}
        <p class="mt-4 text-lg text-gray-600">
          ようこそ、{data.session.user.name || data.session.user.email}さん
        </p>
      {/if}
    </div>
    <div class="mt-8 max-w-xl mx-auto">
      <SearchBox />
    </div>
  </div>
</section>

<!-- 注目のライブラリセクション -->
<section class="py-16 sm:py-24 bg-white">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-12">
      <h2 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        {featured_libraries()}
      </h2>
      <p class="mt-4 text-lg text-gray-600">
        {featured_description()}
      </p>
    </div>

    <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {#each featuredLibraries as library}
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
  <div
    class="container mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8 text-center"
  >
    <h2 class="text-3xl font-bold tracking-tight text-gray-900">
      何をしますか？
    </h2>
    <p class="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
      ライブラリの検索や、あなたの作品を共有してください
    </p>
    <div class="mt-8 flex justify-center space-x-4">
      <Button variant="primary" size="lg" href="/user/search">
        ライブラリを検索
      </Button>
      <Button variant="outline" size="lg" href="/contribute">
        ライブラリを共有
      </Button>
    </div>
  </div>
</section>