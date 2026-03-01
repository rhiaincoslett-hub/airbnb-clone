const Reservation = require('../models/Reservation');
const Accommodation = require('../models/Accommodation');

/**
 * Create a reservation; user and host refs from body and accommodation.
 * @param {import('express').Request} req 
 * @param {import('express').Response} res
 */
async function createReservation(req, res) {
  try {
    const { accommodationId, startDate, endDate, guests, totalPrice } = req.body;
    if (!accommodationId || !startDate || !endDate) {
      return res.status(400).json({ message: 'accommodationId, startDate, and endDate are required' });
    }
    const accommodation = await Accommodation.findById(accommodationId);
    if (!accommodation) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }
    const reservation = await Reservation.create({
      accommodation: accommodationId,
      user: req.user.id,
      host: accommodation.host,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      guests: guests || 1,
      totalPrice: totalPrice || 0,
    });
    const populated = await Reservation.findById(reservation._id)
      .populate('accommodation')
      .populate('user', 'username')
      .populate('host', 'username');
    return res.status(201).json(populated);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * Get reservations where host = req.user.id; populate accommodation and user.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getReservationsByHost(req, res) {
  try {
    const reservations = await Reservation.find({ host: req.user.id })
      .populate('accommodation')
      .populate('user', 'username')
      .sort({ createdAt: -1 });
    return res.status(200).json(reservations);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * Get reservations where user = req.user.id; populate accommodation.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getReservationsByUser(req, res) {
  try {
    const reservations = await Reservation.find({ user: req.user.id })
      .populate('accommodation')
      .sort({ createdAt: -1 });
    return res.status(200).json(reservations);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * Delete reservation by id; only if req.user owns it (user or host).
 * @param {import('express').Request} req - params.id
 * @param {import('express').Response} res
 */
async function deleteReservation(req, res) {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    const isOwner = reservation.user.toString() === req.user.id || reservation.host.toString() === req.user.id;
    if (!isOwner) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await Reservation.findByIdAndDelete(req.params.id);
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
  createReservation,
  getReservationsByHost,
  getReservationsByUser,
  deleteReservation,
};
