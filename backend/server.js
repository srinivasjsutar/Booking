// backend/server.js
require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const connectDB = require('./config/db');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/user',     require('./routes/user'));
app.use('/api/hotels',   require('./routes/hotels'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/kyc',      require('./routes/kyc'));      // ← KYC added

// ── Seed route (dev only) ─────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.post('/api/seed', async (req, res) => {
    const Hotel = require('./models/Hotel');
    await Hotel.deleteMany({});
    const hotels = [
      { name: 'The Grand Palace',   location: 'Bengaluru, Karnataka', pricePerNight: 4200, rating: 4.9, reviews: 312, tag: 'Best Seller', category: 'luxury',   isFeatured: true,  image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600',  amenities: ['WiFi','Pool','Gym','Spa','Restaurant'] },
      { name: 'Serenity Resort',    location: 'Goa, India',           pricePerNight: 6800, rating: 4.8, reviews: 198, tag: 'Luxury',     category: 'resort',   isFeatured: true,  image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600', amenities: ['WiFi','Pool','Beach','Bar','Spa'] },
      { name: 'Mountain Retreat',   location: 'Manali, HP',           pricePerNight: 3100, rating: 4.7, reviews: 245, tag: 'Nature',     category: 'mountain', isFeatured: true,  image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600', amenities: ['WiFi','Fireplace','Trekking','Restaurant'] },
      { name: 'Hotel Leela',        location: 'Mumbai, Maharashtra',  pricePerNight: 5500, rating: 4.6, reviews: 421, tag: '',          category: 'city',     isFeatured: false, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',  amenities: ['WiFi','Pool','Gym','Restaurant','Bar'] },
      { name: 'Taj Vivanta',        location: 'Delhi, India',         pricePerNight: 7200, rating: 4.8, reviews: 533, tag: 'Top Rated', category: 'luxury',   isFeatured: false, image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400',   amenities: ['WiFi','Pool','Spa','Restaurant','Concierge'] },
      { name: 'ITC Windsor',        location: 'Bengaluru, Karnataka', pricePerNight: 4900, rating: 4.7, reviews: 311, tag: '',          category: 'city',     isFeatured: false, image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400',  amenities: ['WiFi','Gym','Restaurant','Business Center'] },
      { name: 'Beach Haven',        location: 'Kovalam, Kerala',      pricePerNight: 3800, rating: 4.5, reviews: 187, tag: '',          category: 'beach',    isFeatured: false, image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',  amenities: ['WiFi','Beach','Pool','Restaurant'] },
      { name: 'Budget Stay Inn',    location: 'Jaipur, Rajasthan',    pricePerNight: 1200, rating: 4.2, reviews: 98,  tag: 'Budget',    category: 'budget',   isFeatured: false, image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400',  amenities: ['WiFi','AC','Breakfast'] },
    ];
    await Hotel.insertMany(hotels);
    res.json({ success: true, message: `${hotels.length} hotels seeded` });
  });
}

app.get('/', (req, res) => res.json({ message: 'Booking API is running ✅' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on http://0.0.0.0:${PORT}`));