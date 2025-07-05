<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import * as m from '$lib/paraglide/messages.js';
  import Footer from '$lib/components/Footer.svelte';
  import type { ActionData } from './$types';

  // 管理者画面 - 新規ライブラリ追加ページ
  // GitHubリポジトリから情報を自動取得してライブラリを登録

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
      submitMessage = m.library_registration_success();
      // 詳細ページに遷移
      setTimeout(() => {
        goto(`/admin/libraries/${form.id}`);
      }, 1500);
    }
  });

  function handleCancel() {
    // ライブラリ一覧ページに戻る
    goto('/admin/libraries');
  }
</script>

<svelte:head>
  <title>{m.library_registration_title()} - AppsScriptHub</title>
  <meta name="description" content="AppsScriptHub admin - Register new libraries to the system" />
</svelte:head>

<div class="bg-gray-50">
  <main class="container mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
    <div class="mx-auto max-w-3xl">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">{m.library_registration_title()}</h1>
        <p class="mt-2 text-sm text-gray-600">
          GAS スクリプトIDとGitHub リポジトリURLを入力してください。GitHub
          APIから詳細情報を自動取得してデータベースに保存します。
        </p>
      </div>

      <!-- 送信メッセージ -->
      {#if submitMessage}
        <div
          class="mb-6 rounded-md p-4 {submitMessage.includes('正常')
            ? 'bg-green-50 text-green-800'
            : 'bg-red-50 text-red-800'}"
        >
          {submitMessage}
        </div>
      {/if}

      <!-- New Library Form -->
      <form
        method="POST"
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
                  GAS スクリプトID <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="scriptId"
                  id="script-id"
                  class="mt-1 block w-full appearance-none border-0 border-b-2 border-gray-200 bg-transparent px-1 py-2 focus:border-blue-600 focus:ring-0 focus:outline-none"
                  placeholder="1mbq56Ik4-I_4rnVlr9lTxJoXHStkjHYDyMHjmDWiRiJR3MDl-ThHwnbg"
                  required
                  disabled={isSubmitting}
                />
                <p class="mt-2 text-xs text-gray-500">
                  Google Apps Scriptエディタで確認できるライブラリのスクリプトIDを入力してください。
                </p>
              </div>

              <!-- GitHub Repository URL -->
              <div>
                <label for="repo-url" class="block text-sm font-medium text-gray-700">
                  GitHub リポジトリURL <span class="text-red-500">*</span>
                </label>
                <div class="mt-1 flex items-baseline">
                  <span class="text-gray-500 sm:text-sm">https://github.com/</span>
                  <input
                    type="text"
                    name="repoUrl"
                    id="repo-url"
                    class="ml-2 block w-full appearance-none border-0 border-b-2 border-gray-200 bg-transparent px-1 pb-1 focus:border-blue-600 focus:ring-0 focus:outline-none"
                    placeholder="microsoft/TypeScript"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <p class="mt-2 text-xs text-gray-500">
                  「owner/repo」の形式で入力してください。GitHub
                  APIから詳細情報（名前、説明、README等）を自動取得します。
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
              キャンセル
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
                登録中...
              {:else}
                登録
              {/if}
            </button>
          </div>
        </div>
      </form>

      <!-- 使用方法の説明 -->
      <div class="mt-12 overflow-hidden rounded-lg bg-white shadow-md">
        <div class="px-6 py-8">
          <h2 class="mb-4 text-xl font-semibold text-gray-900">使用方法</h2>
          <div class="space-y-4 text-sm text-gray-600">
            <div>
              <h3 class="font-medium text-gray-900">1. GAS スクリプトIDの取得</h3>
              <p>
                Google Apps
                Scriptエディタで、ライブラリとして公開したいスクリプトのIDをコピーしてください。
              </p>
            </div>
            <div>
              <h3 class="font-medium text-gray-900">2. GitHub リポジトリURLの指定</h3>
              <p>「owner/repo」の形式で入力してください。例: microsoft/TypeScript</p>
            </div>
            <div>
              <h3 class="font-medium text-gray-900">3. 自動情報取得</h3>
              <p>GitHub APIから以下の情報を自動取得します:</p>
              <ul class="mt-2 ml-4 list-inside list-disc">
                <li>ライブラリ名</li>
                <li>説明文</li>
                <li>作者情報</li>
                <li>README内容</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <!-- Footer -->
  <Footer variant="admin" />
</div>
