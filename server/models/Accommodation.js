const mongoose = require('mongoose');

/**
 * Accommodation schema for listings.
 * Host is a reference to the User who created the listing.
 */
const accommodationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String },
    bedrooms: { type: Number },
    bathrooms: { type: Number },
    guests: { type: Number },
    type: { type: String },
    price: { type: Number, required: true },
    amenities: [{ type: String }],
    images: [{ type: String }],
    weeklyDiscount: { type: Number },
    cleaningFee: { type: Number },
    serviceFee: { type: Number },
    occupancyTaxes: { type: Number },
    host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Accommodation', accommodationSchema);
