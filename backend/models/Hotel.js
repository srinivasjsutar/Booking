// backend/models/Hotel.js
const mongoose = require('mongoose');

const HotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Hotel name is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    pricePerNight: {
      type: Number,
      required: [true, 'Price is required'],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    tag: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['city', 'beach', 'mountain', 'luxury', 'budget', 'resort', 'all'],
      default: 'city',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Hotel', HotelSchema);