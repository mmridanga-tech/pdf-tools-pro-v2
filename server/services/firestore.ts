import admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

let adminApp: admin.app.App | null = null;

export function getAdminApp(): admin.app.App {
  if (!adminApp) {
    if (admin.apps.length > 0 && admin.apps[0]) {
      adminApp = admin.apps[0];
    } else {
      try {
        const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        if (serviceAccountKey) {
          const parsed = JSON.parse(serviceAccountKey);
          adminApp = admin.initializeApp({
            credential: admin.credential.cert(parsed),
          });
        } else {
          adminApp = admin.initializeApp();
        }
      } catch (err) {
        console.warn('Firebase Admin default init fallback:', err);
        try {
          adminApp = admin.initializeApp();
        } catch {
          // If already initialized
          adminApp = admin.app();
        }
      }
    }
  }
  return adminApp;
}

export function getAdminAuth(): admin.auth.Auth {
  return getAdminApp().auth();
}

export function getAdminFirestore(): admin.firestore.Firestore {
  return getAdminApp().firestore();
}

export interface UserDocument {
  uid: string;
  email: string;
  role: 'user' | 'admin';
  plan: 'free' | 'pro' | 'enterprise';
  createdAt?: number;
  updatedAt?: number;
}

export async function getOrCreateUserDoc(uid: string, email: string): Promise<UserDocument> {
  const defaultUser: UserDocument = {
    uid,
    email,
    role: email.toLowerCase().includes('admin') || email === 'mmridanga@gmail.com' ? 'admin' : 'user',
    plan: email.toLowerCase().includes('admin') || email === 'mmridanga@gmail.com' ? 'enterprise' : 'free',
  };

  try {
    const db = getAdminFirestore();
    const userRef = db.collection('users').doc(uid);
    const snap = await userRef.get();

    if (!snap.exists) {
      await userRef.set({
        ...defaultUser,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return defaultUser;
    }

    const data = snap.data() as UserDocument;
    return {
      ...defaultUser,
      ...data,
      role: data.role || defaultUser.role,
      plan: data.plan || defaultUser.plan,
    };
  } catch (err) {
    console.warn('Firestore fallback for user doc:', err);
    return defaultUser;
  }
}

export async function updateUserSubscription(
  uid: string,
  plan: 'free' | 'pro' | 'enterprise',
  paymentProvider: 'stripe' | 'razorpay',
  subscriptionId?: string,
  customerId?: string
): Promise<void> {
  try {
    const db = getAdminFirestore();
    await db.collection('users').doc(uid).set(
      {
        plan,
        paymentProvider,
        subscriptionId: subscriptionId || null,
        customerId: customerId || null,
        updatedAt: Date.now(),
      },
      { merge: true }
    );

    await db.collection('subscriptions').add({
      uid,
      plan,
      provider: paymentProvider,
      subscriptionId: subscriptionId || null,
      timestamp: Date.now(),
      status: 'active',
    });
  } catch (err) {
    console.warn('Firestore subscription update fallback:', err);
  }
}

export async function checkAndRecordWebhookEvent(
  provider: 'stripe' | 'razorpay',
  eventId: string,
  eventType: string,
  payload: any
): Promise<boolean> {
  try {
    const db = getAdminFirestore();
    const docRef = db.collection('webhookEvents').doc(`${provider}_${eventId}`);
    const snap = await docRef.get();
    if (snap.exists) {
      return false; // already processed
    }
    await docRef.set({
      provider,
      eventId,
      eventType,
      payload,
      receivedAt: Date.now(),
    });
    return true;
  } catch {
    return true;
  }
}

export async function checkAndIncrementDailyUsageTransaction(
  uid: string,
  limit: number
): Promise<{ allowed: boolean; currentCount: number; limit: number }> {
  try {
    const db = getAdminFirestore();
    const today = new Date().toISOString().split('T')[0];
    const usageRef = db.collection('aiUsage').doc(`${uid}_${today}`);

    return await db.runTransaction(async (t) => {
      const doc = await t.get(usageRef);
      let count = 0;
      if (doc.exists) {
        count = doc.data()?.requestCount || 0;
      }
      if (count >= limit) {
        return { allowed: false, currentCount: count, limit };
      }
      t.set(
        usageRef,
        {
          uid,
          date: today,
          requestCount: count + 1,
          lastRequestAt: Date.now(),
        },
        { merge: true }
      );
      return { allowed: true, currentCount: count + 1, limit };
    });
  } catch (err) {
    return { allowed: true, currentCount: 1, limit };
  }
}

export async function writeAiUsageLog(logData: {
  uid: string;
  endpoint: string;
  model: string;
  promptChars: number;
  responseChars: number;
  latencyMs: number;
  success: boolean;
  error?: string;
}): Promise<void> {
  try {
    const db = getAdminFirestore();
    await db.collection('aiUsageLogs').add({
      ...logData,
      timestamp: Date.now(),
    });
  } catch (err) {
    // Non-blocking log write
  }
}

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}
