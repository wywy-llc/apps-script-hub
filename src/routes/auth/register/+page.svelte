<script lang="ts">
  import RegisterForm from '$lib/components/RegisterForm.svelte';
  import { APP_CONFIG } from '$lib/constants/app-config.js';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<svelte:head>
  <title>無料アカウント作成 - {APP_CONFIG.SITE_NAME}</title>
</svelte:head>

<div class="flex min-h-screen flex-col justify-center bg-gray-100 py-12 sm:px-6 lg:px-8">
  <div class="sm:mx-auto sm:w-full sm:max-w-md">
    <h1 class="mt-6 text-center text-3xl font-extrabold text-gray-900">{APP_CONFIG.SITE_NAME}</h1>
  </div>

  <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
    <RegisterForm redirectTo={data.redirectTo} />
  </div>
</div>
