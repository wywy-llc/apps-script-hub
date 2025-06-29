/**
 * GitHubで利用可能なライセンスタイプの定数定義
 * GitHub Docs: https://docs.github.com/ja/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository#searching-github-by-license-type
 */

export const LICENSE_TYPES = {
  // 不明（ライセンス情報がない場合のデフォルト）
  UNKNOWN: '不明',

  // Academic Free License
  AFL_3_0: 'Academic Free License v3.0',

  // Apache License
  APACHE_2_0: 'Apache License 2.0',

  // Artistic License
  ARTISTIC_2_0: 'Artistic License 2.0',

  // Boost Software License
  BSL_1_0: 'Boost Software License 1.0',

  // BSD Licenses
  BSD_2_CLAUSE: 'BSD 2-Clause "Simplified" License',
  BSD_3_CLAUSE: 'BSD 3-Clause "New" or "Revised" License',
  BSD_3_CLAUSE_CLEAR: 'BSD 3-Clause Clear License',
  BSD_4_CLAUSE: 'BSD 4-Clause "Original" or "Old" License',
  BSD_0_CLAUSE: 'BSD Zero Clause License',

  // Creative Commons Licenses
  CC0_1_0: 'Creative Commons Zero v1.0 Universal',
  CC_BY_4_0: 'Creative Commons Attribution 4.0',
  CC_BY_SA_4_0: 'Creative Commons Attribution Share Alike 4.0',

  // Do What The F*ck You Want To Public License
  WTFPL: 'Do What The F*ck You Want To Public License',

  // Educational Community License
  ECL_2_0: 'Educational Community License v2.0',

  // Eclipse Public License
  EPL_1_0: 'Eclipse Public License 1.0',
  EPL_2_0: 'Eclipse Public License 2.0',

  // European Union Public License
  EUPL_1_1: 'European Union Public License 1.1',

  // GNU Licenses
  AGPL_3_0: 'GNU Affero General Public License v3.0',
  GPL_2_0: 'GNU General Public License v2.0',
  GPL_3_0: 'GNU General Public License v3.0',
  LGPL_2_1: 'GNU Lesser General Public License v2.1',
  LGPL_3_0: 'GNU Lesser General Public License v3.0',

  // ISC License
  ISC: 'ISC License',

  // LaTeX Project Public License
  LPPL_1_3C: 'LaTeX Project Public License v1.3c',

  // Microsoft Public License
  MS_PL: 'Microsoft Public License',

  // MIT License
  MIT: 'MIT License',

  // Mozilla Public License
  MPL_2_0: 'Mozilla Public License 2.0',
} as const;

/**
 * ライセンスタイプの型定義
 */
export type LicenseType = (typeof LICENSE_TYPES)[keyof typeof LICENSE_TYPES];

/**
 * ライセンス名からLICENSE_TYPESの値を取得するマッピング
 * GitHub APIで返される名前とLICENSE_TYPESの値をマッピング
 */
export const LICENSE_NAME_MAPPING: Record<string, LicenseType> = {
  // GitHub APIで返される可能性のある名前とマッピング
  'Academic Free License v3.0': LICENSE_TYPES.AFL_3_0,
  'Apache License 2.0': LICENSE_TYPES.APACHE_2_0,
  'Artistic License 2.0': LICENSE_TYPES.ARTISTIC_2_0,
  'Boost Software License 1.0': LICENSE_TYPES.BSL_1_0,
  'BSD 2-Clause "Simplified" License': LICENSE_TYPES.BSD_2_CLAUSE,
  'BSD 3-Clause "New" or "Revised" License': LICENSE_TYPES.BSD_3_CLAUSE,
  'BSD 3-Clause Clear License': LICENSE_TYPES.BSD_3_CLAUSE_CLEAR,
  'BSD 4-Clause "Original" or "Old" License': LICENSE_TYPES.BSD_4_CLAUSE,
  'BSD Zero Clause License': LICENSE_TYPES.BSD_0_CLAUSE,
  'Creative Commons Zero v1.0 Universal': LICENSE_TYPES.CC0_1_0,
  'Creative Commons Attribution 4.0': LICENSE_TYPES.CC_BY_4_0,
  'Creative Commons Attribution Share Alike 4.0': LICENSE_TYPES.CC_BY_SA_4_0,
  'Do What The F*ck You Want To Public License': LICENSE_TYPES.WTFPL,
  'Educational Community License v2.0': LICENSE_TYPES.ECL_2_0,
  'Eclipse Public License 1.0': LICENSE_TYPES.EPL_1_0,
  'Eclipse Public License 2.0': LICENSE_TYPES.EPL_2_0,
  'European Union Public License 1.1': LICENSE_TYPES.EUPL_1_1,
  'GNU Affero General Public License v3.0': LICENSE_TYPES.AGPL_3_0,
  'GNU General Public License v2.0': LICENSE_TYPES.GPL_2_0,
  'GNU General Public License v3.0': LICENSE_TYPES.GPL_3_0,
  'GNU Lesser General Public License v2.1': LICENSE_TYPES.LGPL_2_1,
  'GNU Lesser General Public License v3.0': LICENSE_TYPES.LGPL_3_0,
  'ISC License': LICENSE_TYPES.ISC,
  'LaTeX Project Public License v1.3c': LICENSE_TYPES.LPPL_1_3C,
  'Microsoft Public License': LICENSE_TYPES.MS_PL,
  'MIT License': LICENSE_TYPES.MIT,
  'Mozilla Public License 2.0': LICENSE_TYPES.MPL_2_0,
};

/**
 * ライセンス名を正規化してLicenseTypeを取得する
 * @param licenseName GitHub APIから取得したライセンス名
 * @returns 正規化されたLicenseType
 */
export function normalizeLicenseName(licenseName: string | undefined): LicenseType {
  if (!licenseName) {
    return LICENSE_TYPES.UNKNOWN;
  }

  return LICENSE_NAME_MAPPING[licenseName] || LICENSE_TYPES.UNKNOWN;
}
