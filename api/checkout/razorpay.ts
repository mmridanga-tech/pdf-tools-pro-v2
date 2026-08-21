import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import { authenticateRequest } from '../middleware/auth.ts';

export default async function razorpayCheckoutHandler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. Authenticate Firebase ID Token
  const authUser = await authenticateRequest(req, res);
  if (!authUser) {
    return; // Response handled by authenticateRequest
  }

  // 2. Resolve requested plan against server-side allowlist
  const { plan } = req.body || {};
  const allowedPlans: Array<'pro' | 'enterprise'> = ['pro', 'enterprise'];

  if (!plan || !allowedPlans.includes(plan)) {
    return res.status(400).json({ error: 'Invalid plan requested. Allowed plans are "pro" and "enterprise".' });
  }

  // 3. Verify Razorpay credentials
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return res.status(503).json({
      success: false,
      error: 'Razorpay payment gateway is not configured. Missing credentials in server environment.',
      provider: 'razorpay',
    });
  }

  try {
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // 4. Calculate amount server-side (in INR paise)
    // Pro: ₹1199 (119900 paise), Enterprise: ₹3999 (399900 paise)
    const amount = plan === 'enterprise' ? 399900 : 119900;

    const receipt = `rcpt_${authUser.uid.substring(0, 8)}_${Date.now()}`;

    // 5. Create Razorpay order server-side with verified Firebase UID notes
    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt,
      notes: {
        firebaseUid: authUser.uid,
        plan: plan,
      },
    });

    return res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: keyId, // Only public key ID is returned to the client
      provider: 'razorpay',
    });
  } catch (err: any) {
    console.error('Razorpay checkout order error:', err?.message || err);
    return res.status(500).json({
      error: 'Failed to initialize Razorpay checkout order.',
      message: err?.message || 'Server payment provider error',
    });
  }
}
