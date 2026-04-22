const mongoose = require('mongoose');

const HotelSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, trim: true },
    location:     { type: String, required: true },
    description:  { type: String, default: '' },
    pricePerNight:{ type: Number, required: true },
    rating:       { type: Number, default: 4.5, min: 1, max: 5 },
    reviews:      { type: Number, default: 0 },
    tag:          { type: String, default: '' },   // 'Best Seller', 'Luxury', etc.
    category:     { type: String, default: 'city' }, // beach, city, mountain, luxury, budget, resort
    image:        { type: String, default: '' },
    images:       [{ type: String }],
    amenities:    [{ type: String }],              // ['WiFi', 'Pool', 'Gym', ...]
    isFeatured:   { type: Boolean, default: false },
    totalRooms:   { type: Number, default: 10 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Hotel', HotelSchema);