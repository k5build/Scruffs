import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'scruffs-jwt-secret-dev-CHANGE-IN-PRODUCTION'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin protection ──────────────────────────────────────
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token  = request.cookies.get('admin_auth')?.value;
    const secret = process.env.ADMIN_SECRET ?? 'scruffs2024';
    if (token !== secret) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── Profile protection (must be logged in) ────────────────
  if (pathname === '/profile') {
    const sessionToken = request.cookies.get('scruffs_session')?.value;
    if (!sessionToken) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
    try {
      await jwtVerify(sessionToken, JWT_SECRET);
    } catch {
      const res = NextResponse.redirect(new URL('/auth', request.url));
      res.cookies.delete('scruffs_session');
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/profile'],
};
