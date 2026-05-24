require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const connectDB = require('./config/db');

connectDB();

const app = express();

// ── MIDDLEWARE ──
app.use(cors());
app.use(express.json());

// Serve frontend static files from parent directory
app.use(express.static(path.join(__dirname, '..')));

// ── API ROUTES ──
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/bikes',    require('./routes/bikes'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/reviews',  require('./routes/reviews'));
app.use('/api/upload',   require('./routes/upload'));
app.use('/api/payment',  require('./routes/payment'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'Bike Rental Hub API' }));

// ── CLEAN URLs ──
app.get('/bikes',      (req, res) => res.sendFile(path.join(__dirname, '..', 'bikes.html')));
app.get('/admin',      (req, res) => res.sendFile(path.join(__dirname, '..', 'admin.html')));
app.get('/terms',      (req, res) => res.sendFile(path.join(__dirname, '..', 'terms.html')));
app.get('/mybookings', (req, res) => res.sendFile(path.join(__dirname, '..', 'mybookings.html')));

// Fallback → serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ── GLOBAL ERROR HANDLER ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));
