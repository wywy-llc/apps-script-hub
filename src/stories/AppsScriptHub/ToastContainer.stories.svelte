<script module>
  import ToastContainer from '$lib/components/ToastContainer.svelte';
  import { toastStore } from '$lib/stores/toast-store.js';
  import { defineMeta } from '@storybook/addon-svelte-csf';

  // トーストコンテナコンポーネントのStorybook設定
  // 複数のトーストメッセージを管理し、画面右上に表示
  const { Story } = defineMeta({
    title: 'AppsScriptHub/ToastContainer',
    component: ToastContainer,
    tags: ['autodocs'],
    parameters: {
      docs: {
        description: {
          component:
            'トーストメッセージのコンテナコンポーネント。複数のトーストを管理し、画面右上に固定表示します。',
        },
      },
      layout: 'fullscreen',
    },
  });

  // トーストストアをリセットする関数
  function clearToasts() {
    toastStore.clear();
  }

  // サンプルトーストを表示する関数群
  function showSuccessToast() {
    toastStore.success('操作が正常に完了しました');
  }

  function showErrorToast() {
    toastStore.error('エラーが発生しました');
  }

  function showWarningToast() {
    toastStore.warning('注意: この操作は元に戻せません');
  }

  function showInfoToast() {
    toastStore.info('新しい機能が利用可能です');
  }

  function showMultipleToasts() {
    toastStore.success('1つ目のトースト');
    setTimeout(() => toastStore.info('2つ目のトースト'), 500);
    setTimeout(() => toastStore.warning('3つ目のトースト'), 1000);
    setTimeout(() => toastStore.error('4つ目のトースト'), 1500);
  }

  function showManyToasts() {
    for (let i = 1; i <= 7; i++) {
      setTimeout(() => {
        toastStore.info(`トースト ${i}/7`);
      }, i * 200);
    }
  }
</script>

<!-- Basic Example -->
<Story name="Basic">
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="mx-auto max-w-2xl">
      <h1 class="mb-6 text-2xl font-bold">トーストコンテナ - 基本例</h1>
      <p class="mb-8 text-gray-600">
        ボタンをクリックして、異なる種類のトーストメッセージを表示してください。
        トーストは画面右上に表示され、3秒後に自動的に消えます。
      </p>

      <div class="space-y-4">
        <div class="flex flex-wrap gap-4">
          <button
            class="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            onclick={showSuccessToast}
          >
            成功メッセージ
          </button>

          <button
            class="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            onclick={showErrorToast}
          >
            エラーメッセージ
          </button>

          <button
            class="rounded bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700"
            onclick={showWarningToast}
          >
            警告メッセージ
          </button>

          <button
            class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            onclick={showInfoToast}
          >
            情報メッセージ
          </button>
        </div>

        <button
          class="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
          onclick={clearToasts}
        >
          全てクリア
        </button>
      </div>
    </div>

    <!-- トーストコンテナ -->
    <ToastContainer />
  </div>
</Story>

<!-- Multiple Toasts -->
<Story name="Multiple Toasts">
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="mx-auto max-w-2xl">
      <h1 class="mb-6 text-2xl font-bold">複数トースト表示</h1>
      <p class="mb-8 text-gray-600">
        複数のトーストが順次表示される例です。最大5個まで同時表示され、
        それ以上は古いものから削除されます。
      </p>

      <div class="space-y-4">
        <button
          class="rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
          onclick={showMultipleToasts}
        >
          4つのトーストを順次表示
        </button>

        <button
          class="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          onclick={showManyToasts}
        >
          7つのトーストを表示（制限テスト）
        </button>

        <button
          class="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
          onclick={clearToasts}
        >
          全てクリア
        </button>
      </div>
    </div>

    <!-- トーストコンテナ -->
    <ToastContainer />
  </div>
</Story>

<!-- Real Use Case Example -->
<Story name="Real Use Case">
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="mx-auto max-w-2xl">
      <h1 class="mb-6 text-2xl font-bold">実際の使用例</h1>
      <p class="mb-8 text-gray-600">ライブラリ詳細ページでの使用例をシミュレーションします。</p>

      <div class="rounded-lg bg-white p-6 shadow">
        <h2 class="mb-4 text-xl font-semibold">サンプルライブラリ</h2>

        <div class="space-y-4">
          <div>
            <label for="script-id-input" class="mb-1 block text-sm font-medium text-gray-700"
              >スクリプトID</label
            >
            <div class="flex">
              <input
                id="script-id-input"
                type="text"
                value="1234567890abcdefghijk"
                readonly
                class="flex-1 rounded-l border bg-gray-50 p-2 text-sm"
              />
              <button
                class="rounded-r bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                onclick={() => {
                  navigator.clipboard.writeText('1234567890abcdefghijk');
                  toastStore.success('コピーしました');
                }}
              >
                コピー
              </button>
            </div>
          </div>

          <div class="space-x-4">
            <button
              class="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              onclick={() => toastStore.success('データを保存しました')}
            >
              保存
            </button>

            <button
              class="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              onclick={() => toastStore.error('削除に失敗しました')}
            >
              削除（エラーテスト）
            </button>

            <button
              class="rounded bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700"
              onclick={() => toastStore.warning('この操作は元に戻せません')}
            >
              危険な操作
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- トーストコンテナ -->
    <ToastContainer />
  </div>
</Story>

<!-- Empty State -->
<Story name="Empty State">
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="mx-auto max-w-2xl">
      <h1 class="mb-6 text-2xl font-bold">空の状態</h1>
      <p class="mb-8 text-gray-600">
        トーストが表示されていない場合、ToastContainerは何も描画しません。
      </p>

      <button
        class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        onclick={() => toastStore.info('トーストが表示されました')}
      >
        トーストを表示
      </button>
    </div>

    <!-- トーストコンテナ（空の状態） -->
    <ToastContainer />
  </div>
</Story>
