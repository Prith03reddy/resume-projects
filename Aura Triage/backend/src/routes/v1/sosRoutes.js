/**
 * SOS Ingestion Router
 * Route: /api/v1/sos
 */

const express = require('express');
const router = express.Router();
const { triggerSos } = require('../../controllers/incidentController');

/**
 * POST /api/v1/sos/trigger
 * Autonomous collision ingestion pipeline
 */
router.post('/trigger', triggerSos);

module.exports = router;

