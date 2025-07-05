import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import { overwriteGetLocale } from './src/lib/paraglide/runtime.js';

// テスト環境では言語を英語に固定
overwriteGetLocale(() => 'en');

// required for svelte5 + jsdom as jsdom does not support matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  enumerable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// add more mocks here if you need them
