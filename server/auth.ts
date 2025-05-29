import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'adultconnect-jwt-secret';
const SALT_ROUNDS = 12;

export interface AuthenticatedRequest extends Request {
  userId?: number;
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export function generateToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): { userId: number } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    return decoded;
  } catch (error) {
    return null;
  }
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }

  req.userId = decoded.userId;
  next();
}

// Rate limiting for login attempts (simple in-memory store)
const loginAttempts = new Map<string, { count: number; lastAttempt: Date }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export function rateLimitLogin(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = new Date();
  
  const attempts = loginAttempts.get(ip);
  
  if (attempts) {
    // Reset if lockout period has passed
    if (now.getTime() - attempts.lastAttempt.getTime() > LOCKOUT_DURATION) {
      loginAttempts.delete(ip);
    } else if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
      return res.status(429).json({ 
        message: 'Too many login attempts. Please try again later.',
        retryAfter: LOCKOUT_DURATION - (now.getTime() - attempts.lastAttempt.getTime())
      });
    }
  }
  
  next();
}

export function recordLoginAttempt(ip: string, successful: boolean) {
  const now = new Date();
  const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: now };
  
  if (successful) {
    // Reset on successful login
    loginAttempts.delete(ip);
  } else {
    // Increment failed attempts
    attempts.count += 1;
    attempts.lastAttempt = now;
    loginAttempts.set(ip, attempts);
  }
}