require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const { router: incidentRoutes } = require('./routes/incidents');
const hospitalRoutes = require('./routes/hospitals');
const { initSocketServer } = require('./socket');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO Server
initSocketServer(server);

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/hospitals', hospitalRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'AuraTriage Trauma & Road Safety Dispatch Broker',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
  ==============================================================
    🚑  AURATRIAGE REAL-TIME EMERGENCY BROKER ACTIVE
  ==============================================================
    * REST API:       http://localhost:${PORT}/api
    * WebSocket:      ws://localhost:${PORT}
    * Health Check:   http://localhost:${PORT}/api/health
    * Mode:           ${process.env.NODE_ENV || 'development'}
    * Core Trigger 1: Deceleration >= 40 km/h in 1.0s
    * Core Trigger 2: Linear Impact >= 3.8g (37.2 m/s²)
  ==============================================================
  `);
});

