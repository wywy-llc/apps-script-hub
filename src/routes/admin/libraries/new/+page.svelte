<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import AdminHeader from '$lib/components/AdminHeader.svelte';
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
      submitMessage =
        'ライブラリが正常に登録されました。詳細ページに移動します...';
      // 詳細ページに遷移
      setTimeout(() => {
        goto(`/admin/libraries/${form.id}`);
      }, 1500);
    }
  });

  // バリデーション関数
  function validateForm(formData: FormData): string | null {
    const scriptId = formData.get('scriptId')?.toString();
    const repoUrl = formData.get('repoUrl')?.toString();

    if (!scriptId?.trim()) {
      return 'GAS スクリプトIDを入力してください。';
    }

    if (!repoUrl?.trim()) {
      return 'GitHub リポジトリURLを入力してください。';
    }

    // GitHub リポジトリURL形式の検証
    const githubRepoPattern = /^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+$/;
    if (!githubRepoPattern.test(repoUrl)) {
      return 'GitHub リポジトリURLの形式が正しくありません。「owner/repo」の形式で入力してください。';
    }

    return null;
  }

  function handleCancel() {
    // ライブラリ一覧ページに戻る
    goto('/admin/libraries');
  }

  function handleSignOut() {
    // サインアウト処理
    console.log('サインアウト');
  }
</script>

<svelte:head>
  <title>管理画面 - 新規ライブラリ追加 - AppsScriptHub</title>
  <meta
    name="description"
    content="AppsScriptHub管理者画面 - 新しいライブラリをシステムに登録"
  />
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <AdminHeader onSignOut={handleSignOut} />

  <main class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
    <div class="max-w-3xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">新規ライブラリ追加</h1>
        <p class="mt-2 text-sm text-gray-600">
          GAS スクリプトIDとGitHub リポジトリURLを入力してください。GitHub
          APIから詳細情報を自動取得してデータベースに保存します。
        </p>
      </div>

      <!-- 送信メッセージ -->
      {#if submitMessage}
        <div
          class="mb-6 p-4 rounded-md {submitMessage.includes('正常')
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
        use:enhance={({ formData, cancel }) => {
          isSubmitting = true;
          submitMessage = '';

          return async ({ result, update }) => {
            isSubmitting = false;

            if (result.type === 'failure') {
              submitMessage =
                (result.data as any)?.message || 'エラーが発生しました。';
            } else if (result.type === 'error') {
              submitMessage = 'サーバーエラーが発生しました。';
            }

            // フォームの状態を更新
            await update();
          };
        }}
      >
        <div class="bg-white shadow-md rounded-lg overflow-hidden">
          <div class="px-6 py-8">
            <div class="space-y-10">
              <!-- GAS Script ID -->
              <div>
                <label
                  for="script-id"
                  class="block text-sm font-medium text-gray-700"
                >
                  GAS スクリプトID <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="scriptId"
                  id="script-id"
                  class="block w-full px-1 py-2 mt-1 bg-transparent border-0 border-b-2 border-gray-200 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600"
                  placeholder="1mbq56Ik4-I_4rnVlr9lTxJoXHStkjHYDyMHjmDWiRiJR3MDl-ThHwnbg"
                  required
                  disabled={isSubmitting}
                />
                <p class="mt-2 text-xs text-gray-500">
                  Google Apps
                  Scriptエディタで確認できるライブラリのスクリプトIDを入力してください。
                </p>
              </div>

              <!-- GitHub Repository URL -->
              <div>
                <label
                  for="repo-url"
                  class="block text-sm font-medium text-gray-700"
                >
                  GitHub リポジトリURL <span class="text-red-500">*</span>
                </label>
                <div class="mt-1 flex items-baseline">
                  <span class="text-gray-500 sm:text-sm"
                    >https://github.com/</span
                  >
                  <input
                    type="text"
                    name="repoUrl"
                    id="repo-url"
                    class="block w-full ml-2 px-1 pb-1 bg-transparent border-0 border-b-2 border-gray-200 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600"
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

          <div class="px-6 py-4 bg-gray-50 text-right">
            <button
              type="button"
              onclick={handleCancel}
              disabled={isSubmitting}
              class="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {#if isSubmitting}
                <svg
                  class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
      <div class="mt-12 bg-white shadow-md rounded-lg overflow-hidden">
        <div class="px-6 py-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">使用方法</h2>
          <div class="space-y-4 text-sm text-gray-600">
            <div>
              <h3 class="font-medium text-gray-900">
                1. GAS スクリプトIDの取得
              </h3>
              <p>
                Google Apps
                Scriptエディタで、ライブラリとして公開したいスクリプトのIDをコピーしてください。
              </p>
            </div>
            <div>
              <h3 class="font-medium text-gray-900">
                2. GitHub リポジトリURLの指定
              </h3>
              <p>
                「owner/repo」の形式で入力してください。例: microsoft/TypeScript
              </p>
            </div>
            <div>
              <h3 class="font-medium text-gray-900">3. 自動情報取得</h3>
              <p>GitHub APIから以下の情報を自動取得します:</p>
              <ul class="list-disc list-inside ml-4 mt-2">
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
  <footer class="bg-gray-50 border-t border-gray-200 mt-12">
    <div class="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div class="text-center text-sm text-gray-500">
        &copy; 2025 wywy LLC. All rights reserved.
      </div>
    </div>
  </footer>
</div>
