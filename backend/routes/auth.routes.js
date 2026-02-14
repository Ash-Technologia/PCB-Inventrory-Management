const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { authValidation, validate } = require('../middleware/validation');

// Public routes
router.post('/register', authValidation.register, validate, register);
router.post('/login', authValidation.login, validate, login);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser);

module.exports = router;
