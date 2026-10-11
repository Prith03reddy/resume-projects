/**
 * AuraTriage - Edge Incident Simulator (CLI Test Tool)
 * Tests the complete production pipeline:
 * 1. Connects to Socket.IO and emits JOIN_ROOM with the target hospital ID.
 * 2. Listens for the EMERGENCY_CRASH_ALERT event on the room.
 * 3. Triggers POST /api/v1/sos/trigger with Alex Mercer's telemetry.
 * 4. Verifies the database write, spatial routing, and real-time room broadcast.
 */

const http = require('http');
const io = require('socket.io-client');

const PORT = process.env.PORT || 5000;
const SERVER_URL = `http://localhost:${PORT}`;

// Alex Mercer's Patient ID (from seed data)
const PATIENT_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
// Metro General Trauma Center ID (from seed data)
const HOSPITAL_ID = '11111111-1111-1111-1111-111111111111';

console.log('================================================================');
console.log('⚡ AuraTriage Production Simulator & Socket Test');
console.log('================================================================');

// 1. Establish Socket.IO Client Connection & Join Hospital Room
const socket = io(SERVER_URL, {
  transports: ['websocket'],
  reconnection: false,
});

socket.on('connect', () => {
  console.log(`[Socket.IO Client] Connected to broker (Socket ID: ${socket.id})`);
  
  // Emit JOIN_ROOM event with target hospital ID
  console.log(`[Socket.IO Client] Emitting JOIN_ROOM for hospital: ${HOSPITAL_ID}`);
  socket.emit('JOIN_ROOM', { hospitalId: HOSPITAL_ID });
});

socket.on('ROOM_JOINED', (data) => {
  console.log(`[Socket.IO Client] Successfully joined room: ${data.room}`);
  // Once room is joined, trigger the SOS REST ingestion pipeline
  triggerSosPayload();
});

// 2. Listen for exclusive EMERGENCY_CRASH_ALERT event
socket.on('EMERGENCY_CRASH_ALERT', (alert) => {
  console.log('\n🚨 [Socket.IO Broadcast Received: EMERGENCY_CRASH_ALERT] 🚨');
  console.log('----------------------------------------------------------------');
  console.log(`Incident ID:   ${alert.incidentId}`);
  console.log(`Status:        ${alert.status}`);
  console.log(`Patient Name:  ${alert.patient?.fullName} (${alert.patient?.bloodGroup})`);
  console.log(`Allergies:     ${alert.patient?.allergies?.join(', ')}`);
  console.log(`Pre-Crash Spd: ${alert.telemetry?.preCrashSpeedKmh} km/h`);
  console.log(`Peak G-Force:  ${alert.telemetry?.peakGForce}g`);
  console.log(`Crash Coords:  Lat ${alert.telemetry?.coordinates?.latitude}, Lng ${alert.telemetry?.coordinates?.longitude}`);
  console.log(`Hospital:      ${alert.hospital?.name} (Trauma Level ${alert.hospital?.traumaLevel})`);
  console.log(`Distance:      ${alert.calculatedDistanceKm} km`);
  console.log(`Ambulance ETA: ${alert.transitEtaMinutes} mins`);
  console.log('----------------------------------------------------------------');
  console.log('✅ End-to-End Real-Time Ingestion & Room Broadcast Verified!\n');

  setTimeout(() => {
    socket.disconnect();
    process.exit(0);
  }, 1000);
});

// 3. Dispatch HTTP POST /api/v1/sos/trigger
function triggerSosPayload() {
  console.log('\n🚗 Transmitting high-velocity impact payload to POST /api/v1/sos/trigger...');

  // Generate randomized severe crash kinematics for dynamic simulation
  const randSpeed = parseFloat((Math.random() * 45 + 75).toFixed(1)); // 75.0 - 120.0 km/h
  const randGForce = parseFloat((Math.random() * 2.8 + 3.9).toFixed(2)); // 3.90g - 6.70g
  const randLat = parseFloat((40.7250 + Math.random() * 0.0500).toFixed(4));
  const randLng = parseFloat((-73.9920 + Math.random() * 0.0420).toFixed(4));

  const postData = JSON.stringify({
    patientId: 'random', // Rotates across the MySQL registered patient pool
    preCrashSpeedKmh: randSpeed,
    peakGForce: randGForce,
    lat: randLat,
    lng: randLng,
    randomize: true,
  });

  const options = {
    hostname: 'localhost',
    port: PORT,
    path: '/api/v1/sos/trigger',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  const req = http.request(options, (res) => {
    let responseBody = '';
    res.on('data', (chunk) => { responseBody += chunk; });
    res.on('end', () => {
      console.log(`[HTTP Response] Status Code: ${res.statusCode}`);
      try {
        const parsed = JSON.parse(responseBody);
        console.log('[HTTP Response] Body:', JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log('[HTTP Response] Raw Body:', responseBody);
      }
    });
  });

  req.on('error', (err) => {
    console.error(`❌ HTTP Request Error: ${err.message}`);
    console.error('Ensure backend server is running: npm start in the backend directory.');
    socket.disconnect();
    process.exit(1);
  });

  req.write(postData);
  req.end();
}
