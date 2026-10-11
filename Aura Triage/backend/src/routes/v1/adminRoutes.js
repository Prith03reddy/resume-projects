/**
 * AuraTriage - Admin Master Control Routes (v1)
 * Enforces total system visibility for ADMIN role
 */

const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/adminController');
const { authenticate, requireRole } = require('../../middleware/auth');

// Protected strictly for ADMIN role
router.use(authenticate);
router.use(requireRole('ADMIN'));

router.get('/overview', adminController.getOverview);
router.get('/patients', adminController.getAllPatients);
router.get('/hospitals', adminController.getAllHospitals);
router.patch('/hospitals/:id/status', adminController.toggleHospitalStatus);
router.get('/incidents', adminController.getAllIncidents);

module.exports = router;

