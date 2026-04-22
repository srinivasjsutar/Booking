// backend/seed.js
// Run this ONCE to insert hotels into MongoDB:
// node seed.js

require('dotenv').config();
const mongoose = require('mongoose');
const Hotel    = require('./models/Hotel');

const HOTELS = [
  { name: 'The Grand Palace', location: 'Bengaluru, Karnataka', pricePerNight: 4200, rating: 4.9, reviews: 312, tag: 'Best Seller', category: 'city',     featured: true,  image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600' },
  { name: 'Serenity Resort',  location: 'Goa, India',           pricePerNight: 6800, rating: 4.8, reviews: 198, tag: 'Luxury',      category: 'beach',    featured: true,  image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600' },
  { name: 'Mountain Retreat', location: 'Manali, HP',           pricePerNight: 3100, rating: 4.7, reviews: 245, tag: 'Nature',      category: 'mountain', featured: true,  image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600' },
  { name: 'Hotel Leela',      location: 'Mumbai',               pricePerNight: 5500, rating: 4.6, reviews: 180, tag: 'Popular',     category: 'luxury',   featured: false, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400' },
  { name: 'Taj Vivanta',      location: 'Delhi',                pricePerNight: 7200, rating: 4.8, reviews: 320, tag: 'Top Rated',   category: 'luxury',   featured: false, image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400' },
  { name: 'ITC Windsor',      location: 'Bengaluru',            pricePerNight: 4900, rating: 4.7, reviews: 210, tag: 'Premium',     category: 'city',     featured: false, image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400' },
  { name: 'Beach Cove Inn',   location: 'Kovalam, Kerala',      pricePerNight: 2800, rating: 4.5, reviews: 156, tag: 'Cozy',        category: 'beach',    featured: false, image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400' },
  { name: 'Alpine Lodge',     location: 'Shimla, HP',           pricePerNight: 2200, rating: 4.4, reviews: 98,  tag: 'Budget',      category: 'budget',   featured: false, image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400' },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    // Clear existing hotels
    await Hotel.deleteMany({});
    console.log('🗑️  Cleared existing hotels');

    // Insert new hotels
    await Hotel.insertMany(HOTELS);
    console.log('✅ Hotels inserted successfully!');

    mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seed();