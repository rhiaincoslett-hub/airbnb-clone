const mongoose = require('mongoose');

/**
 * Reservation schema linking accommodation, guest user, and host.
 */
const reservationSchema = new mongoose.Schema(
  {
    accommodation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Accommodation',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalPrice: { type: Number },
    guests: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reservation', reservationSchema);
