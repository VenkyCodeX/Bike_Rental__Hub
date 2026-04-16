const Booking = require('../models/Booking');

// POST /api/bookings
const createBooking = async (req, res) => {
  try {
    const { customer, phone, bike, bikeId, from, to, amount, payMethod, pickupTime, dropTime, delivery, paymentId } = req.body;
    if (!customer || !phone || !bike || !from || !to || !amount)
      return res.status(400).json({ message: 'All booking fields are required' });
    const booking = await Booking.create({ customer, phone, bike, bikeId, from, to, amount, payMethod, pickupTime, dropTime, delivery, paymentId });
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings  (admin)
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 }).lean();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings/stats  (admin)
const getStats = async (req, res) => {
  try {
    const bookings  = await Booking.find().lean();
    const revenue   = bookings.reduce((s, b) => s + (b.amount || 0), 0);
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    res.json({ total: bookings.length, revenue, confirmed });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/bookings/:id/status  (admin)
const updateBookingStatus = async (req, res) => {
  try {
    const { status, dropTime } = req.body;
    if (!['confirmed', 'pending', 'cancelled', 'running', 'returned'].includes(status))
      return res.status(400).json({ message: 'Invalid status' });

    const update = { status };
    if (dropTime) update.dropTime = dropTime;

    const booking = await Booking.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Auto-update bike status
    if (booking.bikeId) {
      const Bike = require('../models/Bike');
      if (status === 'running')  await Bike.findByIdAndUpdate(booking.bikeId, { status: 'rented' });
      if (status === 'returned') await Bike.findByIdAndUpdate(booking.bikeId, { status: 'available' });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings/phone/:phone  (public)
const getBookingsByPhone = async (req, res) => {
  try {
    const bookings = await Booking.find({ phone: req.params.phone }).sort({ createdAt: -1 }).lean();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createBooking, getBookings, getStats, updateBookingStatus, getBookingsByPhone };
