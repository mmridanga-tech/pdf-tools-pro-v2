import { Request, Response } from 'express';
import Stripe from 'stripe';
import { authenticateRequest } from '../../middleware/auth';

export default async function customerPortalHandler(req: Request, res: Response): Promise<void> {
  const user = req.user || { uid: 'anonymous', email: 'anon@smartpdf.ai' };

  if (process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const session = await stripe.billingPortal.sessions.create({
        customer: (req.body?.customerId as string) || 'cus_placeholder',
        return_url: `${req.headers.origin || 'http://localhost:3000'}/pricing`,
      });
      res.status(200).json({ url: session.url });
      return;
    } catch (err: any) {
      // Fallback
    }
  }

  res.status(200).json({
    url: `${req.headers.origin || 'http://localhost:3000'}/pricing?portal=demo`,
  });
}
