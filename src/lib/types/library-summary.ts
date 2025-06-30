/**
 * ライブラリ要約情報の型定義
 */
export interface LibrarySummary {
  basicInfo: {
    libraryName: {
      ja: string;
      en: string;
    };
    purpose: {
      ja: string;
      en: string;
    };
    targetUsers: {
      ja: string;
      en: string;
    };
    tags: {
      en: string[];
      ja: string[];
    };
  };
  functionality: {
    coreProblem: {
      ja: string;
      en: string;
    };
    mainBenefits: Array<{
      title: {
        ja: string;
        en: string;
      };
      description: {
        ja: string;
        en: string;
      };
    }>;
  };
}

/**
 * ライブラリ要約生成用のパラメータ
 */
export interface LibrarySummaryParams {
  githubUrl: string;
}

/**
 * データベーススキーマに対応したライブラリ要約の型定義
 */
export interface LibrarySummaryRecord {
  id: string;
  libraryId: string;
  libraryNameJa: string | null;
  libraryNameEn: string | null;
  purposeJa: string | null;
  purposeEn: string | null;
  targetUsersJa: string | null;
  targetUsersEn: string | null;
  tagsJa: string[] | null;
  tagsEn: string[] | null;
  coreProblemJa: string | null;
  coreProblemEn: string | null;
  mainBenefits: Array<{
    title: {
      ja: string;
      en: string;
    };
    description: {
      ja: string;
      en: string;
    };
  }> | null;
  createdAt: Date;
  updatedAt: Date;
}
