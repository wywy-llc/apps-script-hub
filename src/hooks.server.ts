import * as auth from '$lib/server/auth';
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { extractLocaleFromRequest } from '$lib/paraglide/runtime.js';
import { AsyncLocalStorage } from 'node:async_hooks';
import { overwriteServerAsyncLocalStorage } from '$lib/paraglide/runtime.js';
import type { Locale } from '$lib';

const handleAuth: Handle = async ({ event, resolve }) => {
  const sessionToken = event.cookies.get(auth.sessionCookieName);

  if (!sessionToken) {
    event.locals.user = null;
    event.locals.session = null;
    return resolve(event);
  }

  const { session, user } = await auth.validateSessionToken(sessionToken);

  if (session) {
    auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
  } else {
    auth.deleteSessionTokenCookie(event);
  }

  event.locals.user = user;
  event.locals.session = session;
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
    () => resolve(event, {
      transformPageChunk: ({ html }) => {
        return html.replace('%lang%', locale);
      }
    })
  );
};

export const handle: Handle = sequence(handleI18n, handleAuth);
