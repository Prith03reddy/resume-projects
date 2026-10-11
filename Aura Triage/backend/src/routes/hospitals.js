const express = require('express');
const router = express.Router();
const { getAllHospitals } = require('../db');

/**
 * GET /api/hospitals
 * Returns list of trauma hospitals with ICU capacity
 */
router.get('/', async (req, res) => {
  try {
    const hospitals = await getAllHospitals();
    res.json({ hospitals });
  } catch (err) {
    console.error('Fetch hospitals error:', err);
    res.status(500).json({ error: 'Failed to retrieve hospitals' });
  }
});

module.exports = router;

