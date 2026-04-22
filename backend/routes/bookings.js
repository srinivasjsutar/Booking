const express = require('express');
const router  = express.Router();
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Hotel   = require('../models/Hotel');
const auth = require('../middleware/auth');

// ── POST /api/bookings  — Create a booking ────────────────────────────────────
router.post(
  '/',
  auth,
  [
    body('hotelId').notEmpty().withMessage('Hotel ID is required'),
    body('checkIn').isISO8601().withMessage('Valid check-in date required'),
    body('checkOut').isISO8601().withMessage('Valid check-out date required'),
    body('guests').isInt({ min: 1, max: 20 }).withMessage('Guests must be 1–20'),
    body('rooms').isInt({ min: 1 }).withMessage('At least 1 room required'),
    body('guestName').notEmpty().withMessage('Guest name is required'),
    body('guestEmail').isEmail().withMessage('Valid guest email required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { hotelId, checkIn, checkOut, guests, rooms, guestName, guestEmail, guestPhone, specialRequests } = req.body;

      const hotel = await Hotel.findById(hotelId);
      if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });

      const checkInDate  = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      if (checkInDate >= checkOutDate) {
        return res.status(400).json({ success: false, message: 'Check-out must be after check-in' });
      }

      const msPerDay     = 1000 * 60 * 60 * 24;
      const totalNights  = Math.ceil((checkOutDate - checkInDate) / msPerDay);
      const totalAmount  = totalNights * hotel.pricePerNight * rooms;

      const booking = await Booking.create({
        user:         req.user.id,
        hotel:        hotelId,
        checkIn:      checkInDate,
        checkOut:     checkOutDate,
        guests,
        rooms,
        totalNights,
        pricePerNight: hotel.pricePerNight,
        totalAmount,
        guestName,
        guestEmail,
        guestPhone:   guestPhone || '',
        specialRequests: specialRequests || '',
        status: 'confirmed',
      });

      await booking.populate('hotel', 'name location image');

      res.status(201).json({ success: true, message: 'Booking confirmed!', booking });
    } catch (err) {
      console.error('Booking error:', err.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// ── GET /api/bookings/my  — Get logged-in user's bookings ─────────────────────
router.get('/my', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('hotel', 'name location image pricePerNight rating')
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/bookings/:id  — Get single booking ───────────────────────────────
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user.id })
      .populate('hotel');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── PATCH /api/bookings/:id/cancel ────────────────────────────────────────────
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user.id });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Already cancelled' });
    }
    booking.status = 'cancelled';
    await booking.save();
    res.json({ success: true, message: 'Booking cancelled', booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;