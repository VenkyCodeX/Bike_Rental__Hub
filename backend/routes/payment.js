const express   = require('express');
const Razorpay  = require('razorpay');
const crypto    = require('crypto');
const router    = express.Router();

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// GET /api/payment/key  — expose public key_id to frontend
router.get('/key', (req, res) => {
  res.json({ key_id: process.env.RAZORPAY_KEY_ID });
});

// POST /api/payment/order  — create Razorpay order
router.post('/order', async (req, res) => {
  try {
    const { amount } = req.body; // amount in rupees
    if (!amount || amount < 1) return res.status(400).json({ message: 'Invalid amount' });

    const order = await razorpay.orders.create({
      amount:   Math.round(amount * 100), // paise
      currency: 'INR',
      receipt:  'brh_' + Date.now()
    });

    res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payment/verify  — verify signature after payment
router.post('/verify', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expected !== razorpay_signature)
    return res.status(400).json({ success: false, message: 'Payment verification failed' });

  res.json({ success: true });
});

module.exports = router;
