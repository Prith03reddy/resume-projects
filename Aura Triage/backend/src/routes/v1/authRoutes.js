/**
 * AuraTriage - Authentication Routes (v1)
 */

const express = require('express');
const router = express.Router();
const authController = require('../../controllers/authController');
const { authenticate } = require('../../middleware/auth');

router.post('/login', authController.login);
router.post('/register-patient', authController.registerPatient);
router.get('/me', authenticate, authController.getCurrentUser);

module.exports = router;

