import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'scruffs-jwt-secret-dev-CHANGE-IN-PRODUCTION'
);

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('scruffs_session')?.value;
  if (!token) return false;
  try { await jwtVerify(token, JWT_SECRET); return true; }
  catch { return false; }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin protection ──────────────────────────────────────────
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token  = request.cookies.get('admin_auth')?.value;
    const secret = process.env.ADMIN_SECRET ?? 'scruffs2024';
    if (token !== secret) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── Home page: redirect to /auth if not logged in & not a guest ──
  if (pathname === '/') {
    const authed = await isAuthenticated(request);
    const guest  = request.cookies.get('scruffs_guest')?.value === '1';
    if (!authed && !guest) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  }

  // ── Auth page: redirect to / if already logged in ────────────
  if (pathname === '/auth') {
    const authed = await isAuthenticated(request);
    if (authed) return NextResponse.redirect(new URL('/', request.url));
  }

  // ── Profile: must be logged in ────────────────────────────────
  if (pathname === '/profile') {
    const authed = await isAuthenticated(request);
    if (!authed) {
      const res = NextResponse.redirect(new URL('/auth', request.url));
      res.cookies.delete('scruffs_session');
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/auth', '/admin/:path*', '/profile'],
};
