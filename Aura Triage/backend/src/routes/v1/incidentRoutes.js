/**
 * Incidents Router
 * Route: /api/v1/incidents
 */

const express = require('express');
const router = express.Router();
const {
  getActiveIncidents,
  updateIncidentStatus,
  dispatchPoliceToIncident,
} = require('../../controllers/incidentController');

/**
 * GET /api/v1/incidents/active
 * Hydrates active emergency queue (DISPATCHED, PREPARED) sorted by created_at DESC
 */
router.get('/active', getActiveIncidents);

/**
 * PATCH /api/v1/incidents/:id/status
 * Updates incident status and broadcasts INCIDENT_UPDATED to hospital room
 */
router.patch('/:id/status', updateIncidentStatus);

/**
 * POST /api/v1/incidents/:id/dispatch-police
 * Dispatches live crash coordinates to the nearest police precinct
 */
router.post('/:id/dispatch-police', dispatchPoliceToIncident);

module.exports = router;
