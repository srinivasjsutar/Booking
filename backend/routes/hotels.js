// backend/routes/hotels.js
const express = require('express');
const router  = express.Router();

// ── Mock Data (replace with your MongoDB Hotel model) ──────────────────────
const HOTELS = [
  { _id: '1', name: 'The Grand Palace', location: 'Bengaluru, Karnataka', pricePerNight: 4200, rating: 4.9, reviews: 312, tag: 'Best Seller', category: 'city',    featured: true,  image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600' },
  { _id: '2', name: 'Serenity Resort',  location: 'Goa, India',           pricePerNight: 6800, rating: 4.8, reviews: 198, tag: 'Luxury',      category: 'beach',   featured: true,  image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600' },
  { _id: '3', name: 'Mountain Retreat', location: 'Manali, HP',           pricePerNight: 3100, rating: 4.7, reviews: 245, tag: 'Nature',      category: 'mountain',featured: true,  image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600' },
  { _id: '4', name: 'Hotel Leela',      location: 'Mumbai',               pricePerNight: 5500, rating: 4.6, reviews: 180, tag: 'Popular',     category: 'luxury',  featured: false, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400' },
  { _id: '5', name: 'Taj Vivanta',      location: 'Delhi',                pricePerNight: 7200, rating: 4.8, reviews: 320, tag: 'Top Rated',   category: 'luxury',  featured: false, image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400' },
  { _id: '6', name: 'ITC Windsor',      location: 'Bengaluru',            pricePerNight: 4900, rating: 4.7, reviews: 210, tag: 'Premium',     category: 'city',    featured: false, image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400' },
  { _id: '7', name: 'Beach Cove Inn',   location: 'Kovalam, Kerala',      pricePerNight: 2800, rating: 4.5, reviews: 156, tag: 'Cozy',        category: 'beach',   featured: false, image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400' },
  { _id: '8', name: 'Alpine Lodge',     location: 'Shimla, HP',           pricePerNight: 2200, rating: 4.4, reviews: 98,  tag: 'Budget',      category: 'budget',  featured: false, image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400' },
];

// GET /api/hotels/featured
router.get('/featured', (req, res) => {
  try {
    const featured = HOTELS.filter(h => h.featured);
    res.json({ success: true, hotels: featured });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/hotels/popular
router.get('/popular', (req, res) => {
  try {
    const popular = HOTELS
      .filter(h => !h.featured)
      .sort((a, b) => b.rating - a.rating);
    res.json({ success: true, hotels: popular });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/hotels/offers
router.get('/offers', (req, res) => {
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
router.get('/category/:category', (req, res) => {
  try {
    const { category } = req.params;
    const filtered = category === 'all'
      ? HOTELS
      : HOTELS.filter(h => h.category === category);
    res.json({ success: true, hotels: filtered });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/hotels/search
router.post('/search', (req, res) => {
  try {
    const { query = '', minPrice, maxPrice, minRating, category } = req.body;
    let results = HOTELS.filter(h =>
      h.name.toLowerCase().includes(query.toLowerCase()) ||
      h.location.toLowerCase().includes(query.toLowerCase())
    );
    if (minPrice)   results = results.filter(h => h.pricePerNight >= minPrice);
    if (maxPrice)   results = results.filter(h => h.pricePerNight <= maxPrice);
    if (minRating)  results = results.filter(h => h.rating >= minRating);
    if (category && category !== 'all') results = results.filter(h => h.category === category);
    res.json({ success: true, hotels: results, total: results.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/hotels/:id
router.get('/:id', (req, res) => {
  try {
    const hotel = HOTELS.find(h => h._id === req.params.id);
    if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });
    res.json({ success: true, hotel });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;