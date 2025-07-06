<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import LibraryCard from '$lib/components/LibraryCard.svelte';
  import SearchBox from '$lib/components/SearchBox.svelte';
  import {
    featured_libraries,
    view_all_libraries,
    gas_library_search,
    welcome_user,
    meta_title_home,
    meta_description_home,
    meta_keywords_home,
  } from '$lib/paraglide/messages.js';
  import { createFullUrl, getLogoUrl } from '$lib/constants/app.js';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>{meta_title_home()}</title>
  <meta name="description" content={meta_description_home()} />
  <meta name="keywords" content={meta_keywords_home()} />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content={createFullUrl('HOME')} />
  <meta property="og:title" content={meta_title_home()} />
  <meta property="og:description" content={meta_description_home()} />
  <meta property="og:image" content={getLogoUrl()} />

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content={createFullUrl('HOME')} />
  <meta property="twitter:title" content={meta_title_home()} />
  <meta property="twitter:description" content={meta_description_home()} />
  <meta property="twitter:image" content={getLogoUrl()} />

  <!-- Additional SEO Meta Tags -->
  <meta name="robots" content="index, follow" />
  <meta name="googlebot" content="index, follow" />
  <meta name="author" content="wywy LLC" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#3B82F6" />
  <link rel="canonical" href={createFullUrl('HOME')} />
</svelte:head>

<!-- GASライブラリ検索ヘッダー -->
<section class="bg-gray-50 py-12">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center">
      <h1 class="text-3xl font-bold tracking-tight text-gray-900">{gas_library_search()}</h1>
      {#if data.session?.user}
        <p class="mt-4 text-lg text-gray-600">
          {welcome_user({ userName: data.session.user.name || data.session.user.email || '' })}
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
    </div>

    <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {#each data.featuredLibraries as library (library.id)}
        <LibraryCard {library} librarySummary={library.librarySummary} />
      {/each}
    </div>

    <div class="mt-16 text-center">
      <Button variant="outline" size="lg" href="/user/search">
        {view_all_libraries()}
      </Button>
    </div>
  </div>
</section>
