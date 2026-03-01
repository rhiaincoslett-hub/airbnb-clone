const Accommodation = require('../models/Accommodation');

/**
 * Create a new accommodation listing; host set from req.user.id.
 * @param {import('express').Request} req 
 * @param {import('express').Response} res
 */
async function createAccommodation(req, res) {
  try {
    const data = { ...req.body, host: req.user.id };
    const accommodation = await Accommodation.create(data);
    return res.status(201).json(accommodation);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * Return all accommodations (public).
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getAllAccommodations(req, res) {
  try {
    const accommodations = await Accommodation.find().populate('host', 'username');
    return res.status(200).json(accommodations);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * Return a single accommodation by id (public).
 * @param {import('express').Request} req - params.id
 * @param {import('express').Response} res
 */
async function getAccommodationById(req, res) {
  try {
    const accommodation = await Accommodation.findById(req.params.id).populate('host', 'username');
    if (!accommodation) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }
    return res.status(200).json(accommodation);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid id' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * Update accommodation by id; only if req.user is the host.
 * @param {import('express').Request} req 
 * @param {import('express').Response} res
 */
async function updateAccommodation(req, res) {
  try {
    const accommodation = await Accommodation.findById(req.params.id);
    if (!accommodation) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }
    if (accommodation.host.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: not the host' });
    }
    Object.assign(accommodation, req.body);
    await accommodation.save();
    return res.status(200).json(accommodation);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid id' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * Delete accommodation by id; only if req.user is the host.
 * @param {import('express').Request} req 
 * @param {import('express').Response} res
 */
async function deleteAccommodation(req, res) {
  try {
    const accommodation = await Accommodation.findById(req.params.id);
    if (!accommodation) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }
    if (accommodation.host.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: not the host' });
    }
    await Accommodation.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'Deleted' });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid id' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  createAccommodation,
  getAllAccommodations,
  getAccommodationById,
  updateAccommodation,
  deleteAccommodation,
};
