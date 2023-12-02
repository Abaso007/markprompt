import { createMiddlewareSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';

import { matchesGlobs } from '../utils';

export const PUBLIC_NON_ROUTED_API_PATHS = [
  '/.netlify/functions/inngest',
  '/.redwood/functions/inngest',
  '/api/inngest',
  '/api/oauth',
  '/api/subscriptions/webhook',
  '/api/support/contact',
  '/api/sync-queues',
  '/api/webhooks/nango/sync',
  '/api/webhooks/zendesk',
  '/x/inngest',
];

const UNAUTHED_PATHS = [
  '/',
  '/about',
  '/blog',
  '/blog/**/*',
  '/customers',
  '/customers/**/*',
  '/docs',
  '/home',
  '/embed/*',
  '/integrations',
  '/integrations/**/*',
  '/legal/**/*',
  '/login',
  '/login/accept-invite',
  '/login/confirm',
  '/login/confirm-signup',
  '/login/email',
  '/pricing',
  '/resources',
  '/resources/**/*',
  '/s/*',
  '/signup',
  '/templates',
  '/templates/**/*',
  ...PUBLIC_NON_ROUTED_API_PATHS,
];

export default async function AppMiddleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const res = NextResponse.next();
  const supabase = createMiddlewareSupabaseClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user && !matchesGlobs(path, UNAUTHED_PATHS)) {
    return NextResponse.redirect(new URL('/login', req.url));
  } else if (session?.user && (path === '/login' || path === '/signup')) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return res;
}
