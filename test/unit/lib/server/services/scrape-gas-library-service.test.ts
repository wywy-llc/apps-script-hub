import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ScrapeGASLibraryService } from '../../../../../src/lib/server/services/scrape-gas-library-service.js';
import { GitHubApiUtils } from '../../../../../src/lib/server/utils/github-api-utils.js';

// GitHubApiUtilsをモック
vi.mock('../../../../../src/lib/server/utils/github-api-utils.js', () => ({
  GitHubApiUtils: {
    parseGitHubUrl: vi.fn(),
    fetchRepositoryInfo: vi.fn(),
    fetchReadme: vi.fn(),
    fetchLastCommitDate: vi.fn(),
  },
}));

const mockGitHubApiUtils = GitHubApiUtils as unknown as {
  parseGitHubUrl: ReturnType<typeof vi.fn>;
  fetchRepositoryInfo: ReturnType<typeof vi.fn>;
  fetchReadme: ReturnType<typeof vi.fn>;
  fetchLastCommitDate: ReturnType<typeof vi.fn>;
};

describe('ScrapeGASLibraryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // デフォルトのモック設定
    mockGitHubApiUtils.parseGitHubUrl.mockReturnValue({
      owner: 'test-owner',
      repo: 'test-repo',
    });

    mockGitHubApiUtils.fetchRepositoryInfo.mockResolvedValue({
      name: 'Test Repository',
      description: 'Test description',
      html_url: 'https://github.com/test-owner/test-repo',
      owner: {
        login: 'test-owner',
        html_url: 'https://github.com/test-owner',
      },
      stargazers_count: 10,
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    });

    mockGitHubApiUtils.fetchLastCommitDate.mockResolvedValue(new Date('2023-01-01'));
  });

  describe('Web App検知機能', () => {
    test('.gsファイルが見つかったがスクリプトIDが無い場合、web_appとして保存される', async () => {
      const readmeWithGsFiles = `
        # Monthly Bill Generator Apps Script
        
        [Main.gs](Main.gs) is where most of the logic happens.
        
        Also check [Code.gs](Code.gs) for additional functions.
      `;

      mockGitHubApiUtils.fetchReadme.mockResolvedValue(readmeWithGsFiles);

      const result = await ScrapeGASLibraryService.call('https://github.com/test-owner/test-repo');

      expect(result.success).toBe(true);
      expect(result.data?.scriptType).toBe('web_app');
      expect(result.data?.scriptId).toBe('NO_SCRIPT_ID_DETECTED');
    });

    test('.gsファイルとスクリプトIDが両方ある場合、web_appとして保存される', async () => {
      const readmeWithBoth = `
        # Test Project
        
        スクリプトID: 1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF
        
        [Main.gs](Main.gs) is where most of the logic happens.
      `;

      mockGitHubApiUtils.fetchReadme.mockResolvedValue(readmeWithBoth);

      const result = await ScrapeGASLibraryService.call('https://github.com/test-owner/test-repo');

      expect(result.success).toBe(true);
      expect(result.data?.scriptType).toBe('web_app');
      expect(result.data?.scriptId).toBe(
        '1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF'
      );
    });

    test('スクリプトIDのみで.gsファイルが無い場合、libraryとして保存される', async () => {
      const readmeOnlyScriptId = `
        # Test Library
        
        スクリプトID: 1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF
      `;

      mockGitHubApiUtils.fetchReadme.mockResolvedValue(readmeOnlyScriptId);

      const result = await ScrapeGASLibraryService.call('https://github.com/test-owner/test-repo');

      expect(result.success).toBe(true);
      expect(result.data?.scriptType).toBe('library');
      expect(result.data?.scriptId).toBe(
        '1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF'
      );
    });
  });

  describe('GitHub画像URL誤検知対策', () => {
    test('GitHub画像URLファイル名は誤検知されない', async () => {
      const readmeWithGitHubImages = `
        # Monthly Bill Generator Apps Script
        
        From emails in your inbox: 
        ![Inbox Emails](https://user-images.githubusercontent.com/12219300/103873116-2dd87e00-5084-11eb-8ab6-d4c1b7be8ec6.png)
        
        To sending out:
        ![Composed Email](https://user-images.githubusercontent.com/12219300/103457672-18470b00-4cb6-11eb-9e84-5c69af90e90a.png)
        
        [Main.gs](Main.gs) is where most of the logic happens.
      `;

      mockGitHubApiUtils.fetchReadme.mockResolvedValue(readmeWithGitHubImages);

      const result = await ScrapeGASLibraryService.call('https://github.com/test-owner/test-repo');

      expect(result.success).toBe(true);
      expect(result.data?.scriptType).toBe('web_app');
      expect(result.data?.scriptId).toBe('NO_SCRIPT_ID_DETECTED');

      // GitHub画像URLのファイル名ではないことを確認
      expect(result.data?.scriptId).not.toBe('103873116-2dd87e00-5084-11eb-8ab6-d4c1b7be8ec6');
      expect(result.data?.scriptId).not.toBe('103457672-18470b00-4cb6-11eb-9e84-5c69af90e90a');
    });

    test('GitHub画像URLがあってもスクリプトIDは正しく抽出される', async () => {
      const readmeWithBoth = `
        # Monthly Bill Generator Apps Script
        
        ![Image](https://user-images.githubusercontent.com/12219300/103873116-2dd87e00-5084-11eb-8ab6-d4c1b7be8ec6.png)
        
        スクリプトID: 1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF
      `;

      mockGitHubApiUtils.fetchReadme.mockResolvedValue(readmeWithBoth);

      const result = await ScrapeGASLibraryService.call('https://github.com/test-owner/test-repo');

      expect(result.success).toBe(true);
      expect(result.data?.scriptId).toBe(
        '1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF'
      );
    });
  });

  describe('エラーハンドリング', () => {
    test('READMEが無く、.gsファイルも無い場合はエラー', async () => {
      const emptyReadme = `
        # Regular Project
        
        This is just a regular project without GAS content.
      `;

      mockGitHubApiUtils.fetchReadme.mockResolvedValue(emptyReadme);

      const result = await ScrapeGASLibraryService.call('https://github.com/test-owner/test-repo');

      expect(result.success).toBe(false);
      expect(result.error).toContain(
        'READMEからGASスクリプトIDまたはWebアプリURL、.gsファイルの記載が見つかりませんでした'
      );
    });

    test('無効なGitHub URLの場合はエラー', async () => {
      mockGitHubApiUtils.parseGitHubUrl.mockReturnValue(null);

      const result = await ScrapeGASLibraryService.call('invalid-url');

      expect(result.success).toBe(false);
      expect(result.error).toBe('無効なGitHub URLです');
    });
  });
});
