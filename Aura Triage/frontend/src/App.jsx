import React, { useState, useEffect, useCallback, useRef } from 'react';
import io from 'socket.io-client';
import Header from './components/Header';
import AlertBanner from './components/AlertBanner';
import DriverCountdownModal from './components/DriverCountdownModal';
import HospitalDashboard from './components/dashboards/HospitalDashboard';
import PatientDashboard from './components/dashboards/PatientDashboard';
import AdminDashboard from './components/dashboards/AdminDashboard';
import LoginPage from './components/LoginPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { X } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

function AuraTriageMain() {
  const { user } = useAuth();

  const [isConnected, setIsConnected] = useState(false);
  const [activeAlertCount, setActiveAlertCount] = useState(1);
  const [showAlertBanner, setShowAlertBanner] = useState(true);
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const [isReserving, setIsReserving] = useState(false);
  const [activeTab, setActiveTab] = useState('triage'); // 'triage' | 'driver'
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Operations Center Dark Theme by Default
  const [isDark, setIsDark] = useState(true);

  const socketRef = useRef(null);

  // Active Incident State (Preserved for Real-Time Telemetry & Map Routing)
  const [incident, setIncident] = useState({
    id: 'inc-seed-911',
    status: 'TRIGGERED',
    telematics: {
      preCrashSpeedKmh: 94.5,
      impactSpeedKmh: 6.2,
      peakGForce: 4.85,
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
      patientId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      fullName: 'Alex Mercer',
      age: 34,
      bloodGroup: 'O-',
      allergies: ['Penicillin', 'Sulfa Drugs'],
      chronicConditions: ['Mild Asthma', 'Hypertension'],
      emergencyContact: 'Sarah Mercer (Spouse) +1 (555) 382-9912',
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
      socket.emit('JOIN_ROOM', { hospitalId: incident.routing.hospitalId });
      socket.emit('dashboard:join', { hospitalId: incident.routing.hospitalId });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Real-Time Inbound SOS Trigger from Mobile Edge Device / Driver Unit
    const handleEmergencyAlert = (incoming) => {
      console.warn('[Dashboard] Inbound EMERGENCY_CRASH_ALERT received:', incoming);
      const formatted = incoming.incident || incoming;
      const telematics = formatted.telemetry || formatted.telematics || {};
      const coords = telematics.coordinates || telematics.crashCoordinates || { latitude: 40.7589, longitude: -73.9620 };
      const routing = formatted.hospital || formatted.routing || {};

      setIncident({
        id: formatted.incidentId || formatted.id || `inc-${Date.now()}`,
        status: formatted.status || 'DISPATCHED',
        telematics: {
          preCrashSpeedKmh: telematics.preCrashSpeedKmh || 94.5,
          impactSpeedKmh: telematics.impactSpeedKmh || 6.2,
          peakGForce: telematics.peakGForce || 4.85,
          crashCoordinates: coords,
        },
        routing: {
          hospitalId: routing.hospitalId || routing.id || incident.routing.hospitalId,
          hospitalName: routing.name || routing.hospitalName || incident.routing.hospitalName,
          traumaLevel: routing.traumaLevel ? `Level-${routing.traumaLevel}` : incident.routing.traumaLevel,
          distanceKm: formatted.calculatedDistanceKm || routing.distanceKm || 1.4,
          transitEtaMinutes: formatted.transitEtaMinutes || routing.transitEtaMinutes || 5,
          hospitalCoordinates: routing.coordinates || (routing.latitude ? { latitude: routing.latitude, longitude: routing.longitude } : incident.routing.hospitalCoordinates),
        },
        patient: formatted.patient || incident.patient,
      });

      setShowAlertBanner(true);
      setIsAcknowledged(false);
      setActiveAlertCount((prev) => Math.max(1, prev + 1));
      setActiveTab('triage');
      playAlertChime();
    };

    socket.on('EMERGENCY_CRASH_ALERT', handleEmergencyAlert);
    socket.on('trauma:incoming_alert', handleEmergencyAlert);

    // Trauma Bay status synchronization
    const handleStatusSync = (update) => {
      if (update.incidentId === incident.id) {
        setIncident((prev) => ({ ...prev, status: update.status }));
      }
    };

    socket.on('INCIDENT_UPDATED', handleStatusSync);
    socket.on('trauma:status_updated', handleStatusSync);

    // Hydrate active queue from GET /api/v1/incidents/active on mount
    fetch(`${BACKEND_URL}/api/v1/incidents/active`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.incidents;
        if (list && list.length > 0) {
          handleEmergencyAlert(list[0]);
        }
      })
      .catch((err) => console.log('[Hydrate Queue Notice]', err.message));

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
      await fetch(`${BACKEND_URL}/api/v1/incidents/${incident.id}/status`, {
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
      setIncident((prev) => ({ ...prev, status: 'PREPARED' }));
    } finally {
      setIsReserving(false);
    }
  };

  // Handle "Release / Modify Bay" Action
  const handleReleaseBay = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/v1/incidents/${incident.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DISPATCHED' }),
      });

      setIncident((prev) => ({ ...prev, status: 'DISPATCHED' }));
    } catch (err) {
      setIncident((prev) => ({ ...prev, status: 'DISPATCHED' }));
    }
  };

  // Dispatch Confirmed SOS (after 10s countdown or bypass)
  const handleDispatchConfirmed = async (telemetryParams) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/sos/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: 'random',
          preCrashSpeedKmh: telemetryParams.preSpeed || (Math.random() * 45 + 75).toFixed(1),
          peakGForce: telemetryParams.peakG || (Math.random() * 2.8 + 3.9).toFixed(2),
          lat: telemetryParams.latitude || telemetryParams.lat,
          lng: telemetryParams.longitude || telemetryParams.lon || telemetryParams.lng,
          randomize: true,
        }),
      });

      const result = await response.json();
      if (result.incident) {
        const inc = result.incident;
        const tele = inc.telemetry || {};
        const hosp = inc.hospital || {};
        const pat = inc.patient || {};

        setIncident({
          id: inc.incidentId,
          status: inc.status || 'DISPATCHED',
          telematics: {
            preCrashSpeedKmh: tele.preCrashSpeedKmh || telemetryParams.preSpeed,
            impactSpeedKmh: telemetryParams.impactSpeed || 5.8,
            peakGForce: tele.peakGForce || telemetryParams.peakG,
            crashCoordinates: tele.coordinates || {
              latitude: telemetryParams.latitude || 40.7589,
              longitude: telemetryParams.longitude || -73.9620,
            },
          },
          routing: {
            hospitalId: hosp.id || hosp.hospitalId,
            hospitalName: hosp.name,
            traumaLevel: `Level-${hosp.traumaLevel}`,
            distanceKm: inc.calculatedDistanceKm || 1.8,
            transitEtaMinutes: inc.transitEtaMinutes || 4,
            hospitalCoordinates: {
              latitude: hosp.latitude,
              longitude: hosp.longitude,
            },
          },
          patient: {
            id: pat.id,
            patientId: pat.id,
            fullName: pat.fullName,
            age: pat.age,
            bloodGroup: pat.bloodGroup,
            allergies: pat.allergies,
            chronicConditions: pat.chronicConditions,
            emergencyContact: pat.emergencyContact,
          },
        });

        setShowAlertBanner(true);
        setIsAcknowledged(false);
        setActiveAlertCount((prev) => prev + 1);
        setActiveTab('triage');
        playAlertChime();
      }
    } catch (err) {
      console.warn('Backend SOS dispatch fallback:', err);
    }
  };

  // If unauthenticated (e.g. logged out), show full Login Screen
  if (!user) {
    return <LoginPage isDark={isDark} />;
  }

  const currentRole = user?.role || 'HOSPITAL';

  return (
    <div
      className={`min-h-screen w-full flex flex-col font-sans transition-colors duration-200 select-none ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* 1. TOP HEADER BAR (With Role Status & Navigation) */}
      <Header
        hospitalName={incident.routing.hospitalName}
        traumaLevel={incident.routing.traumaLevel}
        activeCount={activeAlertCount}
        isConnected={isConnected}
        onOpenDriverModal={() => setIsDriverModalOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDark={isDark}
        setIsDark={setIsDark}
      />

      {/* 2. DYNAMIC ALERT BANNER (Active for Hospital ER role) */}
      {currentRole === 'HOSPITAL' && (
        <AlertBanner
          isVisible={showAlertBanner}
          peakG={Number(incident?.telematics?.peakGForce || 4.2).toFixed(1)}
          etaMinutes={incident?.routing?.transitEtaMinutes || 5}
          isAcknowledged={isAcknowledged}
          onAcknowledge={handleAcknowledge}
        />
      )}

      {/* 3. ROLE-BASED DASHBOARD ROUTING */}
      <main className="flex-1 w-full min-h-0 flex flex-col overflow-y-auto lg:overflow-hidden relative">
        {currentRole === 'HOSPITAL' && (
          <HospitalDashboard
            incident={incident}
            isDark={isDark}
            activeTab={activeTab}
            onTriggerCrashModal={() => setIsDriverModalOpen(true)}
            handleReserveBay={handleReserveBay}
            handleReleaseBay={handleReleaseBay}
            isReserving={isReserving}
          />
        )}

        {currentRole === 'PATIENT' && (
          <PatientDashboard
            isDark={isDark}
            setIsDark={setIsDark}
            onOpenDriverModal={() => setIsDriverModalOpen(true)}
          />
        )}

        {currentRole === 'ADMIN' && (
          <AdminDashboard isDark={isDark} />
        )}
      </main>

      {/* 4. DRIVER 10-SECOND FAIL-SAFE COUNTDOWN MODAL (Global for edge simulation) */}
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

      {/* 5. ROLE SELECTION / LOGIN MODAL OVERLAY */}
      {isLoginModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsLoginModalOpen(false);
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in overflow-y-auto"
        >
          <div className="relative w-full max-w-xl my-auto">
            <LoginPage
              isDark={isDark}
              onCancel={() => setIsLoginModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuraTriageMain />
    </AuthProvider>
  );
}
