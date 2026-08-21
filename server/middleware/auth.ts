import { getAdminAuth } from '../services/firestore';
import { usageTracker } from '../services/usageTracker';

export interface AuthenticatedUser {
  uid: string;
  email: string;
  role?: 'user' | 'admin';
}

export async function authenticateRequest(req: any, res: any): Promise<AuthenticatedUser | null> {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;

  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    usageTracker.recordSecurityEvent({
      id: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'unauthorized_access',
      endpoint: req.url || '/api/*',
      timestamp: Date.now(),
      details: 'Missing or malformed Authorization Bearer header',
    });

    res.setHeader('Content-Type', 'application/json');
    res.status(401).json({
      success: false,
      error: 'Unauthorized. Missing or malformed Authorization Bearer token header.',
    });
    return null;
  }

  const token = authHeader.split('Bearer ')[1]?.trim();

  if (!token) {
    res.setHeader('Content-Type', 'application/json');
    res.status(401).json({
      success: false,
      error: 'Unauthorized. Empty Bearer token provided.',
    });
    return null;
  }

  try {
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(token);

    const email = decodedToken.email || '';
    const isInitialAdmin = email === 'mmridanga@gmail.com' || email.includes('admin@smartpdf.ai');

    return {
      uid: decodedToken.uid,
      email,
      role: (decodedToken.role as any) || (isInitialAdmin ? 'admin' : 'user'),
    };
  } catch (err: any) {
    usageTracker.recordSecurityEvent({
      id: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'auth_failure',
      endpoint: req.url || '/api/*',
      timestamp: Date.now(),
      details: `Invalid Firebase ID token: ${err?.message || 'Token verification failed'}`,
    });

    res.setHeader('Content-Type', 'application/json');
    res.status(401).json({
      success: false,
      error: 'Unauthorized. Invalid or expired Firebase ID token.',
    });
    return null;
  }
}
