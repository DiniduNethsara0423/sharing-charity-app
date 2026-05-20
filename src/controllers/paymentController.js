const Stripe = require('stripe');
const { Transaction, Item } = require('../models');

const stripeSecret = process.env.STRIPE_SECRET_KEY || '';
const stripe = Stripe(stripeSecret);

async function markItemSold(itemId) {
  if (!itemId) {
    return;
  }

  const item = await Item.findByPk(itemId);
  if (item && item.status !== 'sold') {
    await item.update({ status: 'sold' });
  }
}

exports.createPayment = async (req, res, next) => {
  try {
    const { buyer_id, seller_id, item_id, amount, currency } = req.body;
    if (!buyer_id || !seller_id || !item_id || !amount) return res.status(400).json({ success: false, code: 400, message: 'Missing required fields', data: null });

    // create transaction record with pending status
    const tx = await Transaction.create({ buyer_id, seller_id, item_id, amount, type: 'stripe', status: 'pending' });

    // create stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(parseFloat(amount) * 100), // cents
      currency: (currency || 'usd').toLowerCase(),
      metadata: { transaction_id: String(tx.transaction_id) },
    });

    res.status(201).json({ success: true, code: 201, message: 'Payment initiated', data: { client_secret: paymentIntent.client_secret, transaction: tx } });
  } catch (err) {
    next(err);
  }
};

exports.webhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  let event;
  try {
    // when using express.raw middleware the raw body is available as req.body (a Buffer)
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const txId = paymentIntent.metadata && paymentIntent.metadata.transaction_id;
    if (txId) {
      try {
        const tx = await Transaction.findByPk(txId);
        if (tx) {
          await tx.update({ status: 'completed' });
          await markItemSold(tx.item_id);
        }
      } catch (e) {
        console.error('Failed to update transaction status from webhook', e);
      }
    }
  } else if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object;
    const txId = paymentIntent.metadata && paymentIntent.metadata.transaction_id;
    if (txId) {
      try {
        const tx = await Transaction.findByPk(txId);
        if (tx) {
          await tx.update({ status: 'failed' });
        }
      } catch (e) {
        console.error('Failed to update transaction status from webhook (failed)', e);
      }
    }
  }

  res.json({ received: true });
};
