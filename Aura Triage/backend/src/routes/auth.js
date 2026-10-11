const express = require('express');
const router = express.Router();
const { getAllHospitals } = require('../db');
const { generateHospitalToken, requireAuth } = require('../auth');

/**
 * POST /api/auth/login
 * ER Dashboard staff login
 */
router.post('/login', async (req, res) => {
  try {
    const { hospitalId } = req.body;
    const hospitals = await getAllHospitals();

    // Default to the primary Level-1 trauma center if hospitalId not specified
    const targetHospital = hospitalId
      ? hospitals.find(h => h.id === hospitalId)
      : hospitals.find(h => h.trauma_level === 'Level-1') || hospitals[0];

    if (!targetHospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    const token = generateHospitalToken(targetHospital);
    res.json({
      success: true,
      token,
      hospital: {
        id: targetHospital.id,
        name: targetHospital.name,
        trauma_level: targetHospital.trauma_level,
        icu_beds_available: targetHospital.icu_beds_available,
        contact_phone: targetHospital.contact_phone,
        address: targetHospital.address,
        longitude: targetHospital.longitude,
        latitude: targetHospital.latitude,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
});

/**
 * GET /api/auth/me
 * Validate current hospital token
 */
router.get('/me', requireAuth, (req, res) => {
  res.json({ hospital: req.hospital });
});

module.exports = router;

