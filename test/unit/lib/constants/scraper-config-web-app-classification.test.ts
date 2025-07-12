import { describe, expect, it } from 'vitest';
import { extractGasScriptId, isValidGasWebAppUrl } from '../../../../src/lib/helpers/url.js';

describe('Web App Classification Bug Reproduction', () => {
  it('should extract valid web app URLs from Schedules App README', () => {
    const readmeContent = `# Schedules App
**Project currently stalled due to other projects.**

Create and view schedules in a web app. 

Report any bugs you find and tell me what you want to see on the [issues](https://github.com/UplandJacob2/Schedules-App/issues) page

** **

### The app is available at:

https://script.google.com/a/macros/stu.evsck12.com/s/AKfycbzw5nZW2BHmdvVJk0Ru3iRNBVS1Ku9K-NDX5Ncf2gkxyy0OF2ethzaeVwETLMZhrIVl2A/exec

The newest code here is not available at this link. Only the latest stable(ish) release is public.

All data is stored in my Google Drive. The code is run in Google Apps Script.

**Note: I can see any data in your schedules, your email, and password.**

### Testing deployment: 

https://script.google.com/macros/s/AKfycby2WEDnie17ngh3Ra4n-2wvR5u-xnot76eaVXjc97mcw2xjNiQ8Ch9hWHcGTVRD8z1ykw/exec

Bugs are bound to be plentiful, so report them.

** **

### Developing on it yourself

> project is under the [MIT License](https://github.com/UplandJacob2/Schedules-App/blob/main/LICENSE)

Create a Google Apps Script project and copy the files from the \`src\` folder.

> You will also need to create folders in your Google Drive and change the folder IDs in the code yours.

**Feel free to make pull requests.**`;

    // WebアプリURLパターンで検出
    const webAppUrlPattern =
      /https:\/\/script\.google\.com\/(?:a\/)?macros\/(?:[^/]+\/)?s\/([A-Za-z0-9_-]+)\/exec/g;
    const matches = [...readmeContent.matchAll(webAppUrlPattern)];

    expect(matches.length).toBe(2); // 2つのWebアプリURLが検出されるはず

    // 1つ目のURL
    const firstUrl = matches[0][0];
    expect(firstUrl).toBe(
      'https://script.google.com/a/macros/stu.evsck12.com/s/AKfycbzw5nZW2BHmdvVJk0Ru3iRNBVS1Ku9K-NDX5Ncf2gkxyy0OF2ethzaeVwETLMZhrIVl2A/exec'
    );
    expect(isValidGasWebAppUrl(firstUrl)).toBe(true);

    const firstScriptId = extractGasScriptId(firstUrl);
    expect(firstScriptId).toBe(
      'AKfycbzw5nZW2BHmdvVJk0Ru3iRNBVS1Ku9K-NDX5Ncf2gkxyy0OF2ethzaeVwETLMZhrIVl2A'
    );

    // 2つ目のURL
    const secondUrl = matches[1][0];
    expect(secondUrl).toBe(
      'https://script.google.com/macros/s/AKfycby2WEDnie17ngh3Ra4n-2wvR5u-xnot76eaVXjc97mcw2xjNiQ8Ch9hWHcGTVRD8z1ykw/exec'
    );
    expect(isValidGasWebAppUrl(secondUrl)).toBe(true);

    const secondScriptId = extractGasScriptId(secondUrl);
    expect(secondScriptId).toBe(
      'AKfycby2WEDnie17ngh3Ra4n-2wvR5u-xnot76eaVXjc97mcw2xjNiQ8Ch9hWHcGTVRD8z1ykw'
    );
  });

  it('should correctly identify web app URLs regardless of script ID format', () => {
    const webAppUrl1 =
      'https://script.google.com/a/macros/stu.evsck12.com/s/AKfycbzw5nZW2BHmdvVJk0Ru3iRNBVS1Ku9K-NDX5Ncf2gkxyy0OF2ethzaeVwETLMZhrIVl2A/exec';
    const webAppUrl2 =
      'https://script.google.com/macros/s/AKfycby2WEDnie17ngh3Ra4n-2wvR5u-xnot76eaVXjc97mcw2xjNiQ8Ch9hWHcGTVRD8z1ykw/exec';

    // WebアプリURLとして有効であることを確認
    expect(isValidGasWebAppUrl(webAppUrl1)).toBe(true);
    expect(isValidGasWebAppUrl(webAppUrl2)).toBe(true);

    // スクリプトIDが正しく抽出されることを確認
    expect(extractGasScriptId(webAppUrl1)).toBe(
      'AKfycbzw5nZW2BHmdvVJk0Ru3iRNBVS1Ku9K-NDX5Ncf2gkxyy0OF2ethzaeVwETLMZhrIVl2A'
    );
    expect(extractGasScriptId(webAppUrl2)).toBe(
      'AKfycby2WEDnie17ngh3Ra4n-2wvR5u-xnot76eaVXjc97mcw2xjNiQ8Ch9hWHcGTVRD8z1ykw'
    );
  });

  it('should identify script IDs from web app URLs do not start with 1', () => {
    const webAppUrls = [
      'https://script.google.com/a/macros/stu.evsck12.com/s/AKfycbzw5nZW2BHmdvVJk0Ru3iRNBVS1Ku9K-NDX5Ncf2gkxyy0OF2ethzaeVwETLMZhrIVl2A/exec',
      'https://script.google.com/macros/s/AKfycby2WEDnie17ngh3Ra4n-2wvR5u-xnot76eaVXjc97mcw2xjNiQ8Ch9hWHcGTVRD8z1ykw/exec',
    ];

    for (const url of webAppUrls) {
      const scriptId = extractGasScriptId(url);
      expect(scriptId).toBeDefined();
      expect(scriptId!.startsWith('1')).toBe(false); // 1で始まらない
      expect(scriptId!.startsWith('AK')).toBe(true); // AKで始まる
    }
  });
});
