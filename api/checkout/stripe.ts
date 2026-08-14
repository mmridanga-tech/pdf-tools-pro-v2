import { Request, Response } from 'express';
import Stripe from 'stripe';
import { authenticateRequest } from '../middleware/auth.ts';

export default async function stripeCheckoutHandler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. Authenticate Firebase ID Token
  const authUser = await authenticateRequest(req, res);
  if (!authUser) {
    return; // Response handled by authenticateRequest
  }

  // 2. Resolve requested plan from server-side allowlist
  const { plan } = req.body || {};
  const allowedPlans: Array<'pro' | 'enterprise'> = ['pro', 'enterprise'];

  if (!plan || !allowedPlans.includes(plan)) {
    return res.status(400).json({ error: 'Invalid plan requested. Allowed plans are "pro" and "enterprise".' });
  }

  // 3. Verify Stripe secret key configuration
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return res.status(503).json({
      success: false,
      error: 'Stripe payment gateway is not configured. Missing STRIPE_SECRET_KEY in server environment.',
      provider: 'stripe',
    });
  }

  try {
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16' as any,
    });

    const origin = req.headers.origin || process.env.APP_URL || 'http://localhost:3000';

    // 4. Resolve price ID or create line items server-side
    let priceId = plan === 'enterprise' ? process.env.STRIPE_ENTERPRISE_PRICE_ID : process.env.STRIPE_PRO_PRICE_ID;

    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];

    if (priceId && priceId.trim().length > 0) {
      lineItems = [{ price: priceId.trim(), quantity: 1 }];
    } else {
      // Server-side authoritative pricing line item
      lineItems = [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: plan === 'enterprise' ? 'SmartPDF Enterprise Subscription' : 'SmartPDF Pro Subscription',
              description:
                plan === 'enterprise'
                  ? 'Unlimited Gemini AI document chat, team workspaces & priority OCR'
                  : '200 daily AI requests, batch processing & advanced OCR scanner',
            },
            unit_amount: plan === 'enterprise' ? 4900 : 1500, // $49/mo or $15/mo
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ];
    }

    // 5. Create Stripe Checkout Session server-side with verified Firebase UID metadata
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: lineItems,
      customer_email: authUser.email || undefined,
      metadata: {
        firebaseUid: authUser.uid,
        plan: plan,
      },
      subscription_data: {
        metadata: {
          firebaseUid: authUser.uid,
          plan: plan,
        },
      },
      success_url: `${origin}/pricing?payment_status=success&session_id={CHECKOUT_SESSION_ID}&provider=stripe`,
      cancel_url: `${origin}/pricing?payment_status=cancelled&provider=stripe`,
    });

    return res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      provider: 'stripe',
    });
  } catch (err: any) {
    console.error('Stripe checkout session error:', err?.message || err);
    return res.status(500).json({
      error: 'Failed to initialize Stripe checkout session.',
      message: err?.message || 'Server payment provider error',
    });
  }
}
