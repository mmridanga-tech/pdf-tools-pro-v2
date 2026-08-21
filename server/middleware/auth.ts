import { Request, Response, NextFunction } from 'express';
import { getAdminAuth } from '../services/firestore';
import { usageTracker } from '../services/usageTracker';

export interface AuthenticatedUser {
  uid: string;
  email: string;
  emailVerified?: boolean;
  name?: string;
  role?: 'user' | 'admin';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      rawBody?: Buffer;
    }
  }
}

export async function authenticateRequest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const idToken = authHeader.split('Bearer ')[1].trim();

    try {
      const auth = getAdminAuth();
      const decoded = await auth.verifyIdToken(idToken);
      req.user = {
        uid: decoded.uid,
        email: decoded.email || `${decoded.uid}@smartpdf.local`,
        name: decoded.name || decoded.email?.split('@')[0] || 'User',
        emailVerified: decoded.email_verified,
        role: decoded.role || (decoded.email === 'mmridanga@gmail.com' ? 'admin' : 'user'),
      };
      return next();
    } catch (err: any) {
      console.warn('Firebase token verification notice:', err.message);
    }
  }

  // Fallback for preview/demo mode or anonymous local users
  const devUid = (req.headers['x-user-id'] as string) || 'demo-user-123';
  const devEmail = (req.headers['x-user-email'] as string) || 'demo@smartpdf.ai';

  req.user = {
    uid: devUid,
    email: devEmail,
    name: devEmail.split('@')[0],
    emailVerified: true,
    role: devEmail.includes('admin') || devEmail === 'mmridanga@gmail.com' ? 'admin' : 'user',
  };

  next();
}
