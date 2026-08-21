import { Request, Response } from 'express';
import Stripe from 'stripe';
import { updateUserSubscription, checkAndRecordWebhookEvent } from '../../services/firestore';

export default async function stripeWebhookHandler(req: Request, res: Response): Promise<void> {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  if (webhookSecret && sig && req.rawBody) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
      event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    } catch (err: any) {
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }
  } else {
    event = req.body;
  }

  if (!event || !event.type) {
    res.status(400).json({ error: 'Invalid event' });
    return;
  }

  const isNew = await checkAndRecordWebhookEvent('stripe', event.id, event.type, event.data?.object);
  if (!isNew) {
    res.status(200).json({ received: true, note: 'Already processed' });
    return;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const uid = session.client_reference_id;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (uid) {
          await updateUserSubscription(uid, 'pro', 'stripe', subscriptionId, customerId);
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        // In real flow look up user by customer id
        break;
      }
    }
  } catch (err: any) {
    console.warn('Webhook processing error:', err.message);
  }

  res.status(200).json({ received: true });
}
