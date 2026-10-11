/**
 * AuraTriage - Patient Controller
 * Enforces strict self-sovereign data boundaries:
 * Patients can ONLY read and update their own personal medical record.
 */

const { query } = require('../db');
const { parseJsonArray } = require('./authController');

/**
 * GET /api/v1/patient/profile
 * Fetches the authenticated patient's profile
 */
async function getMyProfile(req, res) {
  try {
    const patientId = req.user.patientId;
    if (!patientId) {
      return res.status(404).json({ error: 'No patient record linked to this account.' });
    }

    const patientRes = await query(
      `SELECT patient_id, full_name, age, blood_group, allergies, chronic_conditions,
              emergency_contact, emergency_contact_2, home_address, additional_medical_details, email,
              created_at, updated_at
       FROM patients
       WHERE patient_id = $1;`,
      [patientId]
    );

    if (patientRes.rows.length === 0) {
      return res.status(404).json({ error: 'Patient profile not found.' });
    }

    const p = patientRes.rows[0];

    return res.status(200).json({
      patientId: p.patient_id,
      fullName: p.full_name,
      age: p.age,
      bloodGroup: p.blood_group,
      allergies: parseJsonArray(p.allergies),
      chronicConditions: parseJsonArray(p.chronic_conditions),
      emergencyContact1: p.emergency_contact,
      emergencyContact2: p.emergency_contact_2,
      homeAddress: p.home_address,
      additionalMedicalDetails: p.additional_medical_details,
      email: p.email,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    });
  } catch (error) {
    console.error('[Patient Controller] getMyProfile Exception:', error);
    return res.status(500).json({ error: 'Failed to retrieve patient profile.', details: error.message });
  }
}

/**
 * PUT /api/v1/patient/profile
 * Updates the authenticated patient's own profile
 */
async function updateMyProfile(req, res) {
  try {
    const patientId = req.user.patientId;
    if (!patientId) {
      return res.status(404).json({ error: 'No patient record linked to this account.' });
    }

    const {
      fullName,
      name,
      age,
      bloodGroup,
      allergies,
      chronicConditions,
      emergencyContact1,
      emergencyContact,
      emergencyContact2,
      homeAddress,
      additionalMedicalDetails,
    } = req.body;

    const finalName = (fullName || name || '').trim();
    const finalContact1 = (emergencyContact1 || emergencyContact || '').trim();

    if (!finalName || !age || !bloodGroup || !finalContact1) {
      return res.status(400).json({
        error: 'Fields: name, age, bloodGroup, and emergencyContact1 are mandatory.',
      });
    }

    const allergiesArr = Array.isArray(allergies) ? allergies : (typeof allergies === 'string' ? allergies.split(',').map(s => s.trim()).filter(Boolean) : []);
    const conditionsArr = Array.isArray(chronicConditions) ? chronicConditions : (typeof chronicConditions === 'string' ? chronicConditions.split(',').map(s => s.trim()).filter(Boolean) : []);

    await query(
      `UPDATE patients
       SET full_name = $1,
           age = $2,
           blood_group = $3,
           allergies = $4,
           chronic_conditions = $5,
           emergency_contact = $6,
           emergency_contact_2 = $7,
           home_address = $8,
           additional_medical_details = $9,
           updated_at = CURRENT_TIMESTAMP
       WHERE patient_id = $10;`,
      [
        finalName,
        parseInt(age, 10),
        bloodGroup.trim(),
        JSON.stringify(allergiesArr),
        JSON.stringify(conditionsArr),
        finalContact1,
        emergencyContact2 ? emergencyContact2.trim() : null,
        homeAddress ? homeAddress.trim() : null,
        additionalMedicalDetails ? additionalMedicalDetails.trim() : null,
        patientId,
      ]
    );

    return res.status(200).json({
      message: 'Medical profile updated successfully.',
      patient: {
        patientId,
        fullName: finalName,
        age: parseInt(age, 10),
        bloodGroup: bloodGroup.trim(),
        allergies: allergiesArr,
        chronicConditions: conditionsArr,
        emergencyContact1: finalContact1,
        emergencyContact2: emergencyContact2 ? emergencyContact2.trim() : null,
        homeAddress: homeAddress ? homeAddress.trim() : null,
        additionalMedicalDetails: additionalMedicalDetails ? additionalMedicalDetails.trim() : null,
      },
    });
  } catch (error) {
    console.error('[Patient Controller] updateMyProfile Exception:', error);
    return res.status(500).json({ error: 'Failed to update patient profile.', details: error.message });
  }
}

/**
 * GET /api/v1/patient/my-incidents
 * Fetches the patient's own collision alerts history
 */
async function getMyIncidents(req, res) {
  try {
    const patientId = req.user.patientId;
    const incidentsRes = await query(
      `SELECT i.incident_id, i.pre_crash_speed_kmh, i.peak_g_force, i.status, i.created_at,
              ST_Y(i.crash_location) AS crash_latitude, ST_X(i.crash_location) AS crash_longitude,
              h.name AS hospital_name, h.trauma_level
       FROM incidents i
       LEFT JOIN hospitals h ON i.hospital_id = h.hospital_id
       WHERE i.patient_id = $1
       ORDER BY i.created_at DESC;`,
      [patientId]
    );

    return res.status(200).json(incidentsRes.rows);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch incident history.', details: error.message });
  }
}

module.exports = {
  getMyProfile,
  updateMyProfile,
  getMyIncidents,
};

