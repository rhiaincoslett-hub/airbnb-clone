require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Accommodation = require('./models/Accommodation');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('Missing MONGO_URI in environment (.env)');
  process.exit(1);
}

const HOST_USERNAME = 'host';
const HOST_PASSWORD = 'host123';

const LISTINGS = [
  {
    location: 'Cape Town',
    title: 'Stunning Sea View Apartment in Cape Town',
    description: 'Wake up to Table Mountain and the Atlantic from this bright, modern apartment. Walking distance to the V&A Waterfront, beaches, and restaurants. Secure building with parking.',
    bedrooms: 2,
    bathrooms: 2,
    guests: 4,
    type: 'Entire place',
    price: 185,
    amenities: ['wifi', 'kitchen', 'parking', 'ac', 'heating', 'tv', 'workspace', 'washer'],
    weeklyDiscount: 10,
    cleaningFee: 45,
    serviceFee: 28,
    occupancyTaxes: 12,
  },
  {
    location: 'Durban',
    title: 'Beachfront Holiday Home in Durban',
    description: 'Steps from the golden sands of Durban beach. Spacious family home with a braai area and garden. Ideal for surf, sun, and exploring the city.',
    bedrooms: 3,
    bathrooms: 2,
    guests: 6,
    type: 'Entire place',
    price: 145,
    amenities: ['wifi', 'kitchen', 'parking', 'pool', 'tv', 'washer', 'dryer', 'ac'],
    weeklyDiscount: 15,
    cleaningFee: 55,
    serviceFee: 32,
    occupancyTaxes: 10,
  },
  {
    location: 'Johannesburg',
    title: 'Modern Loft in Sandton, Johannesburg',
    description: 'Central Sandton loft with easy access to shopping, business hubs, and Gautrain. Sleek open-plan living, high-speed wifi, and secure parking.',
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    type: 'Entire place',
    price: 95,
    amenities: ['wifi', 'kitchen', 'parking', 'ac', 'tv', 'workspace', 'heating'],
    weeklyDiscount: 5,
    cleaningFee: 35,
    serviceFee: 18,
    occupancyTaxes: 8,
  },
  {
    location: 'Pretoria',
    title: 'Quiet Garden Cottage in Pretoria East',
    description: 'Peaceful cottage in a leafy suburb, perfect for work or relaxation. Private garden, braai area, and off-street parking. Close to restaurants and shops.',
    bedrooms: 2,
    bathrooms: 1,
    guests: 4,
    type: 'Entire place',
    price: 78,
    amenities: ['wifi', 'kitchen', 'parking', 'ac', 'tv', 'workspace', 'heating', 'washer'],
    weeklyDiscount: 12,
    cleaningFee: 40,
    serviceFee: 22,
    occupancyTaxes: 9,
  },
  {
    location: 'Drakensberg',
    title: 'Mountain Retreat with Drakensberg Views',
    description: 'Escape to the mountains in this cosy chalet. Hiking trails, trout fishing, and stunning views. Fireplace, braai, and full kitchen. Ideal for small groups.',
    bedrooms: 3,
    bathrooms: 2,
    guests: 6,
    type: 'Entire place',
    price: 165,
    amenities: ['wifi', 'kitchen', 'parking', 'heating', 'tv', 'washer', 'dryer'],
    weeklyDiscount: 20,
    cleaningFee: 60,
    serviceFee: 38,
    occupancyTaxes: 14,
  },
];

function imageUrls(place, count = 4) {
  const base = 'https://placehold.co/800x600';
  return Array.from({ length: count }, (_, i) => `${base}?text=${encodeURIComponent(place)}&t=${i + 1}`);
}

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const existingUser = await User.findOne({ username: HOST_USERNAME });
    let host;
    if (existingUser) {
      host = existingUser;
      console.log('Using existing host user:', HOST_USERNAME);
    } else {
      const hashed = await bcrypt.hash(HOST_PASSWORD, 10);
      host = await User.create({
        username: HOST_USERNAME,
        password: hashed,
        role: 'host',
      });
      console.log('Created host user:', HOST_USERNAME);
    }

    for (const loc of LISTINGS) {
      const existing = await Accommodation.findOne({ location: loc.location, host: host._id });
      if (existing) {
        console.log('Listing already exists:', loc.location);
        continue;
      }
      await Accommodation.create({
        ...loc,
        images: imageUrls(loc.location),
        host: host._id,
      });
      console.log('Created listing:', loc.location);
    }

    console.log('Seed completed.');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
