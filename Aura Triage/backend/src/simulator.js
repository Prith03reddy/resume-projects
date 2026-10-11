/**
 * AuraTriage - Edge Incident Simulator (CLI Test Tool)
 * 
 * Simulates a real-world highway collision scenario:
 * 1. Vehicle cruising at 88 km/h.
 * 2. Sudden deceleration to 8 km/h within 800ms (Δv = 80 km/h >= 40 km/h).
 * 3. Linear acceleration impact spike: 4.6g (>= 3.8g).
 * 4. Dispatches the SOS payload to the AuraTriage backend.
 * 
 * Usage:
 *   node src/simulator.js
 */

const http = require('http');

console.log('------------------------------------------------------------');
console.log('⚡ AuraTriage Collision Telemetry Simulator Starting...');
console.log('------------------------------------------------------------');

const crashPayload = {
  patientId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', // Alex Mercer, O-
  preCrashSpeed: 88.4,  // km/h (Condition 1: > 40 km/h drop)
  impactSpeed: 8.2,     // km/h
  peakGForce: 4.65,     // g-force (Condition 2: >= 3.8g)
  // Crash coordinates near FDR Drive / Queensboro Corridor (New York)
  latitude: 40.7589,
  longitude: -73.9620,
  timestamp: Date.now(),
};

const payloadString = JSON.stringify(crashPayload);

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 5000,
  path: '/api/incidents/sos',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payloadString),
  },
};

console.log('🚗 Telemetry: Pre-Crash Speed = 88.4 km/h');
console.log('💥 IMPACT EVENT! Speed dropped to 8.2 km/h (Δv = 80.2 km/h)');
console.log('📈 Peak Linear Acceleration: 4.65g (45.6 m/s²)');
console.log('⏳ 10-Second Countdown Expired (Uncanceled)');
console.log('📡 Transmitting SOS payload to AuraTriage Trauma Broker...\n');

const req = http.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log(`HTTP Status: ${res.statusCode}`);
    try {
      const parsed = JSON.parse(responseData);
      console.log('✅ Broker Response:', JSON.stringify(parsed, null, 2));
      console.log('\n🏥 Routed Hospital:', parsed.data?.routing?.hospitalName);
      console.log(`📍 Distance: ${parsed.data?.routing?.distanceKm} km | Ambulance ETA: ${parsed.data?.routing?.transitEtaMinutes} minutes`);
      console.log('🩸 Patient Blood Type Transmitted:', parsed.data?.patient?.bloodGroup);
      console.log('🚀 Check the React ER Dashboard to see the real-time alert and route!');
    } catch (e) {
      console.log('Raw Response:', responseData);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Dispatch connection failed: ${e.message}`);
  console.error('Make sure the AuraTriage backend is running (npm start in backend folder).');
});

req.write(payloadString);
req.end();

