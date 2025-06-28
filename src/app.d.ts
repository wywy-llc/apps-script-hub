// for information about these interfaces
declare global {
  namespace App {
    interface Locals {
      user: import('$lib/server/auth').SessionValidationResult['user'];
      session: import('$lib/server/auth').SessionValidationResult['session'];
    }
  }

  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      POSTGRES_USER: string;
      POSTGRES_PASSWORD: string;
      POSTGRES_DB: string;
      POSTGRES_TEST_DB: string;
      DATABASE_TEST_URL: string;
      NODE_ENV: string;
      GITHUB_TOKEN: string;
    }
  }
}

export {};
