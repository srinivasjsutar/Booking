const express = require('express');
const router  = express.Router();
const Hotel   = require('../models/Hotel');
const auth    = require('../middleware/auth');

// ── GET /api/hotels/featured ──────────────────────────────────────────────────
router.get('/featured', async (req, res) => {
  try {
    const hotels = await Hotel.find({ isFeatured: true }).limit(10).sort({ rating: -1 });
    res.json({ success: true, hotels });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/hotels/popular ───────────────────────────────────────────────────
router.get('/popular', async (req, res) => {
  try {
    const hotels = await Hotel.find().sort({ reviews: -1, rating: -1 }).limit(20);
    res.json({ success: true, hotels });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/hotels/category/:cat ─────────────────────────────────────────────
router.get('/category/:cat', async (req, res) => {
  try {
    const hotels = await Hotel.find({ category: req.params.cat })
      .sort({ rating: -1 }).limit(20);
    res.json({ success: true, hotels });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/hotels/search?q=text ─────────────────────────────────────────────
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, hotels: [] });
    const regex = new RegExp(q, 'i');
    const hotels = await Hotel.find({
      $or: [{ name: regex }, { location: regex }, { category: regex }],
    }).limit(20);
    res.json({ success: true, hotels });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET /api/hotels/:id ───────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });
    res.json({ success: true, hotel });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── POST /api/hotels  (admin seed — protected) ────────────────────────────────
router.post('/', auth, async (req, res) => {
  try {
    const hotel = await Hotel.create(req.body);
    res.status(201).json({ success: true, hotel });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;