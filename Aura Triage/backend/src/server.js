/**
 * AuraTriage - Autonomous ER Trauma Dispatch Hub
 * Production Server & Real-Time Engine Entrypoint
 */

require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');

const { pool, query, isMysql } = require('./db');
const { initSocket } = require('./socket');

// API v1 Routers
const sosRoutesV1 = require('./routes/v1/sosRoutes');
const incidentRoutesV1 = require('./routes/v1/incidentRoutes');
const authRoutesV1 = require('./routes/v1/authRoutes');
const patientRoutesV1 = require('./routes/v1/patientRoutes');
const adminRoutesV1 = require('./routes/v1/adminRoutes');

// Legacy routes for backwards compatibility
const authRoutes = require('./routes/auth');
const hospitalRoutes = require('./routes/hospitals');
const { router: legacyIncidentRoutes } = require('./routes/incidents');

const app = express();
const server = http.createServer(app);

// 1. Initialize Real-Time Socket.IO Layer
initSocket(server);

// 2. Security & Parsing Middlewares
app.use(cors({
  origin: '*', // Allows ER dashboard consoles and edge simulation clients
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (Development)
if (process.env.NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[HTTP] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    });
    next();
  });
}

// 3. API v1 Endpoints (Role-Based Access Control)
app.use('/api/v1/auth', authRoutesV1);
app.use('/api/v1/patient', patientRoutesV1);
app.use('/api/v1/admin', adminRoutesV1);
app.use('/api/v1/sos', sosRoutesV1);
app.use('/api/v1/incidents', incidentRoutesV1);

// 4. Backwards-Compatibility Aliases
app.use('/api/auth', authRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/incidents', legacyIncidentRoutes);

// Health Check Endpoint
app.get('/health', async (req, res) => {
  try {
    let dbInfo;
    if (isMysql) {
      const dbRes = await query('SELECT CURRENT_TIMESTAMP AS db_time, VERSION() AS db_version;');
      dbInfo = { engine: 'XAMPP MySQL / MariaDB', version: dbRes.rows[0].db_version };
    } else {
      const dbRes = await query('SELECT NOW() AS db_time, postgis_version() AS postgis_ver;');
      dbInfo = { engine: 'PostgreSQL + PostGIS', version: dbRes.rows[0].postgis_ver };
    }
    res.status(200).json({
      status: 'HEALTHY',
      service: 'AuraTriage Trauma Dispatch Broker',
      uptime: Math.floor(process.uptime()),
      database: 'CONNECTED',
      databaseEngine: dbInfo.engine,
      databaseVersion: dbInfo.version,
      serverTime: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      status: 'DEGRADED',
      database: 'DISCONNECTED',
      error: err.message,
    });
  }
});

// 5. 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
  });
});

// 6. Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]', err);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// 7. Server Initialization & Graceful Shutdown
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
  ====================================================================
    🚑  AURATRIAGE ENTERPRISE BACKEND ONLINE
  ====================================================================
    * API Base:          http://localhost:${PORT}/api/v1
    * SOS Trigger:       POST http://localhost:${PORT}/api/v1/sos/trigger
    * Active Incidents:  GET  http://localhost:${PORT}/api/v1/incidents/active
    * Status Update:     PATCH http://localhost:${PORT}/api/v1/incidents/:id/status
    * WebSocket Engine:  ws://localhost:${PORT} (Socket.IO v4)
    * Health Probe:      http://localhost:${PORT}/health
    * Environment:       ${process.env.NODE_ENV || 'development'}
  ====================================================================
  `);
});

// Graceful shutdown handling
const handleShutdown = async (signal) => {
  console.log(`\n[Server] Received ${signal}. Commencing graceful shutdown...`);
  server.close(async () => {
    console.log('[Server] HTTP and WebSocket server closed.');
    try {
      await pool.end();
      console.log('[PostgreSQL] Database pool connection drained.');
      process.exit(0);
    } catch (err) {
      console.error('[PostgreSQL] Error closing pool:', err.message);
      process.exit(1);
    }
  });
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

module.exports = { app, server };
