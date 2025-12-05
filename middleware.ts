// middleware.ts (in root directory)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');
  const pathname = request.nextUrl.pathname; // Fixed: use request.nextUrl.pathname

  // Protected routes
  const protectedRoutes = ['/dashboard', '/admin', '/appointments'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const decoded = verifyToken(token.value);
    
    if (!decoded) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Admin-only routes
    if (pathname.startsWith('/admin') && decoded.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Redirect to dashboard if already logged in and trying to access login
  if (pathname === '/login' && token) {
    const decoded = verifyToken(token.value);
    if (decoded) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/appointments/:path*', '/login'],
};