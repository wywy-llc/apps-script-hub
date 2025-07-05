<script lang="ts">
  import LibraryDetail from '$lib/components/LibraryDetail.svelte';
  import { copy_count_update_failed } from '$lib/paraglide/messages.js';
  import type { PageData } from './$types.js';

  // ライブラリ詳細ページコンポーネント
  // 特定のGASライブラリの詳細情報、README、メソッド一覧を表示

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  const { library } = data;

  // データベースのコピー回数を表示用の状態として管理
  let displayCopyCount = $state(library.copyCount);

  // localStorageのキー（重複カウント防止用）
  const COPIED_SCRIPTS_KEY = 'copied-script-ids';

  // サーバーサイドでコピー回数を増加
  async function incrementCopyCount() {
    try {
      const response = await fetch(`/user/libraries/${library.id}/copy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        displayCopyCount = data.copyCount;
        markAsCopied();
      }
    } catch (err) {
      console.error(copy_count_update_failed(), err);
    }
  }

  // このスクリプトIDが既にコピーされているかチェック
  function hasBeenCopiedBefore(): boolean {
    if (typeof window === 'undefined') return false;

    const copiedScripts = localStorage.getItem(COPIED_SCRIPTS_KEY);
    if (!copiedScripts) return false;

    try {
      const copiedScriptIds: string[] = JSON.parse(copiedScripts);
      return copiedScriptIds.includes(library.scriptId);
    } catch {
      return false;
    }
  }

  // コピー済みスクリプトIDとしてマーク
  function markAsCopied() {
    if (typeof window === 'undefined') return;

    const copiedScripts = localStorage.getItem(COPIED_SCRIPTS_KEY);
    let copiedScriptIds: string[] = [];

    if (copiedScripts) {
      try {
        copiedScriptIds = JSON.parse(copiedScripts);
      } catch {
        copiedScriptIds = [];
      }
    }

    if (!copiedScriptIds.includes(library.scriptId)) {
      copiedScriptIds.push(library.scriptId);
      localStorage.setItem(COPIED_SCRIPTS_KEY, JSON.stringify(copiedScriptIds));
    }
  }

  // スクリプトIDコピー用のコールバック
  async function handleCopyScriptId() {
    const alreadyCopied = hasBeenCopiedBefore();

    if (!alreadyCopied) {
      // 初回コピー時のみサーバーサイドでカウントを増加
      await incrementCopyCount();
    }
  }
</script>

<svelte:head>
  <title>{library.name} - AppsScriptHub</title>
  <meta name="description" content={library.description} />
</svelte:head>

<LibraryDetail
  {library}
  librarySummary={data.librarySummary}
  isAdminMode={false}
  {displayCopyCount}
  onCopyScriptId={handleCopyScriptId}
/>
