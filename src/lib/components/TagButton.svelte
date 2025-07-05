<script lang="ts">
  /**
   * 再利用可能なタグボタンコンポーネント
   * 様々なカラーバリエーションとサイズをサポートし、
   * クリック可能・非クリック可能の両方に対応
   *
   * 使用例:
   * <TagButton>デフォルト</TagButton>
   * <TagButton variant="success" size="md" onclick={handleClick}>クリック可能</TagButton>
   * <TagButton variant="gray" disabled>無効化</TagButton>
   */

  type Variant = 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray' | 'indigo';
  type Size = 'xs' | 'sm' | 'md';

  interface Props {
    /** タグのテキスト */
    children: import('svelte').Snippet;
    /** カラーバリエーション */
    variant?: Variant;
    /** サイズ */
    size?: Size;
    /** クリックハンドラー（指定時はクリック可能になる） */
    onclick?: () => void;
    /** 無効化フラグ */
    disabled?: boolean;
    /** 追加CSSクラス */
    class?: string;
    /** ツールチップテキスト */
    title?: string;
    /** aria-label（アクセシビリティ用） */
    'aria-label'?: string;
  }

  let {
    children,
    variant = 'blue',
    size = 'xs',
    disabled = false,
    onclick,
    class: className = '',
    title,
    'aria-label': ariaLabel,
  }: Props = $props();

  // カラーバリエーション定義
  const variants = {
    blue: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    green: 'bg-green-100 text-green-800 hover:bg-green-200',
    yellow: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    red: 'bg-red-100 text-red-800 hover:bg-red-200',
    purple: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
    gray: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    indigo: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
  };

  // サイズ定義
  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
  };

  // 動的クラス生成
  const baseClasses = 'inline-flex items-center rounded-full font-medium transition-colors';
  const variantClasses = variants[variant];
  const sizeClasses = sizes[size];
  const interactiveClasses = onclick && !disabled ? 'cursor-pointer' : '';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  const combinedClasses = [
    baseClasses,
    variantClasses,
    sizeClasses,
    interactiveClasses,
    disabledClasses,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // クリックハンドラー
  function handleClick() {
    if (!disabled && onclick) {
      onclick();
    }
  }
</script>

{#if onclick}
  <!-- クリック可能なボタンとして描画 -->
  <button
    type="button"
    class={combinedClasses}
    {title}
    aria-label={ariaLabel}
    {disabled}
    onclick={handleClick}
  >
    {@render children()}
  </button>
{:else}
  <!-- 読み取り専用のスパンとして描画 -->
  <span class={combinedClasses} {title} aria-label={ariaLabel}>
    {@render children()}
  </span>
{/if}
