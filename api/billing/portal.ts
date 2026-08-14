import { Request, Response } from 'express';
import Stripe from 'stripe';
import { authenticateRequest } from '../middleware/auth.ts';
import { getOrCreateUserDoc } from '../services/firestore.ts';

export default async function customerPortalHandler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const authUser = await authenticateRequest(req, res);
  if (!authUser) {
    return; // Response handled by authenticateRequest
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return res.status(503).json({ error: 'Stripe customer portal is not configured.' });
  }

  try {
    const userDoc = await getOrCreateUserDoc(authUser.uid, authUser.email);
    if (!userDoc.providerCustomerId || userDoc.provider !== 'stripe') {
      return res.status(400).json({ error: 'No active Stripe customer found for this account.' });
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' as any });
    const origin = req.headers.origin || process.env.APP_URL || 'http://localhost:3000';

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: userDoc.providerCustomerId,
      return_url: `${origin}/pricing`,
    });

    return res.json({ success: true, url: portalSession.url });
  } catch (err: any) {
    console.error('Customer portal error:', err?.message || err);
    return res.status(500).json({ error: 'Failed to create customer billing portal session.' });
  }
}
