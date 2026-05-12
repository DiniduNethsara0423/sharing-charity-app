const crypto = require('crypto');
const { Transaction } = require('../models');

const MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID || '';
const PAYHERE_SECRET = process.env.PAYHERE_SECRET || '';
const PAYHERE_SANDBOX = (process.env.PAYHERE_SANDBOX || 'true') === 'true';
const PAYHERE_URL = PAYHERE_SANDBOX ? 'https://sandbox.payhere.lk/pay/checkout' : 'https://www.payhere.lk/pay/checkout';

exports.createPayment = async (req, res, next) => {
  try {
    const { buyer_id, seller_id, item_id, amount, currency, first_name, last_name, email, phone, return_url, cancel_url } = req.body;
    if (!buyer_id || !seller_id || !item_id || !amount) return res.status(400).json({ success: false, code: 400, message: 'Missing required fields', data: null });

    const tx = await Transaction.create({ buyer_id, seller_id, item_id, amount, type: 'payhere', status: 'pending' });

    const order_id = String(tx.transaction_id);
    const notify_url = (process.env.BASE_URL || (`http://localhost:${process.env.PORT || 3000}`)) + '/payments/payhere/notify';

    const formFields = {
      merchant_id: MERCHANT_ID,
      return_url: return_url || (process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`) + '/payments/success',
      cancel_url: cancel_url || (process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`) + '/payments/cancel',
      notify_url,
      order_id,
      items: `Item ${item_id}`,
      currency: currency || 'LKR',
      amount: amount,
      first_name: first_name || 'Buyer',
      last_name: last_name || 'Name',
      email: email || 'buyer@example.com',
      phone: phone || '',
    };

    // Generate a simple HTML form that auto-submits to PayHere sandbox
    let html = `<!doctype html><html><head><meta charset="utf-8"><title>Redirecting to PayHere</title></head><body>`;
    html += `<p>Redirecting to payment provider...</p>`;
    html += `<form id="payhere_form" action="${PAYHERE_URL}" method="post">`;
    for (const k of Object.keys(formFields)) {
      html += `<input type="hidden" name="${k}" value="${String(formFields[k]).replace(/\"/g, '&quot;')}">`;
    }
    html += `</form><script>document.getElementById('payhere_form').submit();</script></body></html>`;

    res.status(200).send(html);
  } catch (err) {
    next(err);
  }
};

exports.notify = async (req, res, next) => {
  try {
    const body = req.body || {};

    // Basic verification using MD5 signature if provided
    const { merchant_id, order_id, payhere_amount, payhere_currency, status_code, md5sig } = body;
    if (PAYHERE_SECRET && md5sig) {
      const data = `${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${PAYHERE_SECRET}`;
      const expected = crypto.createHash('md5').update(data).digest('hex');
      if (expected !== md5sig) {
        console.warn('PayHere MD5 signature mismatch');
        return res.status(400).send('Invalid signature');
      }
    }

    // status_code '2' indicates successful payment in PayHere notifications
    const success = String(body.status_code) === '2' || String(body.status) === '2' || String(body.status).toLowerCase() === 'paid';

    const txId = order_id;
    if (txId) {
      try {
        const tx = await Transaction.findByPk(txId);
        if (tx) {
          await tx.update({ status: success ? 'completed' : 'failed' });
        }
      } catch (e) {
        console.error('Failed to update transaction from PayHere notify', e);
      }
    }

    // Respond with 200 OK to acknowledge
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
};
