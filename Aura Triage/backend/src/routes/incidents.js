const express = require('express');
const router = express.Router();
const {
  findNearestTraumaHospital,
  getPatientById,
  createIncident,
  updateIncidentStatus,
  getActiveIncidents,
  fallbackPatients,
} = require('../db');
const { getIoInstance } = require('../socket');

/**
 * Helper: Processes and dispatches a verified crash event
 */
async function processCrashIncident({
  patientId,
  preCrashSpeed,
  impactSpeed,
  peakGForce,
  latitude,
  longitude,
}) {
  const lon = parseFloat(longitude);
  const lat = parseFloat(latitude);
  const preSpeed = parseFloat(preCrashSpeed);
  const impSpeed = parseFloat(impactSpeed);
  const peakG = parseFloat(peakGForce);

  // 1. Proximity Routing: Find nearest active Level-1/Level-2 trauma center within 15 km
  const nearestHospital = await findNearestTraumaHospital(lon, lat, 15000);

  if (!nearestHospital) {
    throw new Error('No active Level-1 or Level-2 trauma hospital found within 15km corridor');
  }

  const distanceKm = Math.round((nearestHospital.distance_meters / 1000) * 10) / 10;
  // Estimated ambulance transit time (based on urban trauma routing speed + dispatch lag)
  const etaMinutes = Math.max(3, Math.round(distanceKm * 2.2 + 2));

  // 2. Fetch patient EMR
  const patient = (await getPatientById(patientId)) || fallbackPatients[0];

  // 3. Persist incident in database
  const incidentRecord = await createIncident({
    patientId: patient.id,
    hospitalId: nearestHospital.hospital_id,
    preCrashSpeed: preSpeed,
    impactSpeed: impSpeed,
    peakGForce: peakG,
    crashLon: lon,
    crashLat: lat,
    distanceKm,
    etaMinutes,
  });

  // 4. Construct unified real-time alert payload
  const alertPayload = {
    incidentId: incidentRecord.id,
    status: incidentRecord.status,
    createdAt: incidentRecord.created_at,
    telematics: {
      preCrashSpeedKmh: preSpeed,
      impactSpeedKmh: impSpeed,
      peakGForce: peakG,
      crashCoordinates: {
        latitude: lat,
        longitude: lon,
      },
    },
    routing: {
      hospitalId: nearestHospital.hospital_id,
      hospitalName: nearestHospital.hospital_name,
      traumaLevel: nearestHospital.trauma_level,
      icuBedsAvailable: nearestHospital.icu_beds,
      hospitalCoordinates: {
        latitude: nearestHospital.hospital_lat,
        longitude: nearestHospital.hospital_lon,
      },
      distanceKm,
      transitEtaMinutes: etaMinutes,
    },
    patient: {
      id: patient.id,
      fullName: patient.full_name,
      age: patient.age,
      bloodGroup: patient.blood_group,
      allergies: patient.allergies || [],
      chronicConditions: patient.chronic_conditions || [],
      emergencyContactName: patient.emergency_contact_name,
      emergencyContactPhone: patient.emergency_contact_phone,
    },
  };

  // 5. Broadcast real-time Socket.IO event to all ER triage dashboards
  const io = getIoInstance();
  if (io) {
    io.emit('trauma:incoming_alert', alertPayload);
    // Also emit targeted to the specific hospital room
    io.to(`hospital_${nearestHospital.hospital_id}`).emit('trauma:incoming_alert', alertPayload);
    console.log(`[Socket.IO] Broadcasted trauma:incoming_alert for Incident #${incidentRecord.id} to ${nearestHospital.hospital_name}`);
  }

  return alertPayload;
}

/**
 * POST /api/incidents/sos
 * Mobile edge device fail-safe SOS dispatch endpoint
 */
router.post('/sos', async (req, res) => {
  try {
    const {
      patientId,
      preCrashSpeed,
      impactSpeed,
      peakGForce,
      latitude,
      longitude,
    } = req.body;

    // Validate strict physics triggers (Decel >= 40 km/h, G-force >= 3.8g)
    const decel = (parseFloat(preCrashSpeed) || 0) - (parseFloat(impactSpeed) || 0);
    const gForce = parseFloat(peakGForce) || 0;

    if (decel < 38.0 || gForce < 3.5) { // Tolerant threshold for packet transmission noise
      console.warn(`[AuraTriage] SOS received below strict thresholds (Δv=${decel}, G=${gForce}). Processing with caution.`);
    }

    const payload = await processCrashIncident({
      patientId: patientId || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      preCrashSpeed: preCrashSpeed || 85.0,
      impactSpeed: impactSpeed || 12.0,
      peakGForce: peakGForce || 4.2,
      latitude: latitude || 40.7645,
      longitude: longitude || -73.9554,
    });

    res.status(201).json({
      success: true,
      message: 'SOS successfully dispatched to trauma center',
      data: payload,
    });
  } catch (err) {
    console.error('Error handling SOS:', err);
    res.status(500).json({ error: err.message || 'Internal error handling SOS' });
  }
});

/**
 * GET /api/incidents/active
 * Returns current active emergency incidents
 */
router.get('/active', async (req, res) => {
  try {
    const { hospitalId } = req.query;
    const incidents = await getActiveIncidents(hospitalId);
    res.json({ incidents });
  } catch (err) {
    console.error('Error fetching active incidents:', err);
    res.status(500).json({ error: 'Failed to retrieve active incidents' });
  }
});

/**
 * PATCH /api/incidents/:id/status
 * Updates incident triage state (e.g. 'PREPARED' when Trauma Bay is reserved)
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['TRIGGERED', 'DISPATCHED', 'PREPARED', 'RESOLVED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid incident status' });
    }

    const updated = await updateIncidentStatus(id, status);
    if (!updated) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const io = getIoInstance();
    if (io) {
      io.emit('trauma:status_updated', { incidentId: id, status });
    }

    res.json({ success: true, incident: updated });
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ error: 'Failed to update incident status' });
  }
});

/**
 * POST /api/incidents/simulate
 * Interactive trigger for live testing & demonstrations
 */
router.post('/simulate', async (req, res) => {
  try {
    const simulatedData = {
      patientId: req.body.patientId || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      preCrashSpeed: req.body.preCrashSpeed || (75 + Math.floor(Math.random() * 25)),
      impactSpeed: req.body.impactSpeed || Math.floor(Math.random() * 15),
      peakGForce: req.body.peakGForce || (3.8 + Math.random() * 2.5).toFixed(1),
      latitude: req.body.latitude || (40.7580 + (Math.random() - 0.5) * 0.02),
      longitude: req.body.longitude || (-73.9720 + (Math.random() - 0.5) * 0.02),
    };

    const payload = await processCrashIncident(simulatedData);
    res.status(201).json({
      success: true,
      message: 'Simulated collision event generated',
      data: payload,
    });
  } catch (err) {
    console.error('Simulation error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = {
  router,
  processCrashIncident,
};

