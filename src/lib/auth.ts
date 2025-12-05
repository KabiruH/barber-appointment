// lib/auth.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

export type UserRole = 'ADMIN' | 'BARBER';

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}

export function generateToken(user: TokenPayload): string {
  return jwt.sign(
    {
      userId: user.userId,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { 
      expiresIn: '7d',
      issuer: 'premium-barber-shop',
      audience: 'barbershop-users'
    }
  );
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'premium-barber-shop',
      audience: 'barbershop-users'
    }) as TokenPayload;
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      console.error('JWT verification failed:', error.message);
    }
    return null;
  }
}