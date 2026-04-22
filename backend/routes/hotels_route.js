// backend/routes/hotels.js
const express = require('express');
const router  = express.Router();
const Hotel   = require('../models/Hotel');

// GET /api/hotels/featured
router.get('/featured', async (req, res) => {
  try {
    const featured = await Hotel.find({ featured: true });
    res.json({ success: true, hotels: featured });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/hotels/popular
router.get('/popular', async (req, res) => {
  try {
    const popular = await Hotel.find({ featured: false }).sort({ rating: -1 });
    res.json({ success: true, hotels: popular });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/hotels/offers
router.get('/offers', async (req, res) => {
  try {
    const offers = [
      { id: '1', title: 'Weekend Getaway', discount: 30, description: 'Up to 30% off Weekend Stays', validTill: '2025-06-30' },
      { id: '2', title: 'Early Bird',      discount: 20, description: '20% off on advance bookings',  validTill: '2025-07-15' },
    ];
    res.json({ success: true, offers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/hotels/category/:category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const query = category === 'all' ? {} : { category };
    const hotels = await Hotel.find(query).sort({ rating: -1 });
    res.json({ success: true, hotels });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/hotels/search
router.post('/search', async (req, res) => {
  try {
    const { query = '', minPrice, maxPrice, minRating, category } = req.body;

    const filter = {
      $or: [
        { name:     { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } },
      ],
    };

    if (minPrice) filter.pricePerNight = { ...filter.pricePerNight, $gte: minPrice };
    if (maxPrice) filter.pricePerNight = { ...filter.pricePerNight, $lte: maxPrice };
    if (minRating) filter.rating = { $gte: minRating };
    if (category && category !== 'all') filter.category   = category;

    const hotels = await Hotel.find(filter).sort({ rating: -1 });
    res.json({ success: true, hotels, total: hotels.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/hotels/:id
router.get('/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });
    res.json({ success: true, hotel });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;