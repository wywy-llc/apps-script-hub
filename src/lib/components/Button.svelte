<script lang="ts">
  /**
   * 再利用可能なボタンコンポーネント
   * プライマリ、セカンダリ、アウトラインバリアントをサポート
   */

  // Props
  export let variant: 'primary' | 'secondary' | 'outline' = 'primary';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let href: string | undefined = undefined;
  export let disabled = false;
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let fullWidth = false;

  // バリアント別のスタイル定義
  const variantStyles = {
    primary:
      'bg-blue-600 text-white border-transparent hover:bg-blue-700 focus:ring-blue-500',
    secondary:
      'bg-gray-600 text-white border-transparent hover:bg-gray-700 focus:ring-gray-500',
    outline:
      'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-blue-500',
  };

  // サイズ別のスタイル定義
  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  // 共通スタイル
  const baseStyles =
    'inline-flex items-center justify-center rounded-md border font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors';

  // 最終的なクラス名を構築
  $: buttonClasses = [
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    fullWidth ? 'w-full' : '',
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
  ]
    .filter(Boolean)
    .join(' ');
</script>

{#if href}
  <a
    {href}
    class={buttonClasses}
    class:pointer-events-none={disabled}
    {...$$restProps}
  >
    <slot />
  </a>
{:else}
  <button {type} {disabled} class={buttonClasses} {...$$restProps} on:click>
    <slot />
  </button>
{/if}
