import React, { useState, useEffect, useCallback, useRef } from 'react';
import io from 'socket.io-client';
import Header from './components/Header';
import AlertBanner from './components/AlertBanner';
import PatientCard from './components/PatientCard';
import TelemetryCard from './components/TelemetryCard';
import ActionControls from './components/ActionControls';
import IncidentMap from './components/IncidentMap';
import DriverCountdownModal from './components/DriverCountdownModal';
import DriverConsoleView from './components/DriverConsoleView';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [activeAlertCount, setActiveAlertCount] = useState(1);
  const [showAlertBanner, setShowAlertBanner] = useState(true);
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const [isReserving, setIsReserving] = useState(false);
  const [activeTab, setActiveTab] = useState('triage'); // 'triage' | 'driver'
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  
  // Default to Dark Operations Center Mode as recommended for ER monitoring
  const [isDark, setIsDark] = useState(true);

  const socketRef = useRef(null);

  // Active Incident State
  const [incident, setIncident] = useState({
    id: 'inc-seed-911',
    status: 'TRIGGERED',
    telematics: {
      preCrashSpeedKmh: 92.5,
      impactSpeedKmh: 6.0,
      peakGForce: 5.10,
      crashCoordinates: {
        latitude: 40.7589,
        longitude: -73.9620,
      },
    },
    routing: {
      hospitalId: '11111111-1111-1111-1111-111111111111',
      hospitalName: 'Metro General Trauma Center',
      traumaLevel: 'Level-1',
      icuBedsAvailable: 6,
      hospitalCoordinates: {
        latitude: 40.7645,
        longitude: -73.9554,
      },
      distanceKm: 1.4,
      transitEtaMinutes: 5,
    },
    patient: {
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      fullName: 'Alex Mercer',
      age: 34,
      bloodGroup: 'O-',
      allergies: ['Penicillin', 'Sulfa Drugs'],
      chronicConditions: ['Mild Asthma', 'Hypertension'],
      emergencyContactName: 'Sarah Mercer (Spouse)',
      emergencyContactPhone: '+1 (555) 382-9912',
    },
  });

  // Synthesize Web Audio Emergency Alert Tone
  const playAlertChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      console.warn('Audio chime notice:', e);
    }
  }, []);

  // Socket.IO Connection & Event Handlers
  useEffect(() => {
    const socket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      timeout: 5000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Dashboard] Connected to AuraTriage Real-Time Broker:', socket.id);
      setIsConnected(true);
      socket.emit('dashboard:join', { hospitalId: incident.routing.hospitalId });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Real-Time Inbound SOS Trigger from Mobile Edge Device / Driver Unit
    socket.on('trauma:incoming_alert', (incoming) => {
      console.warn('[Dashboard] Inbound collision telemetry received:', incoming);
      setIncident(incoming);
      setShowAlertBanner(true);
      setIsAcknowledged(false);
      setActiveAlertCount((prev) => Math.max(1, prev + 1));
      setActiveTab('triage');
      playAlertChime();
    });

    // Trauma Bay status synchronization
    socket.on('trauma:status_updated', (update) => {
      if (update.incidentId === incident.id) {
        setIncident((prev) => ({ ...prev, status: update.status }));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [incident.routing.hospitalId, incident.id, playAlertChime]);

  // Handle "Acknowledge & Prep ICU" from Alert Banner
  const handleAcknowledge = () => {
    setIsAcknowledged(true);
    handleReserveBay();
  };

  // Handle "Reserve Trauma Bay" Action
  const handleReserveBay = async () => {
    setIsReserving(true);
    try {
      await fetch(`${BACKEND_URL}/api/incidents/${incident.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PREPARED' }),
      });

      if (socketRef.current?.connected) {
        socketRef.current.emit('trauma:reserve_bay', {
          incidentId: incident.id,
          hospitalId: incident.routing.hospitalId,
        });
      }

      setIncident((prev) => ({ ...prev, status: 'PREPARED' }));
    } catch (err) {
      console.warn('API update fallback to local state:', err);
      setIncident((prev) => ({ ...prev, status: 'PREPARED' }));
    } finally {
      setIsReserving(false);
    }
  };

  // Handle "Release / Modify Bay" Action
  const handleReleaseBay = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/incidents/${incident.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'TRIGGERED' }),
      });

      if (socketRef.current?.connected) {
        socketRef.current.emit('trauma:status_updated', {
          incidentId: incident.id,
          status: 'TRIGGERED',
        });
      }

      setIncident((prev) => ({ ...prev, status: 'TRIGGERED' }));
    } catch (err) {
      setIncident((prev) => ({ ...prev, status: 'TRIGGERED' }));
    }
  };

  // Dispatch Confirmed SOS (after 10s countdown or bypass)
  const handleDispatchConfirmed = async (telemetryParams) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/incidents/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: incident.patient.id,
          preCrashSpeed: telemetryParams.preSpeed || 94.5,
          impactSpeed: telemetryParams.impactSpeed || 6.2,
          peakGForce: telemetryParams.peakG || 4.85,
          latitude: telemetryParams.lat || 40.7589,
          longitude: telemetryParams.lon || -73.9620,
        }),
      });
      const result = await response.json();
      if (result.data) {
        setIncident(result.data);
        setShowAlertBanner(true);
        setIsAcknowledged(false);
        setActiveAlertCount((prev) => prev + 1);
        setActiveTab('triage');
        playAlertChime();
      }
    } catch (err) {
      console.warn('Backend SOS dispatch fallback:', err);
      setIncident((prev) => ({
        ...prev,
        id: `inc-${Date.now()}`,
        status: 'TRIGGERED',
        telematics: {
          preCrashSpeedKmh: telemetryParams.preSpeed || 94.5,
          impactSpeedKmh: telemetryParams.impactSpeed || 6.2,
          peakGForce: telemetryParams.peakG || 4.85,
          crashCoordinates: {
            latitude: telemetryParams.lat || 40.7589,
            longitude: telemetryParams.lon || -73.9620,
          },
        },
      }));
      setShowAlertBanner(true);
      setIsAcknowledged(false);
      setActiveAlertCount((prev) => prev + 1);
      setActiveTab('triage');
      playAlertChime();
    }
  };

  return (
    <div
      className={`h-screen w-screen flex flex-col overflow-hidden select-none font-sans transition-colors duration-200 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* 1. TOP HEADER BAR */}
      <Header
        hospitalName={incident.routing.hospitalName}
        traumaLevel={incident.routing.traumaLevel}
        activeCount={activeAlertCount}
        isConnected={isConnected}
        onOpenDriverModal={() => setIsDriverModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDark={isDark}
        setIsDark={setIsDark}
      />

      {/* 2. DYNAMIC ALERT BANNER (High-Contrast Red with Charcoal Button to eliminate green-on-red vibration) */}
      <AlertBanner
        isVisible={showAlertBanner}
        peakG={Number(incident.telematics.peakGForce).toFixed(1)}
        etaMinutes={incident.routing.transitEtaMinutes}
        isAcknowledged={isAcknowledged}
        onAcknowledge={handleAcknowledge}
      />

      {/* 3. MAIN SECTION CONTENT */}
      {activeTab === 'driver' ? (
        // Dedicated In-Vehicle Driver Safety Console View
        <DriverConsoleView
          onTriggerCrashWithParams={() => setIsDriverModalOpen(true)}
          isDark={isDark}
        />
      ) : (
        // Main ER Triage Bay View: Responsive Flex Layout (Stacks on Tablet/Mobile, Side-by-Side on Desktop)
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* LEFT PANEL (42% on desktop, full-width scrollable on mobile/tablet) */}
          <section
            className={`w-full lg:w-[42%] h-auto lg:h-full overflow-y-auto p-4 sm:p-5 space-y-4 border-b lg:border-b-0 lg:border-r transition ${
              isDark
                ? 'bg-slate-950/95 border-slate-800'
                : 'bg-slate-50/80 border-blue-100'
            }`}
          >
            {/* INFORMATION HIERARCHY PIVOT:
                Patient EMR & Medical Profile is placed FIRST for immediate ATLS trauma prep */}
            <PatientCard
              patient={incident.patient}
              patientCoords={incident.telematics.crashCoordinates}
              isDark={isDark}
            />

            {/* Crash Telemetry & Kinematics placed SECOND */}
            <TelemetryCard
              preCrashSpeed={incident.telematics.preCrashSpeedKmh}
              terminalSpeed={incident.telematics.impactSpeedKmh}
              peakGForce={incident.telematics.peakGForce}
              isDark={isDark}
            />

            {/* Action & Bay Allocation Area (Separates Status Card from Action Button) */}
            <ActionControls
              incidentStatus={incident.status}
              onReserveBay={handleReserveBay}
              onReleaseBay={handleReleaseBay}
              isReserving={isReserving}
              isDark={isDark}
            />
          </section>

          {/* RIGHT PANEL (58% on desktop: Watermark-Free Esri Dark Navigation Night Canvas) */}
          <section className="w-full lg:w-[58%] h-[380px] sm:h-[450px] lg:h-full relative flex-1">
            <IncidentMap
              crashCoords={{
                lat: incident.telematics.crashCoordinates.latitude,
                lon: incident.telematics.crashCoordinates.longitude,
              }}
              hospitalCoords={{
                lat: incident.routing.hospitalCoordinates.latitude,
                lon: incident.routing.hospitalCoordinates.longitude,
              }}
              hospitalName={incident.routing.hospitalName}
              distanceKm={incident.routing.distanceKm}
              etaMinutes={incident.routing.transitEtaMinutes}
              isDark={isDark}
            />
          </section>
        </div>
      )}

      {/* 4. DRIVER 10-SECOND FAIL-SAFE COUNTDOWN MODAL */}
      <DriverCountdownModal
        isOpen={isDriverModalOpen}
        onClose={() => setIsDriverModalOpen(false)}
        onDispatchConfirmed={handleDispatchConfirmed}
        defaultTelemetry={{
          preSpeed: 94.5,
          impactSpeed: 6.2,
          peakG: 4.85,
          latitude: 40.7589,
          longitude: -73.9620,
        }}
        isDark={isDark}
      />
    </div>
  );
}
