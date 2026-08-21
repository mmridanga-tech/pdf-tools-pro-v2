import { Request, Response } from 'express';
import crypto from 'crypto';
import { updateUserSubscription, checkAndRecordWebhookEvent } from '../../services/firestore';

export default async function razorpayWebhookHandler(req: Request, res: Response): Promise<void> {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'] as string;

  if (secret && signature && req.rawBody) {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(req.rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      res.status(400).json({ error: 'Invalid signature' });
      return;
    }
  }

  const event = req.body;
  if (!event || !event.event) {
    res.status(400).json({ error: 'Invalid payload' });
    return;
  }

  const eventId = event.payload?.payment?.entity?.id || `rzp_${Date.now()}`;
  const isNew = await checkAndRecordWebhookEvent('razorpay', eventId, event.event, event.payload);
  if (!isNew) {
    res.status(200).json({ status: 'ok', note: 'Already processed' });
    return;
  }

  if (event.event === 'order.paid' || event.event === 'payment.captured') {
    const notes = event.payload?.payment?.entity?.notes || {};
    const uid = notes.uid;
    const plan = notes.plan || 'pro';
    if (uid) {
      await updateUserSubscription(uid, plan, 'razorpay', eventId);
    }
  }

  res.status(200).json({ status: 'ok' });
}
