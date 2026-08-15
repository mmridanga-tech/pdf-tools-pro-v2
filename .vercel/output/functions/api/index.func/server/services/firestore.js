import admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
let firestoreInstance = null;
let authInstance = null;
export function getAdminFirestore() {
    if (!firestoreInstance) {
        if (admin.apps.length === 0) {
            const privateKey = process.env.FIREBASE_PRIVATE_KEY
                ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
                : undefined;
            const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
            const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCP_PROJECT;
            if (privateKey && clientEmail && projectId) {
                admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId,
                        clientEmail,
                        privateKey,
                    }),
                });
            }
            else {
                admin.initializeApp();
            }
        }
        firestoreInstance = admin.firestore();
    }
    return firestoreInstance;
}
export function getAdminAuth() {
    if (!authInstance) {
        if (admin.apps.length === 0) {
            getAdminFirestore();
        }
        authInstance = admin.auth();
    }
    return authInstance;
}
/**
 * Retrieves or initializes user profile in Firestore `users/{uid}`.
 * Guarantees server-side user document existence.
 */
export async function getOrCreateUserDoc(uid, email) {
    try {
        const db = getAdminFirestore();
        const userRef = db.collection('users').doc(uid);
        const snap = await userRef.get();
        if (snap.exists) {
            const data = snap.data();
            userRef.update({ lastLoginAt: FieldValue.serverTimestamp() }).catch(() => { });
            return {
                uid,
                email: data.email || email || '',
                role: data.role || 'user',
                plan: data.plan || 'free',
                subscriptionStatus: data.subscriptionStatus,
                provider: data.provider,
                providerCustomerId: data.providerCustomerId,
                providerSubscriptionId: data.providerSubscriptionId,
                currentPeriodStart: data.currentPeriodStart,
                currentPeriodEnd: data.currentPeriodEnd,
                cancelAtPeriodEnd: data.cancelAtPeriodEnd,
            };
        }
        else {
            const isInitialAdmin = email === 'mmridanga@gmail.com' || (email && email.includes('admin@smartpdf.ai'));
            const newUser = {
                uid,
                email: email || '',
                role: isInitialAdmin ? 'admin' : 'user',
                plan: 'free',
                subscriptionStatus: 'active',
                provider: 'none',
            };
            await userRef.set({
                ...newUser,
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
                lastLoginAt: FieldValue.serverTimestamp(),
            });
            return newUser;
        }
    }
    catch (err) {
        console.warn(`Firestore user lookup warning for ${uid}:`, err);
        return {
            uid,
            email: email || '',
            role: 'user',
            plan: 'free',
        };
    }
}
/**
 * Atomically updates user subscription details in Firestore `users/{uid}`.
 */
export async function updateUserSubscription(uid, subData) {
    try {
        const db = getAdminFirestore();
        const userRef = db.collection('users').doc(uid);
        await db.runTransaction(async (transaction) => {
            const snap = await transaction.get(userRef);
            const updatePayload = {
                updatedAt: FieldValue.serverTimestamp(),
            };
            if (subData.plan !== undefined)
                updatePayload.plan = subData.plan;
            if (subData.subscriptionStatus !== undefined)
                updatePayload.subscriptionStatus = subData.subscriptionStatus;
            if (subData.provider !== undefined)
                updatePayload.provider = subData.provider;
            if (subData.providerCustomerId !== undefined)
                updatePayload.providerCustomerId = subData.providerCustomerId;
            if (subData.providerSubscriptionId !== undefined)
                updatePayload.providerSubscriptionId = subData.providerSubscriptionId;
            if (subData.currentPeriodStart !== undefined)
                updatePayload.currentPeriodStart = subData.currentPeriodStart;
            if (subData.currentPeriodEnd !== undefined)
                updatePayload.currentPeriodEnd = subData.currentPeriodEnd;
            if (subData.cancelAtPeriodEnd !== undefined)
                updatePayload.cancelAtPeriodEnd = subData.cancelAtPeriodEnd;
            if (!snap.exists) {
                transaction.set(userRef, {
                    uid,
                    email: subData.email || '',
                    role: 'user',
                    plan: subData.plan || 'free',
                    ...updatePayload,
                    createdAt: FieldValue.serverTimestamp(),
                });
            }
            else {
                transaction.update(userRef, updatePayload);
            }
        });
        const subHistoryRef = db.collection('subscriptions').doc(`${uid}_${subData.providerSubscriptionId || Date.now()}`);
        await subHistoryRef.set({
            uid,
            provider: subData.provider || 'none',
            plan: subData.plan || 'free',
            status: subData.subscriptionStatus || 'incomplete',
            providerCustomerId: subData.providerCustomerId || null,
            providerSubscriptionId: subData.providerSubscriptionId || null,
            currentPeriodStart: subData.currentPeriodStart || null,
            currentPeriodEnd: subData.currentPeriodEnd || null,
            updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });
    }
    catch (err) {
        console.error(`Error updating user subscription for ${uid}:`, err);
        throw err;
    }
}
/**
 * Checks and records a webhook event in Firestore `paymentWebhookEvents/{eventId}` for idempotency.
 */
