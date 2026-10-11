/**
 * AuraTriage - Patient Portal Routes (v1)
 * Enforces strict role isolation for PATIENT role
 */

const express = require('express');
const router = express.Router();
const patientController = require('../../controllers/patientController');
const { authenticate, requireRole } = require('../../middleware/auth');

// Protected for PATIENT role (or ADMIN oversight)
router.use(authenticate);
router.use(requireRole('PATIENT', 'ADMIN'));

router.get('/profile', patientController.getMyProfile);
router.put('/profile', patientController.updateMyProfile);
router.get('/my-incidents', patientController.getMyIncidents);

module.exports = router;

