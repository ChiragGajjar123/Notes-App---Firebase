import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js server-side routing proxy to protect pages.
 * Replaces the deprecated middleware.ts file convention in Next.js 16.
 * Inspects the "__session" cookie (required name under Firebase Hosting SSR).
 */
export function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get('__session')?.value;
  const { pathname } = request.nextUrl;

  const isDashboardPath = pathname.startsWith('/notes');
  const isAuthPath = pathname === '/login' || pathname === '/register';

  // 1. Trying to view dashboard without being logged in -> Redirect to Login
  if (isDashboardPath && !sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Trying to view Login/Register when already logged in -> Redirect to Dashboard
  if (isAuthPath && sessionCookie) {
    return NextResponse.redirect(new URL('/notes', request.url));
  }

  // 3. Root landing route redirect
  if (pathname === '/') {
    if (sessionCookie) {
      return NextResponse.redirect(new URL('/notes', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/notes/:path*',
    '/login',
    '/register'
  ]
};
