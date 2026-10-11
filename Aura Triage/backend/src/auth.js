/**
 * JWT Authentication & Security Module for Hospital ER Dashboards
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'auratriage_hackoverflow_super_secret_jwt_key_2026';

function generateHospitalToken(hospital) {
  return jwt.sign(
    {
      id: hospital.id,
      name: hospital.name,
      trauma_level: hospital.trauma_level,
      role: 'ER_TRIAGE_PHYSICIAN',
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header required (Bearer <token>)' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired JWT token' });
  }

  req.hospital = decoded;
  next();
}

module.exports = {
  JWT_SECRET,
  generateHospitalToken,
  verifyToken,
  requireAuth,
};