export async function checkAndRecordWebhookEvent(eventId, provider) {
    if (!eventId)
        return true;
    try {
        const db = getAdminFirestore();
        const eventRef = db.collection('paymentWebhookEvents').doc(eventId);
        const isNew = await db.runTransaction(async (transaction) => {
            const snap = await transaction.get(eventRef);
            if (snap.exists) {
                return false;
            }
            transaction.set(eventRef, {
                eventId,
                provider,
                processedAt: FieldValue.serverTimestamp(),
            });
            return true;
        });
        return isNew;
    }
    catch (err) {
        console.warn(`Webhook idempotency transaction warning for event ${eventId}:`, err);
        return true;
    }
}
/**
 * Gets today's UTC date string formatted as YYYY-MM-DD
 */
export function getTodayDateString() {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
/**
 * Atomically checks and increments daily AI request quota in Firestore using `db.runTransaction`.
 */
export async function checkAndIncrementDailyUsageTransaction(uid, dailyLimit) {
    const dateStr = getTodayDateString();
    const docId = `${uid}_${dateStr}`;
    try {
        const db = getAdminFirestore();
        const usageRef = db.collection('aiUsage').doc(docId);
        const result = await db.runTransaction(async (transaction) => {
            const snap = await transaction.get(usageRef);
            if (!snap.exists) {
                if (dailyLimit <= 0) {
                    return { allowed: false, currentCount: 0, limit: dailyLimit };
                }
                transaction.set(usageRef, {
                    uid,
                    date: dateStr,
                    dailyCount: 1,
                    createdAt: FieldValue.serverTimestamp(),
                    updatedAt: FieldValue.serverTimestamp(),
                });
                return { allowed: true, currentCount: 1, limit: dailyLimit };
            }
            const data = snap.data();
            const currentCount = data?.dailyCount || 0;
            if (currentCount >= dailyLimit) {
                return { allowed: false, currentCount, limit: dailyLimit };
            }
            const newCount = currentCount + 1;
            transaction.update(usageRef, {
                dailyCount: newCount,
                updatedAt: FieldValue.serverTimestamp(),
            });
            return { allowed: true, currentCount: newCount, limit: dailyLimit };
        });
        return result;
    }
    catch (err) {
        console.warn(`Firestore daily usage transaction error for ${uid}:`, err);
        return { allowed: true, currentCount: 1, limit: dailyLimit };
    }
}
/**
 * Logs AI request execution to `aiUsageLogs` collection in Firestore.
 */
export async function writeAiUsageLog(record) {
    try {
        const db = getAdminFirestore();
        await db.collection('aiUsageLogs').add({
            uid: record.uid,
            endpoint: record.endpoint,
            timestamp: record.timestamp,
            durationMs: record.durationMs,
            status: record.status,
            createdAt: FieldValue.serverTimestamp(),
        });
    }
    catch (err) {
        console.warn(`Firestore AI log write warning for ${record.uid}:`, err);
    }
}
//# sourceMappingURL=firestore.js.map