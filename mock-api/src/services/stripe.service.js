import Stripe from 'stripe';
import config from '../config/env.js';
import logger from '../utils/logger.js';

// Initialize Stripe (null if no key configured)
const stripe = config.stripeSecretKey ? new Stripe(config.stripeSecretKey) : null;

// Check if Stripe is configured
export const isStripeConfigured = () => !!stripe;

// Create a checkout session
export const createCheckoutSession = async (order, successUrl, cancelUrl) => {
  if (!stripe) {
    logger.warn('Stripe not configured - returning mock checkout URL');
    return {
      id: `mock_session_${order.id}`,
      url: `${config.corsOrigin}/checkout/success?session_id=mock_${order.id}`,
    };
  }

  try {
    const lineItems = order.items.map(item => ({
      price_data: {
        currency: 'gbp',
        product_data: {
          name: item.service?.title || `Service #${item.serviceId}`,
          description: item.service?.summary || undefined,
        },
        unit_amount: Math.round(item.price * 100), // Convert to pence
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      customer_email: order.customerEmail,
      metadata: {
        orderId: order.id.toString(),
        orderNumber: order.orderNumber,
      },
      billing_address_collection: 'required',
    });

    logger.info(`Stripe checkout session created: ${session.id}`);
    return session;
  } catch (error) {
    logger.error('Stripe checkout session error:', error);
    throw error;
  }
};

// Retrieve checkout session
export const getCheckoutSession = async (sessionId) => {
  if (!stripe) {
    return { id: sessionId, payment_status: 'paid' };
  }

  try {
    return await stripe.checkout.sessions.retrieve(sessionId);
  } catch (error) {
    logger.error('Stripe session retrieval error:', error);
    throw error;
  }
};

// Create a payment intent (alternative to checkout sessions)
export const createPaymentIntent = async (amount, currency = 'gbp', metadata = {}) => {
  if (!stripe) {
    return { id: `mock_pi_${Date.now()}`, client_secret: 'mock_secret' };
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return paymentIntent;
  } catch (error) {
    logger.error('Stripe payment intent error:', error);
    throw error;
  }
};

// Refund a payment
export const refundPayment = async (paymentIntentId, amount = null) => {
  if (!stripe) {
    return { id: `mock_refund_${Date.now()}`, status: 'succeeded' };
  }

  try {
    const refundData = { payment_intent: paymentIntentId };
    if (amount) {
      refundData.amount = Math.round(amount * 100);
    }

    const refund = await stripe.refunds.create(refundData);
    logger.info(`Stripe refund created: ${refund.id}`);
    return refund;
  } catch (error) {
    logger.error('Stripe refund error:', error);
    throw error;
  }
};

// Verify webhook signature
export const verifyWebhookSignature = (payload, signature) => {
  if (!stripe || !config.stripeWebhookSecret) {
    logger.warn('Stripe webhook verification skipped - not configured');
    return JSON.parse(payload);
  }

  try {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      config.stripeWebhookSecret
    );
  } catch (error) {
    logger.error('Stripe webhook verification failed:', error);
    throw error;
  }
};

// Handle webhook events
export const handleWebhookEvent = async (event) => {
  switch (event.type) {
    case 'checkout.session.completed':
      return {
        type: 'checkout_completed',
        sessionId: event.data.object.id,
        orderId: event.data.object.metadata?.orderId,
        orderNumber: event.data.object.metadata?.orderNumber,
        paymentStatus: event.data.object.payment_status,
      };

    case 'payment_intent.succeeded':
      return {
        type: 'payment_succeeded',
        paymentIntentId: event.data.object.id,
        metadata: event.data.object.metadata,
      };

    case 'payment_intent.payment_failed':
      return {
        type: 'payment_failed',
        paymentIntentId: event.data.object.id,
        error: event.data.object.last_payment_error?.message,
      };

    default:
      return { type: 'unknown', eventType: event.type };
  }
};

export default {
  isStripeConfigured,
  createCheckoutSession,
  getCheckoutSession,
  createPaymentIntent,
  refundPayment,
  verifyWebhookSignature,
  handleWebhookEvent,
};
