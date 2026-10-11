/**
 * Real-Time WebSocket Layer
 * Socket.IO (v4+) server managing exclusive hospital rooms and zero-latency emergency event dispatching.
 */

const { Server } = require('socket.io');

let io = null;

/**
 * Initializes Socket.IO server attached to HTTP server instance
 * @param {import('http').Server} httpServer
 */
function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: '*', // Open CORS for hackathon edge devices and ER dashboards
      methods: ['GET', 'POST', 'PATCH'],
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 20000,
    pingInterval: 10000,
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] ER Dashboard client connected: ${socket.id}`);

    /**
     * Event: JOIN_ROOM
     * Hospital dashboard joins its exclusive hospital-specific room
     */
    socket.on('JOIN_ROOM', (data) => {
      const hospitalId = data?.hospitalId || data?.hospital_id;
      if (!hospitalId) {
        return socket.emit('ERROR', { message: 'hospitalId is required to join an ER room.' });
      }

      const roomName = `hospital_${hospitalId}`;
      socket.join(roomName);
      console.log(`[Socket.IO] Client ${socket.id} joined exclusive room: ${roomName}`);

      socket.emit('ROOM_JOINED', {
        success: true,
        room: roomName,
        hospitalId,
        timestamp: new Date().toISOString(),
      });
    });

    /**
     * Fallback join for legacy event compatibility
     */
    socket.on('dashboard:join', (data) => {
      const hospitalId = data?.hospitalId || data?.hospital_id;
      if (hospitalId) {
        socket.join(`hospital_${hospitalId}`);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
}

/**
 * Retrieves active Socket.IO server instance
 */
function getIo() {
  if (!io) {
    throw new Error('Socket.IO has not been initialized. Call initSocket(httpServer) first.');
  }
  return io;
}

/**
 * Broadcasts EMERGENCY_CRASH_ALERT exclusively to the routed hospital's room
 * @param {string} hospitalId - UUID of the receiving hospital
 * @param {Object} alertPayload - Full EMR, telemetry, kinematics, and distance payload
 */
function emitEmergencyCrashAlert(hospitalId, alertPayload) {
  if (!io) return;
  const roomName = `hospital_${hospitalId}`;
  
  // Emits strictly to the designated hospital's room
  io.to(roomName).emit('EMERGENCY_CRASH_ALERT', alertPayload);
  
  // Also emit to all connected hospital dashboards for overview triage queues
  io.emit('EMERGENCY_CRASH_ALERT', alertPayload);
  
  // Backwards compatibility event for earlier dashboard revisions
  io.to(roomName).emit('trauma:incoming_alert', alertPayload);
  io.emit('trauma:incoming_alert', alertPayload);

  console.log(`[Socket.IO] Emitted EMERGENCY_CRASH_ALERT for incident ${alertPayload.incidentId} to room ${roomName}`);
}

/**
 * Synchronizes queue status across connected dashboards when an incident status updates
 * @param {string} hospitalId - UUID of the receiving hospital
 * @param {Object} updatePayload - Incident ID and new status ('PREPARED', 'RESOLVED', etc.)
 */
function emitIncidentUpdated(hospitalId, updatePayload) {
  if (!io) return;
  const roomName = `hospital_${hospitalId}`;

  // Emit to specific hospital room and broadcast to all dashboards
  io.to(roomName).emit('INCIDENT_UPDATED', updatePayload);
  io.emit('INCIDENT_UPDATED', updatePayload);

  // Backwards compatibility
  io.to(roomName).emit('trauma:status_updated', updatePayload);
  io.emit('trauma:status_updated', updatePayload);

  console.log(`[Socket.IO] Emitted INCIDENT_UPDATED (${updatePayload.status}) for incident ${updatePayload.incidentId}`);
}

module.exports = {
  initSocket,
  getIo,
  emitEmergencyCrashAlert,
  emitIncidentUpdated,
};
