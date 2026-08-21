import { Request, Response } from 'express';
import Stripe from 'stripe';
import { updateUserSubscription, checkAndRecordWebhookEvent } from '../services/firestore.ts';

export default async function stripeWebhookHandler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!webhookSecret || !stripeSecretKey) {
    console.warn('Stripe webhook received but webhook secret is not configured.');
    return res.status(500).json({ error: 'Stripe webhook secret or secret key not configured.' });
  }

  const signature = req.headers['stripe-signature'] as string;
  if (!signature) {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  let event: Stripe.Event;

  try {
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' as any });
    // Use rawBody buffer attached by express.json verify hook
    const rawPayload = (req as any).rawBody || req.body;
    event = stripe.webhooks.constructEvent(rawPayload, signature, webhookSecret);
  } catch (err: any) {
    console.error('Stripe webhook signature verification failed:', err?.message);
    return res.status(400).json({ error: `Webhook signature verification failed: ${err?.message}` });
  }

  // Idempotency check: process each event ID exactly once
  const isNewEvent = await checkAndRecordWebhookEvent(event.id, 'stripe');
  if (!isNewEvent) {
    console.log(`Stripe webhook event ${event.id} already processed. Skipping.`);
    return res.status(200).json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const firebaseUid = session.metadata?.firebaseUid;
        const plan = (session.metadata?.plan as 'pro' | 'enterprise') || 'pro';

        if (firebaseUid) {
          await updateUserSubscription(firebaseUid, {
            plan,
            subscriptionStatus: 'active',
            provider: 'stripe',
            providerCustomerId: typeof session.customer === 'string' ? session.customer : session.customer?.id,
            providerSubscriptionId: typeof session.subscription === 'string' ? session.subscription : session.subscription?.id,
            currentPeriodStart: Date.now(),
            currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000,
            cancelAtPeriodEnd: false,
          });
          console.log(`Successfully activated ${plan} subscription for user ${firebaseUid} via Stripe Checkout.`);
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as any;
        const firebaseUid = sub.metadata?.firebaseUid;
        const plan = (sub.metadata?.plan as 'pro' | 'enterprise') || 'pro';

        if (firebaseUid) {
          let status: 'active' | 'trialing' | 'past_due' | 'cancelled' | 'expired' | 'incomplete' | 'payment_failed' = 'active';

          if (sub.status === 'active') status = 'active';
          else if (sub.status === 'trialing') status = 'trialing';
          else if (sub.status === 'past_due') status = 'past_due';
          else if (sub.status === 'canceled') status = 'cancelled';
          else if (sub.status === 'unpaid') status = 'payment_failed';
          else if (sub.status === 'incomplete' || sub.status === 'incomplete_expired') status = 'incomplete';

          const periodEnd = sub.current_period_end ? sub.current_period_end * 1000 : Date.now();

          await updateUserSubscription(firebaseUid, {
            plan: status === 'cancelled' && periodEnd < Date.now() ? 'free' : plan,
            subscriptionStatus: status,
            provider: 'stripe',
            providerCustomerId: typeof sub.customer === 'string' ? sub.customer : sub.customer?.id,
            providerSubscriptionId: sub.id,
            currentPeriodStart: sub.current_period_start ? sub.current_period_start * 1000 : Date.now(),
            currentPeriodEnd: periodEnd,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
          });
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        const subId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;

        if (subId) {
          console.log(`Stripe invoice payment succeeded for sub ${subId}, customer ${customerId}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        const subId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
        if (subId) {
          console.warn(`Stripe invoice payment failed for subscription ${subId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (err: any) {
    console.error(`Error processing Stripe webhook event ${event.id}:`, err?.message || err);
    return res.status(500).json({ error: 'Internal server error processing webhook payload.' });
  }
}
