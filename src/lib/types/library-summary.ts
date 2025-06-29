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
