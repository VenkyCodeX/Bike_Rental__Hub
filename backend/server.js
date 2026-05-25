require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const connectDB = require('./config/db');

connectDB();

const app = express();

// ── MIDDLEWARE ──
app.use(cors({
  origin: [
    'http://localhost:5000',
    'http://localhost:3000',
    'https://venkycodex.github.io',
    'https://bikerentalhub-production.up.railway.app',
    'https://bike-rental-hub-lovat.vercel.app',
    'https://bikerentalhub.co.in',
    'https://www.bikerentalhub.co.in'
  ],
  credentials: true
}));
app.use(express.json());

// ── API ROUTES ──
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/bikes',    require('./routes/bikes'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/reviews',  require('./routes/reviews'));
app.use('/api/upload',   require('./routes/upload'));
app.use('/api/payment',  require('./routes/payment'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'Bike Rental Hub API' }));

// Fallback
app.get('*', (req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// ── GLOBAL ERROR HANDLER ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));
