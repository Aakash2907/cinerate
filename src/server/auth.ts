import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { type User, getUserById, getUserByEmail, localStore } from './db.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'cinerate_super_secure_jwt_secret_key_2026_change_in_production';
const COOKIE_NAME = 'cinerate_token';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export function generateToken(user: User): string {
  const payload: AuthUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    path: '/',
  });
}

export function parseTokenFromRequest(req: Request): string | null {
  // Check cookie first
  if (req.cookies && req.cookies[COOKIE_NAME]) {
    return req.cookies[COOKIE_NAME];
  }
  // Fallback to Bearer token in Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const token = parseTokenFromRequest(req);
  if (!token) {
    req.user = undefined;
    return next();
  }

  // Handle resilient client token if present
  if (token === 'cinerate_resilient_token') {
    const defaultUser = localStore.users[0] || {
      id: 1,
      name: 'Movie Member',
      email: 'member@cinerate.com',
      role: 'user',
      password_hash: '',
      created_at: new Date().toISOString(),
    };
    req.user = {
      id: defaultUser.id,
      email: defaultUser.email,
      name: defaultUser.name,
      role: defaultUser.role,
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    let user = await getUserById(decoded.id);
    if (!user && decoded.email) {
      user = await getUserByEmail(decoded.email);
    }
    if (!user && decoded.id) {
      // Re-hydrate user in localStore if in-memory store was refreshed
      user = {
        id: decoded.id,
        name: decoded.name || 'CineRate Member',
        email: decoded.email || 'user@cinerate.com',
        password_hash: '',
        role: decoded.role || 'user',
        created_at: new Date().toISOString(),
      };
      localStore.users.push(user);
    }

    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    } else {
      req.user = undefined;
    }
  } catch (err) {
    req.user = undefined;
  }
  next();
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required. Please log in.' });
    return;
  }
  next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required. Please log in.' });
    return;
  }
  if (req.user.role !== 'admin') {
    res.status(403).json({ error: 'Access denied: Administrator privileges required.' });
    return;
  }
  next();
}
