const { Server } = require('socket.io');
const { updateIncidentStatus } = require('./db');
const { verifyToken } = require('./auth');

let ioInstance = null;

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*', // Allow all origins for hackathon development & mobile clients
      methods: ['GET', 'POST', 'PATCH'],
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] New client connected: ${socket.id}`);

    // Allow hospital dashboard authentication via token in handshake query or message
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        socket.hospital = decoded;
        socket.join(`hospital_${decoded.id}`);
        console.log(`[Socket.IO] Hospital dashboard joined room: hospital_${decoded.id} (${decoded.name})`);
      }
    }

    // Direct room join event
    socket.on('dashboard:join', (data) => {
      if (data?.hospitalId) {
        socket.join(`hospital_${data.hospitalId}`);
        console.log(`[Socket.IO] Client ${socket.id} explicitly joined room hospital_${data.hospitalId}`);
      }
    });

    // Ingest crash telemetry event directly from Mobile edge device
    socket.on('crash:sos_dispatch', async (data, ackCallback) => {
      console.log('[Socket.IO] Received crash:sos_dispatch from edge device:', data);
      try {
        // Late-require to prevent circular dependency
        const { processCrashIncident } = require('./routes/incidents');
        const alertPayload = await processCrashIncident(data);
        if (typeof ackCallback === 'function') {
          ackCallback({ success: true, incidentId: alertPayload.incidentId });
        }
      } catch (err) {
        console.error('[Socket.IO] Error processing edge SOS dispatch:', err);
        if (typeof ackCallback === 'function') {
          ackCallback({ success: false, error: err.message });
        }
      }
    });

    // Hospital Dashboard action: Reserve Trauma Bay
    socket.on('trauma:reserve_bay', async (data) => {
      console.log('[Socket.IO] trauma:reserve_bay triggered:', data);
      const { incidentId } = data;
      if (incidentId) {
        await updateIncidentStatus(incidentId, 'PREPARED');
        io.emit('trauma:status_updated', {
          incidentId,
          status: 'PREPARED',
          acknowledgedAt: new Date().toISOString(),
          preparedBy: socket.hospital?.name || 'Triage Officer',
        });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.IO] Client disconnected (${socket.id}): ${reason}`);
    });
  });

  ioInstance = io;
  return io;
}

function getIoInstance() {
  return ioInstance;
}

module.exports = {
  initSocketServer,
  getIoInstance,
};

