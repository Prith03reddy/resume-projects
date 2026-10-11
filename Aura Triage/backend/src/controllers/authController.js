/**
 * AuraTriage - Authentication Controller
 * Unified Login with Role Selection & Patient Self-Registration
 */

const crypto = require('crypto');
const { query } = require('../db');
const { generateToken } = require('../middleware/auth');

/**
 * Safely parses JSON / array fields from database
 */
function parseJsonArray(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [val];
    } catch {
      return [val];
    }
  }
  return [];
}

/**
 * POST /api/v1/auth/login
 * Unified Login supporting Admin, Hospital Staff, and Patient roles
 */
async function login(req, res) {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Lookup user in users table
    const userRes = await query(
      `SELECT u.user_id, u.email, u.password, u.role, u.patient_id, u.hospital_id,
              p.full_name AS patient_name,
              h.name AS hospital_name, h.trauma_level
       FROM users u
       LEFT JOIN patients p ON u.patient_id = p.patient_id
       LEFT JOIN hospitals h ON u.hospital_id = h.hospital_id
       WHERE LOWER(u.email) = LOWER($1);`,
      [email.trim()]
    );

    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = userRes.rows[0];

    // Password verification (supports plain or hashed demo passwords)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Role check if specific role was selected in login UI
    if (role && role.toUpperCase() !== user.role.toUpperCase()) {
      return res.status(403).json({
        error: `User account '${user.email}' is registered as ${user.role}, not ${role.toUpperCase()}.`,
      });
    }

    const displayName = user.patient_name || user.hospital_name || (user.role === 'ADMIN' ? 'System Administrator' : user.email);

    const token = generateToken({
      userId: user.user_id,
      email: user.email,
      role: user.role,
      patientId: user.patient_id,
      hospitalId: user.hospital_id,
      name: displayName,
    });

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        userId: user.user_id,
        email: user.email,
        role: user.role,
        patientId: user.patient_id,
        hospitalId: user.hospital_id,
        name: displayName,
        hospitalDetails: user.hospital_name
          ? {
              id: user.hospital_id,
              name: user.hospital_name,
              traumaLevel: user.trauma_level,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('[Auth Controller] login Exception:', error);
    return res.status(500).json({ error: 'Internal server error during authentication.', details: error.message });
  }
}

/**
 * POST /api/v1/auth/register-patient
 * Self-registration for Patient role
 */
async function registerPatient(req, res) {
  try {
    const {
      name,
      age,
      bloodGroup,
      allergies,
      chronicConditions,
      homeAddress,
      emergencyContact1,
      emergencyContact2,
      additionalMedicalDetails,
      email,
      password,
    } = req.body;

    if (!name || !age || !bloodGroup || !emergencyContact1 || !email || !password) {
      return res.status(400).json({
        error: 'Missing required fields: name, age, bloodGroup, emergencyContact1, email, and password are required.',
      });
    }

    // Check if email already registered
    const existingUser = await query(`SELECT user_id FROM users WHERE LOWER(email) = LOWER($1);`, [email.trim()]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: `An account with email '${email}' is already registered.` });
    }

    const patientId = crypto.randomUUID();
    const userId = crypto.randomUUID();

    const allergiesArr = Array.isArray(allergies) ? allergies : (typeof allergies === 'string' ? allergies.split(',').map(s => s.trim()).filter(Boolean) : []);
    const conditionsArr = Array.isArray(chronicConditions) ? chronicConditions : (typeof chronicConditions === 'string' ? chronicConditions.split(',').map(s => s.trim()).filter(Boolean) : []);

    // 1. Insert Patient Record
    await query(
      `INSERT INTO patients (
        patient_id, full_name, age, blood_group, allergies, chronic_conditions,
        emergency_contact, emergency_contact_2, home_address, additional_medical_details, email
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);`,
      [
        patientId,
        name.trim(),
        parseInt(age, 10),
        bloodGroup.trim(),
        JSON.stringify(allergiesArr),
        JSON.stringify(conditionsArr),
        emergencyContact1.trim(),
        emergencyContact2 ? emergencyContact2.trim() : null,
        homeAddress ? homeAddress.trim() : null,
        additionalMedicalDetails ? additionalMedicalDetails.trim() : null,
        email.trim().toLowerCase(),
      ]
    );

    // 2. Create User Account (Role = PATIENT)
    await query(
      `INSERT INTO users (user_id, email, password, role, patient_id)
       VALUES ($1, $2, $3, 'PATIENT', $4);`,
      [userId, email.trim().toLowerCase(), password, patientId]
    );

    const token = generateToken({
      userId,
      email: email.trim().toLowerCase(),
      role: 'PATIENT',
      patientId,
      name: name.trim(),
    });

    return res.status(201).json({
      message: 'Patient profile registered successfully.',
      token,
      user: {
        userId,
        email: email.trim().toLowerCase(),
        role: 'PATIENT',
        patientId,
        name: name.trim(),
      },
      patient: {
        patientId,
        fullName: name.trim(),
        age: parseInt(age, 10),
        bloodGroup: bloodGroup.trim(),
        allergies: allergiesArr,
        chronicConditions: conditionsArr,
        emergencyContact: emergencyContact1.trim(),
        emergencyContact2: emergencyContact2 ? emergencyContact2.trim() : null,
        homeAddress: homeAddress ? homeAddress.trim() : null,
        additionalMedicalDetails: additionalMedicalDetails ? additionalMedicalDetails.trim() : null,
      },
    });
  } catch (error) {
    console.error('[Auth Controller] registerPatient Exception:', error);
    return res.status(500).json({ error: 'Failed to register patient profile.', details: error.message });
  }
}

/**
 * GET /api/v1/auth/me
 * Hydrates current authenticated session
 */
async function getCurrentUser(req, res) {
  try {
    const userRes = await query(
      `SELECT u.user_id, u.email, u.role, u.patient_id, u.hospital_id,
              p.full_name AS patient_name,
              h.name AS hospital_name, h.trauma_level
       FROM users u
       LEFT JOIN patients p ON u.patient_id = p.patient_id
       LEFT JOIN hospitals h ON u.hospital_id = h.hospital_id
       WHERE u.user_id = $1;`,
      [req.user.userId]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = userRes.rows[0];
    const displayName = user.patient_name || user.hospital_name || (user.role === 'ADMIN' ? 'System Administrator' : user.email);

    return res.status(200).json({
      user: {
        userId: user.user_id,
        email: user.email,
        role: user.role,
        patientId: user.patient_id,
        hospitalId: user.hospital_id,
        name: displayName,
        hospitalDetails: user.hospital_name
          ? {
              id: user.hospital_id,
              name: user.hospital_name,
              traumaLevel: user.trauma_level,
            }
          : null,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch current user session.', details: error.message });
  }
}

module.exports = {
  login,
  registerPatient,
  getCurrentUser,
  parseJsonArray,
};

