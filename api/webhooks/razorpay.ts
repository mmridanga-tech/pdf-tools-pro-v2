import { Request, Response } from 'express';
import crypto from 'crypto';
import { updateUserSubscription, checkAndRecordWebhookEvent } from '../services/firestore.ts';

export default async function razorpayWebhookHandler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.warn('Razorpay webhook received but RAZORPAY_WEBHOOK_SECRET is not configured.');
    return res.status(500).json({ error: 'Razorpay webhook secret is not configured.' });
  }

  const signature = req.headers['x-razorpay-signature'] as string;
  if (!signature) {
    return res.status(400).json({ error: 'Missing x-razorpay-signature header' });
  }

  // Get raw body payload for HMAC verification
  const rawPayload = (req as any).rawBody
    ? (req as any).rawBody.toString('utf8')
    : JSON.stringify(req.body);

  // Verify HMAC SHA256 signature
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawPayload)
    .digest('hex');

  const isSignatureValid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );

  if (!isSignatureValid) {
    console.error('Razorpay webhook signature verification failed.');
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  const eventPayload = req.body || {};
  const event = eventPayload.event;
  const eventId = eventPayload.account_id ? `${eventPayload.account_id}_${Date.now()}` : `rzp_${Date.now()}`;

  // Idempotency check
  const isNewEvent = await checkAndRecordWebhookEvent(eventId, 'razorpay');
  if (!isNewEvent) {
    console.log(`Razorpay webhook event ${eventId} already processed. Skipping.`);
    return res.status(200).json({ received: true, duplicate: true });
  }

  try {
    const payload = eventPayload.payload || {};

    if (event === 'order.paid' || event === 'payment.captured') {
      const entity = payload.payment?.entity || payload.order?.entity || {};
      const notes = entity.notes || {};
      const firebaseUid = notes.firebaseUid;
      const plan = (notes.plan as 'pro' | 'enterprise') || 'pro';

      if (firebaseUid) {
        await updateUserSubscription(firebaseUid, {
          plan,
          subscriptionStatus: 'active',
          provider: 'razorpay',
          providerCustomerId: entity.customer_id || entity.email || firebaseUid,
          providerSubscriptionId: entity.order_id || entity.id,
          currentPeriodStart: Date.now(),
          currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000,
          cancelAtPeriodEnd: false,
        });
        console.log(`Successfully activated ${plan} subscription for user ${firebaseUid} via Razorpay.`);
      }
    } else if (event === 'subscription.halted' || event === 'subscription.cancelled') {
      const subEntity = payload.subscription?.entity || {};
      const notes = subEntity.notes || {};
      const firebaseUid = notes.firebaseUid;

      if (firebaseUid) {
        await updateUserSubscription(firebaseUid, {
          plan: 'free',
          subscriptionStatus: event === 'subscription.cancelled' ? 'cancelled' : 'payment_failed',
          provider: 'razorpay',
          providerSubscriptionId: subEntity.id,
          currentPeriodEnd: Date.now(),
          cancelAtPeriodEnd: true,
        });
        console.log(`Updated user ${firebaseUid} Razorpay subscription status to ${event}.`);
      }
    }

    return res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('Error processing Razorpay webhook:', err?.message || err);
    return res.status(500).json({ error: 'Internal server error processing Razorpay webhook.' });
  }
}
