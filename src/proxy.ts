import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, SESSION_COOKIE_NAME } from './lib/jwt';

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EDITOR', 'ANALYST', 'VIEWER'];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  // Allow authentication API endpoints (login, register, forgot-password, reset-password)
  if (pathname.startsWith('/api/admin/auth/') || pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // Handle Admin Auth Pages (login, forgot-password, reset-password)
  const isAdminAuthPage =
    pathname === '/admin/login' ||
    pathname.startsWith('/admin/login/') ||
    pathname === '/admin/forgot-password' ||
    pathname === '/admin/reset-password';

  if (isAdminAuthPage) {
    return NextResponse.next();
  }

  // Handle Protected Admin and Dashboard Routes
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }
    const loginUrl = new URL('/admin/login', req.url);
    if (pathname !== '/admin' && pathname !== '/admin/dashboard') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  const payload = await verifySessionToken(token);
  if (!payload?.userId) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized: Session expired' }, { status: 401 });
    }
    const loginUrl = new URL('/admin/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete(SESSION_COOKIE_NAME);
    return res;
  }

  // Admin role enforcement
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const isAuthorized = payload.isSuperAdmin || (payload.role && ADMIN_ROLES.includes(payload.role));
    if (!isAuthorized) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden: Admin privilege required' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/admin/login?error=forbidden', req.url));
    }
  }

  return NextResponse.next();
}

// Focused matcher strictly targeting protected routes, leaving public routes & static assets untouched
export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/dashboard',
    '/dashboard/:path*',
    '/analytics',
    '/analytics/:path*',
    '/calendar',
    '/calendar/:path*',
    '/campaigns',
    '/campaigns/:path*',
    '/content',
    '/content/:path*',
    '/inbox',
    '/inbox/:path*',
    '/media',
    '/media/:path*',
    '/notifications',
    '/notifications/:path*',
    '/publishing',
    '/publishing/:path*',
    '/reports',
    '/reports/:path*',
    '/settings',
    '/settings/:path*',
    '/social-accounts',
    '/social-accounts/:path*',
    '/team',
    '/team/:path*',
    '/trash',
    '/trash/:path*',
    '/approvals',
    '/approvals/:path*',
    '/api/admin/:path*',
    '/api/social-accounts/:path*',
    '/api/posts/:path*',
    '/api/analytics/:path*',
    '/api/calendar/:path*',
    '/api/campaigns/:path*',
    '/api/inbox/:path*',
    '/api/media/:path*',
    '/api/reports/:path*',
    '/api/settings/:path*',
    '/api/workspaces/:path*',
  ],
};
