/**
 * AuraTriage - Full-Stack Role-Based Access Control (RBAC) Middleware
 * Enforces strict boundary isolation between:
 *  - ADMIN: Total system overview (all patients, all hospitals, global incidents)
 *  - HOSPITAL: Incident-bound EMR access (only active accident patients assigned to their facility)
 *  - PATIENT: Self-sovereign EMR access (read/update own personal data only)
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'auratriage_hackoverflow_super_secret_jwt_key_2026';

/**
 * Generates signed JWT containing user role and boundary IDs
 */
function generateToken(payload) {
  return jwt.sign(
    {
      userId: payload.user_id || payload.userId,
      email: payload.email,
      role: (payload.role || '').toUpperCase(),
      patientId: payload.patient_id || payload.patientId || null,
      hospitalId: payload.hospital_id || payload.hospitalId || null,
      name: payload.name || payload.full_name || payload.email,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

/**
 * Verifies JWT signature and returns payload
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

/**
 * Authentication Middleware: Extracts and validates Bearer token
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Authentication required. Bearer token missing.',
      code: 'AUTH_REQUIRED',
    });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      error: 'Invalid, malformed, or expired authentication token.',
      code: 'INVALID_TOKEN',
    });
  }

  req.user = decoded;
  next();
}

/**
 * Role-Based Access Control (RBAC) Guard
 * @param  {...string} allowedRoles - E.g. 'ADMIN', 'HOSPITAL', 'PATIENT'
 */
function requireRole(...allowedRoles) {
  const normalized = allowedRoles.map((r) => r.toUpperCase());

  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        error: 'Unauthorized: No active user session.',
        code: 'UNAUTHORIZED',
      });
    }

    if (!normalized.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Access requires one of [${normalized.join(', ')}]. Current role: '${req.user.role}'.`,
        code: 'FORBIDDEN',
        requiredRoles: normalized,
        currentRole: req.user.role,
      });
    }

    next();
  };
}

/**
 * Data Boundary Guard: Ensures patients can ONLY access their own patient ID
 */
function requireSelfPatient(req, res, next) {
  if (req.user.role === 'ADMIN') {
    // Admin has global visibility
    return next();
  }

  const requestedPatientId = req.params.patientId || req.body.patientId || req.query.patientId;
  if (req.user.role === 'PATIENT') {
    if (!req.user.patientId) {
      return res.status(403).json({
        error: 'Forbidden: Patient account is not linked to an active EMR profile.',
        code: 'PATIENT_UNLINKED',
      });
    }

    if (requestedPatientId && requestedPatientId !== req.user.patientId) {
      return res.status(403).json({
        error: 'Forbidden: Patients are strictly restricted from accessing other individuals’ medical records.',
        code: 'PATIENT_ISOLATION_VIOLATION',
      });
    }

    // Force context to user's own patient ID
    req.targetPatientId = req.user.patientId;
    return next();
  }

  return res.status(403).json({ error: 'Access denied: Patient role required.' });
}

module.exports = {
  JWT_SECRET,
  generateToken,
  verifyToken,
  authenticate,
  requireRole,
  requireSelfPatient,
};

