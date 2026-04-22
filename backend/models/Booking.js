const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
    checkIn:  { type: Date, required: true },
    checkOut: { type: Date, required: true },
    guests:   { type: Number, required: true, min: 1, max: 20 },
    rooms:    { type: Number, required: true, min: 1, default: 1 },
    totalNights: { type: Number, required: true },
    pricePerNight: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'confirmed',
    },
    guestName:  { type: String, required: true },
    guestEmail: { type: String, required: true },
    guestPhone: { type: String, default: '' },
    specialRequests: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', BookingSchema);