import { Request, Response } from 'express';
import Stripe from 'stripe';
import { authenticateRequest } from '../../middleware/auth';

let stripeClient: Stripe | null = null;
function getStripe(): Stripe | null {
  if (!stripeClient && process.env.STRIPE_SECRET_KEY) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
}

export default async function stripeCheckoutHandler(req: Request, res: Response): Promise<void> {
  const user = req.user || { uid: 'anonymous', email: 'anon@smartpdf.ai' };
  const { plan = 'pro', successUrl, cancelUrl } = req.body || {};

  const stripe = getStripe();
  if (!stripe) {
    // In preview mode without real key, return a mock session URL for testing UI
    res.status(200).json({
      url: `${req.headers.origin || 'http://localhost:3000'}/pricing?checkout=success&plan=${plan}&demo=true`,
      sessionId: `demo_session_${Date.now()}`,
      mode: 'demo',
    });
    return;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `SmartPDF AI - ${plan.toUpperCase()} Plan`,
              description: `Monthly subscription for ${plan} tier document intelligence features`,
            },
            unit_amount: plan === 'enterprise' ? 4900 : 1900,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      customer_email: user.email,
      client_reference_id: user.uid,
      success_url: successUrl || `${req.headers.origin || 'http://localhost:3000'}/pricing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.origin || 'http://localhost:3000'}/pricing?canceled=true`,
    });

    res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (err: any) {
    res.status(500).json({ error: 'Stripe Checkout Failed', message: err.message });
  }
}
