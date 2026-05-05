const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// Public routes
router.post('/signup', authController.signup);
router.post('/signin', authController.signin);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOtp);

// Protected routes
router.get('/profile', verifyToken, authController.getProfile);
router.post('/logout', verifyToken, authController.logout);

module.exports = router;
