import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import { authenticateRequest } from '../../middleware/auth';

let razorpayClient: Razorpay | null = null;
function getRazorpay(): Razorpay | null {
  if (!razorpayClient && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpayClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayClient;
}

export default async function razorpayCheckoutHandler(req: Request, res: Response): Promise<void> {
  const user = req.user || { uid: 'anonymous', email: 'anon@smartpdf.ai' };
  const { plan = 'pro', currency = 'INR' } = req.body || {};

  const razorpay = getRazorpay();
  if (!razorpay) {
    res.status(200).json({
      orderId: `order_demo_${Date.now()}`,
      amount: plan === 'enterprise' ? 399900 : 149900,
      currency: 'INR',
      keyId: process.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      mode: 'demo',
    });
    return;
  }

  try {
    const amount = plan === 'enterprise' ? 399900 : 149900;
    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt: `rcpt_${user.uid.slice(0, 8)}_${Date.now()}`,
      notes: { uid: user.uid, plan },
    });

    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Razorpay Order Creation Failed', message: err.message });
  }
}
