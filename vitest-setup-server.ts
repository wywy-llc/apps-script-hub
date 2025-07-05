import { overwriteGetLocale } from './src/lib/paraglide/runtime.js';

// テスト環境では言語を英語に固定
overwriteGetLocale(() => 'en');
