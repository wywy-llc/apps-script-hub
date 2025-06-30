import { describe, expect, test } from 'vitest';
import { generateId } from '../../../../../src/lib/server/utils/generate-id.js';

describe('generateId', () => {
  test('デフォルト接頭辞でIDを生成できる', () => {
    const id = generateId();

    expect(id).toMatch(/^id_\d+_[a-z0-9]{9}$/);
  });

  test('カスタム接頭辞でIDを生成できる', () => {
    const id = generateId('test');

    expect(id).toMatch(/^test_\d+_[a-z0-9]{9}$/);
  });

  test('異なる呼び出しで異なるIDが生成される', () => {
    const id1 = generateId();
    const id2 = generateId();

    expect(id1).not.toBe(id2);
  });

  test('空文字列の接頭辞でもIDを生成できる', () => {
    const id = generateId('');

    expect(id).toMatch(/^_\d+_[a-z0-9]{9}$/);
  });
});
