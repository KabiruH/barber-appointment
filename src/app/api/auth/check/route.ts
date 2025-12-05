// app/api/auth/check/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return NextResponse.json(
        { isAuthenticated: false, user: null },
        { status: 200 }
      );
    }

    // Verify JWT token
    const decoded = verifyToken(token.value);

    if (!decoded) {
      // Token is invalid or expired
      return NextResponse.json(
        { isAuthenticated: false, user: null, message: 'Invalid or expired token' },
        { status: 200 }
      );
    }

    return NextResponse.json({
      isAuthenticated: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
      },
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { isAuthenticated: false, user: null, error: 'Internal server error' },
      { status: 500 }
    );
  }
}