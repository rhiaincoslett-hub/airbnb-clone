const express = require('express');
const { login, register } = require('../controllers/userController');

const router = express.Router();

/** POST /api/users/register - Create account (optional, for initial setup) */
router.post('/register', register);
/** POST /api/users/login - Authenticate and return JWT */
router.post('/login', login);

module.exports = router;
