<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { APP_CONFIG } from '$lib/constants/app-config.js';
  import type { ActionData } from './$types';
  import {
    gas_library_add,
    gas_library_add_page_title,
    gas_library_add_description,
    gas_script_id_label,
    gas_script_id_placeholder,
    gas_script_id_help,
    github_repository_url_label,
    github_repository_url_placeholder,
    github_repository_url_help,
    cancel,
    submit_request,
    submitting_request,
    gas_library_add_success,
    add_request_about,
    add_request_flow,
    add_request_flow_description,
    add_request_conditions,
    add_request_conditions_description,
    add_request_conditions_github,
    add_request_conditions_docs,
    add_request_conditions_value,
    add_request_review,
    add_request_review_description,
  } from '$lib/paraglide/messages.js';

  // ユーザー画面 - GASライブラリ追加ページ
  // 登録ユーザーがGASライブラリの新規追加を管理者に申請

  interface Props {
    form?: ActionData;
  }

  let { form = $bindable() }: Props = $props();

  // フォーム送信状態
  let isSubmitting = $state(false);
  let submitMessage = $state('');

  // フォーム送信時の処理
  $effect(() => {
    if (form?.success) {
      submitMessage = gas_library_add_success();
      // 成功時は一定時間後にユーザートップページに遷移
      setTimeout(() => {
        goto('/user');
      }, 3000);
    } else if (form?.error) {
      submitMessage = form.error;
    }
  });

  function handleCancel() {
    // ユーザートップページに戻る
    goto('/user');
  }
</script>

<svelte:head>
  <title>{gas_library_add()} - {APP_CONFIG.SITE_NAME}</title>
  <meta name="description" content="{APP_CONFIG.SITE_NAME} - {gas_library_add()}" />
</svelte:head>

<div class="bg-gray-50">
  <main class="container mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
    <div class="mx-auto max-w-3xl">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">{gas_library_add_page_title()}</h1>
        <p class="mt-2 text-sm text-gray-600">
          {gas_library_add_description()}
        </p>
      </div>

      <!-- 送信メッセージ -->
      {#if submitMessage}
        <div
          class="mb-6 rounded-md p-4 {form?.success
            ? 'bg-green-50 text-green-800'
            : 'bg-red-50 text-red-800'}"
        >
          {submitMessage}
        </div>
      {/if}

      <!-- Library Request Form -->
      <form
        method="POST"
        action="?/submitRequest"
        class="space-y-8"
        use:enhance={() => {
          isSubmitting = true;
          submitMessage = '';

          return async ({ result, update }) => {
            isSubmitting = false;

            if (result.type === 'failure') {
              submitMessage =
                (result.data as { message?: string })?.message || 'エラーが発生しました。';
            } else if (result.type === 'error') {
              submitMessage = 'サーバーエラーが発生しました。';
            }

            // フォームの状態を更新
            await update();
          };
        }}
      >
        <div class="overflow-hidden rounded-lg bg-white shadow-md">
          <div class="px-6 py-8">
            <div class="space-y-10">
              <!-- GAS Script ID -->
              <div>
                <label for="script-id" class="block text-sm font-medium text-gray-700">
                  {gas_script_id_label()} <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="scriptId"
                  id="script-id"
                  class="mt-1 block w-full appearance-none border-0 border-b-2 border-gray-200 bg-transparent px-1 py-2 focus:border-blue-600 focus:ring-0 focus:outline-none"
                  placeholder={gas_script_id_placeholder()}
                  required
                  disabled={isSubmitting}
                />
                <p class="mt-2 text-xs text-gray-500">
                  {gas_script_id_help()}
                </p>
              </div>

              <!-- GitHub Repository URL -->
              <div>
                <label for="repo-url" class="block text-sm font-medium text-gray-700">
                  {github_repository_url_label()} <span class="text-red-500">*</span>
                </label>
                <div class="mt-1 flex items-baseline">
                  <span class="text-gray-500 sm:text-sm">https://github.com/</span>
                  <input
                    type="text"
                    name="repoUrl"
                    id="repo-url"
                    class="ml-2 block w-full appearance-none border-0 border-b-2 border-gray-200 bg-transparent px-1 pb-1 focus:border-blue-600 focus:ring-0 focus:outline-none"
                    placeholder={github_repository_url_placeholder()}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <p class="mt-2 text-xs text-gray-500">
                  {github_repository_url_help()}
                </p>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 px-6 py-4 text-right">
            <button
              type="button"
              onclick={handleCancel}
              disabled={isSubmitting}
              class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cancel()}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              class="ml-3 inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {#if isSubmitting}
                <svg
                  class="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {submitting_request()}
              {:else}
                {submit_request()}
              {/if}
            </button>
          </div>
        </div>
      </form>

      <!-- 追加申請についての説明 -->
      <div class="mt-12 overflow-hidden rounded-lg bg-white shadow-md">
        <div class="px-6 py-8">
          <h2 class="mb-4 text-xl font-semibold text-gray-900">{add_request_about()}</h2>
          <div class="space-y-4 text-sm text-gray-600">
            <div>
              <h3 class="font-medium text-gray-900">1. {add_request_flow()}</h3>
              <p>{add_request_flow_description()}</p>
            </div>
            <div>
              <h3 class="font-medium text-gray-900">2. {add_request_conditions()}</h3>
              <ul class="mt-2 ml-4 list-inside list-disc">
                <li>{add_request_conditions_description()}</li>
                <li>{add_request_conditions_github()}</li>
                <li>{add_request_conditions_docs()}</li>
                <li>{add_request_conditions_value()}</li>
              </ul>
            </div>
            <div>
              <h3 class="font-medium text-gray-900">3. {add_request_review()}</h3>
              <p>{add_request_review_description()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</div>
