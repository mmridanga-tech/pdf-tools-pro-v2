import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

export interface AuthenticatedUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  role: 'user' | 'admin';
  provider?: string;
  isMock?: boolean;
}

let adminInitialized = false;

function initFirebaseAdmin() {
  if (adminInitialized) return;

  try {
    if (getApps().length === 0) {
      const projectId = process.env.FIREBASE_PROJECT_ID || 'smartpdf-c2800';
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

      if (clientEmail && privateKey) {
        initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
      } else {
        initializeApp({ projectId });
      }
    }
    adminInitialized = true;
  } catch (err) {
    console.warn('Firebase Admin SDK initialization warning:', err);
  }
}

/**
 * Verify Firebase Auth ID token directly via Google Identity Toolkit REST API
 */
async function verifyViaIdentityToolkit(token: string): Promise<AuthenticatedUser | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: token }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data?.users && data.users.length > 0) {
      const u = data.users[0];
      return {
        uid: u.localId,
        email: u.email || '',
        emailVerified: !!u.emailVerified,
        role: u.email && u.email.includes('admin') ? 'admin' : 'user',
        provider: 'firebase',
      };
    }
  } catch (err) {
    console.warn('Identity Toolkit verification failed:', err);
  }
  return null;
}

/**
 * Authenticate request using Authorization: Bearer <Firebase_ID_Token>
 */
export async function authenticateRequest(req: any, res: any): Promise<AuthenticatedUser | null> {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;

  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    res.setHeader('Content-Type', 'application/json');
    res.status(401).json({
      success: false,
      error: 'Authentication required. Missing or malformed Authorization Bearer token header.',
    });
    return null;
  }

  const token = authHeader.substring(7).trim();

  if (!token) {
    res.setHeader('Content-Type', 'application/json');
    res.status(401).json({
      success: false,
      error: 'Authentication required. Authorization token is empty.',
    });
    return null;
  }

  // Development mock token check (ONLY allowed if process.env.ENABLE_DEV_MOCK_AUTH === 'true' and process.env.NODE_ENV !== 'production')
  const enableDevMock = process.env.ENABLE_DEV_MOCK_AUTH === 'true' && process.env.NODE_ENV !== 'production';
  if (token.startsWith('dev_mock_token_')) {
    if (enableDevMock) {
      const mockUid = token.replace('dev_mock_token_', '');
      const user: AuthenticatedUser = {
        uid: mockUid || 'dev_mock_user',
        email: 'dev@smartpdf.ai',
        emailVerified: true,
        role: 'user',
        isMock: true,
      };
      req.user = user;
      return user;
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.status(401).json({
        success: false,
        error: 'Development mock tokens are disabled in this environment. Real Firebase authentication is required.',
      });
      return null;
    }
  }

  // Attempt 1: Verify token with firebase-admin SDK
  try {
    initFirebaseAdmin();
    if (getApps().length > 0) {
      const decoded = await getAuth().verifyIdToken(token);
      const user: AuthenticatedUser = {
        uid: decoded.uid,
        email: decoded.email || '',
        emailVerified: !!decoded.email_verified,
        role: decoded.email && decoded.email.includes('admin') ? 'admin' : 'user',
        provider: decoded.firebase?.sign_in_provider,
      };
      req.user = user;
      return user;
    }
  } catch (err: any) {
    console.warn('Firebase Admin token verification failed, trying Identity Toolkit REST fallback:', err?.message || err);
  }

  // Attempt 2: Fallback to Google Identity Toolkit REST API
  const toolkitUser = await verifyViaIdentityToolkit(token);
  if (toolkitUser) {
    req.user = toolkitUser;
    return toolkitUser;
  }

  // Token is invalid or expired
  res.setHeader('Content-Type', 'application/json');
  res.status(401).json({
    success: false,
    error: 'Invalid or expired authentication token. Please sign in again.',
  });
  return null;
}
