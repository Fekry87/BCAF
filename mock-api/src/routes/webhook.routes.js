import { Router } from 'express';
import prisma from '../config/database.js';
import { verifyWebhookSignature, handleWebhookEvent } from '../services/stripe.service.js';
import { sendOrderConfirmation } from '../services/email.service.js';
import logger from '../utils/logger.js';

const router = Router();

// Stripe webhook
router.post('/stripe', async (req, res) => {
  const signature = req.headers['stripe-signature'];

  try {
    const event = verifyWebhookSignature(req.body, signature);
    const result = await handleWebhookEvent(event);

    logger.info(`Stripe webhook received: ${result.type}`);

    switch (result.type) {
      case 'checkout_completed':
        if (result.orderId) {
          const order = await prisma.order.update({
            where: { id: parseInt(result.orderId) },
            data: {
              paymentStatus: result.paymentStatus === 'paid' ? 'PAID' : 'UNPAID',
              status: 'CONFIRMED',
            },
            include: {
              items: { include: { service: true } },
            },
          });

          logger.info(`Order ${result.orderNumber} payment completed`);

          // Send confirmation email
          sendOrderConfirmation(order)
            .catch(err => logger.error('Order confirmation email failed:', err));
        }
        break;

      case 'payment_failed':
        if (result.paymentIntentId) {
          // Find order by payment intent and update status
          logger.warn(`Payment failed for intent: ${result.paymentIntentId}`);
        }
        break;
    }

    res.json({ received: true });
  } catch (err) {
    logger.error('Stripe webhook error:', err);
    res.status(400).json({ error: err.message });
  }
});

// Generic webhook endpoint for other integrations
router.post('/generic/:provider', async (req, res) => {
  const { provider } = req.params;

  logger.info(`Webhook received from: ${provider}`, {
    headers: req.headers,
    body: req.body,
  });

  // Handle different providers
  switch (provider) {
    case 'suitedash':
      // Handle SuiteDash webhooks
      break;

    case 'sendgrid':
      // Handle SendGrid email events
      break;

    default:
      logger.warn(`Unknown webhook provider: ${provider}`);
  }

  res.json({ received: true });
});

export default router;
