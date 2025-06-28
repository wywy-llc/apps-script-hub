import { describe, it, expect, vi, beforeEach } from 'vitest';

// モックの環境変数
const mockEnv = vi.hoisted(() => ({
  ADMIN_EMAILS: 'admin@example.com,manager@test.com',
}));

vi.mock('$env/dynamic/private', () => ({
  env: mockEnv,
}));

describe('admin utils', () => {
  beforeEach(async () => {
    // 各テスト前にモジュールをリセット
    vi.resetModules();
    mockEnv.ADMIN_EMAILS = 'admin@example.com,manager@test.com';
  });

  describe('isAdminUser', () => {
    it('管理者メールアドレスの場合はtrueを返す', async () => {
      const { isAdminUser } = await import('./admin');
      expect(isAdminUser('admin@example.com')).toBe(true);
      expect(isAdminUser('manager@test.com')).toBe(true);
    });

    it('大文字小文字を区別しない', async () => {
      const { isAdminUser } = await import('./admin');
      expect(isAdminUser('ADMIN@EXAMPLE.COM')).toBe(true);
      expect(isAdminUser('Admin@Example.com')).toBe(true);
    });

    it('管理者でないメールアドレスの場合はfalseを返す', async () => {
      const { isAdminUser } = await import('./admin');
      expect(isAdminUser('user@example.com')).toBe(false);
      expect(isAdminUser('guest@test.com')).toBe(false);
    });

    it('空の文字列の場合はfalseを返す', async () => {
      const { isAdminUser } = await import('./admin');
      expect(isAdminUser('')).toBe(false);
    });

    it('環境変数が設定されていない場合はfalseを返す', async () => {
      mockEnv.ADMIN_EMAILS = '';
      const { isAdminUser } = await import('./admin');
      expect(isAdminUser('admin@example.com')).toBe(false);
    });
  });

  describe('getAdminEmails', () => {
    it('管理者メールアドレスの配列を返す', async () => {
      const { getAdminEmails } = await import('./admin');
      const emails = getAdminEmails();
      expect(emails).toEqual(['admin@example.com', 'manager@test.com']);
    });

    it('環境変数が設定されていない場合は空配列を返す', async () => {
      mockEnv.ADMIN_EMAILS = '';
      const { getAdminEmails } = await import('./admin');
      expect(getAdminEmails()).toEqual([]);
    });
  });
});
