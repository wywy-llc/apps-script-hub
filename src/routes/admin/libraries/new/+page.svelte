<script lang="ts">
  import AdminHeader from '$lib/components/AdminHeader.svelte';

  // 管理者画面 - 新規ライブラリ追加ページ
  // GitHubリポジトリから情報を自動取得してライブラリを登録

  // フォームデータ
  let formData = {
    libraryName: '',
    scriptId: '',
    repoUrl: '',
    authorUrl: '',
  };

  // フォーム送信状態
  let isSubmitting = false;
  let submitMessage = '';

  function handleSubmit(event: Event) {
    event.preventDefault();

    if (isSubmitting) return;

    isSubmitting = true;
    submitMessage = '';

    // バリデーション
    if (!formData.libraryName.trim()) {
      submitMessage = 'ライブラリ名を入力してください。';
      isSubmitting = false;
      return;
    }

    if (!formData.scriptId.trim()) {
      submitMessage = 'GAS スクリプトIDを入力してください。';
      isSubmitting = false;
      return;
    }

    if (!formData.repoUrl.trim()) {
      submitMessage = 'GitHub リポジトリURLを入力してください。';
      isSubmitting = false;
      return;
    }

    if (!formData.authorUrl.trim()) {
      submitMessage = 'GitHub 作者URLを入力してください。';
      isSubmitting = false;
      return;
    }

    // 実際の実装では API にPOSTリクエストを送信
    setTimeout(() => {
      console.log('新規ライブラリ登録:', formData);
      submitMessage = 'ライブラリが正常に登録されました。';
      isSubmitting = false;

      // フォームリセット
      formData = {
        libraryName: '',
        scriptId: '',
        repoUrl: '',
        authorUrl: '',
      };
    }, 2000);
  }

  function handleCancel() {
    // ライブラリ一覧ページに戻る
    window.location.href = '/admin/libraries';
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
          新しいライブラリをシステムに登録します。GitHubリポジトリから情報を自動で取得します。
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
      <form onsubmit={handleSubmit} class="space-y-8">
        <div class="bg-white shadow-md rounded-lg overflow-hidden">
          <div class="px-6 py-8">
            <div class="space-y-10">
              <!-- Library Name -->
              <div>
                <label
                  for="library-name"
                  class="block text-sm font-medium text-gray-700"
                >
                  ライブラリ名
                </label>
                <input
                  type="text"
                  name="library-name"
                  id="library-name"
                  bind:value={formData.libraryName}
                  class="block w-full px-1 py-2 mt-1 bg-transparent border-0 border-b-2 border-gray-200 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600"
                  placeholder="GasLogger"
                  required
                />
                <p class="mt-2 text-xs text-gray-500">
                  公開されるライブラリの名前です。
                </p>
              </div>

              <!-- GAS Script ID -->
              <div>
                <label
                  for="script-id"
                  class="block text-sm font-medium text-gray-700"
                >
                  GAS スクリプトID
                </label>
                <input
                  type="text"
                  name="script-id"
                  id="script-id"
                  bind:value={formData.scriptId}
                  class="block w-full px-1 py-2 mt-1 bg-transparent border-0 border-b-2 border-gray-200 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600"
                  placeholder="1mbq56Ik4-I_4rnVlr9lTxJoXHStkjHYDyMHjmDWiRiJR3MDl-ThHwnbg"
                  required
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
                  GitHub リポジトリURL
                </label>
                <div class="mt-1 flex items-baseline">
                  <span class="text-gray-500 sm:text-sm"
                    >https://github.com/</span
                  >
                  <input
                    type="text"
                    name="repo-url"
                    id="repo-url"
                    bind:value={formData.repoUrl}
                    class="block w-full ml-2 px-1 pb-1 bg-transparent border-0 border-b-2 border-gray-200 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600"
                    placeholder="wywy-llc/apps-script-hub"
                    required
                  />
                </div>
              </div>

              <!-- GitHub Author URL -->
              <div>
                <label
                  for="author-url"
                  class="block text-sm font-medium text-gray-700"
                >
                  GitHub 作者URL
                </label>
                <div class="mt-1 flex items-baseline">
                  <span class="text-gray-500 sm:text-sm"
                    >https://github.com/</span
                  >
                  <input
                    type="text"
                    name="author-url"
                    id="author-url"
                    bind:value={formData.authorUrl}
                    class="block w-full ml-2 px-1 pb-1 bg-transparent border-0 border-b-2 border-gray-200 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600"
                    placeholder="wywy-llc"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="px-6 py-4 bg-gray-50 text-right">
            <button
              type="button"
              onclick={handleCancel}
              class="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '登録中...' : '登録'}
            </button>
          </div>
        </div>
      </form>
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
