// lib/auth-server.ts
import { cookies } from 'next/headers';
import { verifyToken, TokenPayload } from './auth';

export async function getServerUser(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');

  if (!token) {
    return null;
  }

  return verifyToken(token.value);
}

export async function requireAuth(): Promise<TokenPayload> {
  const user = await getServerUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}

export async function requireAdmin(): Promise<TokenPayload> {
  const user = await requireAuth();
  
  if (user.role !== 'ADMIN') { // Changed from 'admin' to 'ADMIN'
    throw new Error('Admin access required');
  }
  
  return user;
}

export async function requireBarber(): Promise<TokenPayload> {
  const user = await requireAuth();
  
  if (user.role !== 'BARBER') {
    throw new Error('Barber access required');
  }
  
  return user;
}

// Optional: Helper to check if user has specific role
export async function requireRole(role: 'ADMIN' | 'BARBER'): Promise<TokenPayload> {
  const user = await requireAuth();
  
  if (user.role !== role) {
    throw new Error(`${role} access required`);
  }
  
  return user;
}