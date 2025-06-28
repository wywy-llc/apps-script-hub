import type { Locale } from '$lib';
import {
  extractLocaleFromRequest,
  overwriteServerAsyncLocalStorage,
} from '$lib/paraglide/runtime.js';
import * as auth from '$lib/server/auth';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { AsyncLocalStorage } from 'node:async_hooks';
import { SvelteKitAuth } from '@auth/sveltekit';
import Google from '@auth/sveltekit/providers/google';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { nanoid } from 'nanoid';
import { eq } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
// import { isAdminUser } from '$lib/server/admin';

const handleAuth: Handle = async ({ event, resolve }) => {
  // Auth.jsのセッション情報を取得
  const authSession = await event.locals.auth();

  if (authSession?.user?.email) {
    // Auth.jsセッションが存在する場合、ユーザー情報を設定
    const [user] = await db
      .select()
      .from(table.user)
      .where(eq(table.user.email, authSession.user.email));

    if (user) {
      event.locals.user = user;
      event.locals.session = {
        id: 'auth-js-session',
        userId: user.id,
        expiresAt: new Date(),
      };
    } else {
      event.locals.user = null;
      event.locals.session = null;
    }
  } else {
    // カスタムセッションもチェック（後方互換性のため）
    const sessionToken = event.cookies.get(auth.sessionCookieName);

    if (sessionToken) {
      const { session, user } = await auth.validateSessionToken(sessionToken);

      if (session) {
        auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
      } else {
        auth.deleteSessionTokenCookie(event);
      }

      event.locals.user = user;
      event.locals.session = session;
    } else {
      event.locals.user = null;
      event.locals.session = null;
    }
  }

  return resolve(event);
};

// ParaglideJSの国際化処理
const asyncLocalStorage = new AsyncLocalStorage<{
  locale?: Locale;
  origin?: string;
  messageCalls?: Set<string>;
}>();

// ParaglideJSにAsyncLocalStorageを設定
overwriteServerAsyncLocalStorage(asyncLocalStorage);

const handleI18n: Handle = async ({ event, resolve }) => {
  const locale = extractLocaleFromRequest(event.request);
  const origin = event.url.origin;

  return asyncLocalStorage.run(
    {
      locale,
      origin,
      messageCalls: new Set(),
    },
    () =>
      resolve(event, {
        transformPageChunk: ({ html }) => {
          return html.replace('%lang%', locale);
        },
      })
  );
};

// Auth.jsのハンドラー設定
const { handle: authHandle } = SvelteKitAuth({
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID || '',
      clientSecret: env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  secret: env.AUTH_SECRET,
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === 'google' && profile?.email && profile.sub) {
        const [existingUser] = await db
          .select()
          .from(table.user)
          .where(eq(table.user.googleId, profile.sub));

        if (!existingUser) {
          await db.insert(table.user).values({
            id: nanoid(),
            email: profile.email,
            name: profile.name || '',
            picture: profile.picture || null,
            googleId: profile.sub,
          });
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (token?.email) {
        const [user] = await db.select().from(table.user).where(eq(table.user.email, token.email));

        if (user) {
          session.user = {
            ...session.user,
            id: user.id,
            name: user.name,
            email: user.email,
          };
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // ログイン成功後のリダイレクト先を決定
      if (url.startsWith(baseUrl)) {
        const urlObj = new URL(url);
        if (urlObj.pathname === '/auth/callback/google') {
          // Google OAuth コールバック後は適切なページにリダイレクト
          return `${baseUrl}/auth/success`;
        }
      }
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
});

export const handle: Handle = sequence(handleI18n, authHandle, handleAuth);
