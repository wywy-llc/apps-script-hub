<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import LibraryCard from '$lib/components/LibraryCard.svelte';
  import SearchBox from '$lib/components/SearchBox.svelte';
  import {
    app_title,
    featured_libraries,
    view_all_libraries,
    gas_library_search,
    welcome_user,
  } from '$lib/paraglide/messages.js';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>{gas_library_search()} - {app_title()}</title>
  <meta name="description" content="Google Apps Scriptライブラリの検索とダウンロード" />
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
