import { getOrCreateUserDoc } from './firestore';
export async function getUserEntitlement(uid, email) {
    const user = await getOrCreateUserDoc(uid, email);
    const plan = user.plan || 'free';
    const role = user.role || 'user';
    if (role === 'admin') {
        return {
            uid,
            email,
            role: 'admin',
            plan: 'enterprise',
            dailyAiLimit: 10000,
            maxContextChars: 120000,
            allowBatchProcessing: true,
            allowAdvancedOcr: true,
        };
    }
    if (plan === 'enterprise') {
        return {
            uid,
            email,
            role: 'user',
            plan: 'enterprise',
            dailyAiLimit: 1000,
            maxContextChars: 80000,
            allowBatchProcessing: true,
            allowAdvancedOcr: true,
        };
    }
    if (plan === 'pro') {
        return {
            uid,
            email,
            role: 'user',
            plan: 'pro',
            dailyAiLimit: 200,
            maxContextChars: 40000,
            allowBatchProcessing: true,
            allowAdvancedOcr: true,
        };
    }
    // Free Tier
    return {
        uid,
        email,
        role: 'user',
        plan: 'free',
        dailyAiLimit: 15,
        maxContextChars: 20000,
        allowBatchProcessing: false,
        allowAdvancedOcr: false,
    };
}
//# sourceMappingURL=entitlement.js.map