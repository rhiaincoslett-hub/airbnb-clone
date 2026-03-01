const express = require('express');
const {
  createAccommodation,
  getAllAccommodations,
  getAccommodationById,
  updateAccommodation,
  deleteAccommodation,
} = require('../controllers/accommodationController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', getAllAccommodations);
router.get('/:id', getAccommodationById);
router.post('/', auth, createAccommodation);
router.put('/:id', auth, updateAccommodation);
router.delete('/:id', auth, deleteAccommodation);

module.exports = router;
