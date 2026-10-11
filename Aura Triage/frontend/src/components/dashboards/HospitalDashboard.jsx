import React, { useState, useEffect, useCallback } from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  Hospital,
  Activity,
  Flame,
  Shield,
  Eye,
  ExternalLink,
  RefreshCw,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Truck,
  FileText,
  ChevronRight,
  Sliders,
  Phone,
  Radio,
} from 'lucide-react';
import PatientCard from '../PatientCard';
import TelemetryCard from '../TelemetryCard';
import ActionControls from '../ActionControls';
import IncidentMap from '../IncidentMap';
import DriverConsoleView from '../DriverConsoleView';
import MedicalPrepList from './MedicalPrepList';
import PoliceDispatchModule from './PoliceDispatchModule';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function HospitalDashboard({
  incident,
  isDark = true,
  activeTab = 'triage',
  onTriggerCrashModal,
  handleReserveBay,
  handleReleaseBay,
  isReserving,
}) {
  const [viewMode, setViewMode] = useState('map'); // 'map' | 'emr' | 'split'
  const [incidentsList, setIncidentsList] = useState([incident]);
  const [selectedIncident, setSelectedIncident] = useState(incident);
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);

  // Sync when incident prop updates from WebSocket in App.jsx
  useEffect(() => {
    if (incident) {
      setSelectedIncident(incident);
      setIncidentsList((prev) => {
        const exists = prev.some((i) => i.id === incident.id);
        return exists
          ? prev.map((i) => (i.id === incident.id ? incident : i))
          : [incident, ...prev];
      });
    }
  }, [incident]);

  // Fetch all active collision incidents across the network for this hospital bay
  const fetchActiveIncidents = useCallback(async () => {
    setIsLoadingQueue(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/incidents/active`);
      if (res.ok) {
        const data = await res.json();
        if (data.incidents && data.incidents.length > 0) {
          const formatted = data.incidents.map((inc) => {
            const telematics = inc.telemetry || {};
            const coords = telematics.coordinates || { latitude: 40.7589, longitude: -73.9620 };
            const hosp = inc.hospital || {};
            return {
              id: inc.incidentId,
              status: inc.status,
              createdAt: inc.createdAt,
              telematics: {
                preCrashSpeedKmh: telematics.preCrashSpeedKmh || 94.5,
                impactSpeedKmh: 6.2,
                peakGForce: telematics.peakGForce || 4.85,
                crashCoordinates: {
                  latitude: parseFloat(coords.latitude || 40.7589),
                  longitude: parseFloat(coords.longitude || -73.9620),
                },
              },
              routing: {
                hospitalId: inc.hospitalId || incident.routing.hospitalId,
                hospitalName: hosp.name || incident.routing.hospitalName,
                traumaLevel: hosp.traumaLevel ? `Level-${hosp.traumaLevel}` : incident.routing.traumaLevel,
                distanceKm: 1.8,
                transitEtaMinutes: 5,
                hospitalCoordinates: hosp.coordinates
                  ? {
                      latitude: parseFloat(hosp.coordinates.latitude || 40.7645),
                      longitude: parseFloat(hosp.coordinates.longitude || -73.9554),
                    }
                  : incident.routing.hospitalCoordinates,
              },
              patient: inc.patient
                ? {
                    fullName: inc.patient.fullName,
                    age: inc.patient.age,
                    bloodGroup: inc.patient.bloodGroup,
                    allergies: inc.patient.allergies,
                    chronicConditions: inc.patient.chronicConditions,
                    emergencyContact: inc.patient.emergencyContact,
                  }
                : incident.patient,
            };
          });

          setIncidentsList(formatted);
          setSelectedIncident((prev) => {
            const found = formatted.find((i) => i.id === prev?.id);
            return found || formatted[0];
          });
        }
      }
    } catch (e) {
      console.warn('Queue fetch notice:', e);
    } finally {
      setIsLoadingQueue(false);
    }
  }, [incident]);

  useEffect(() => {
    fetchActiveIncidents();
  }, [fetchActiveIncidents]);

  if (activeTab === 'driver') {
    return (
      <DriverConsoleView
        onTriggerCrashWithParams={onTriggerCrashModal}
        isDark={isDark}
      />
    );
  }

  // Active coordinates for live navigation & maps
  const activeCrashLat = parseFloat(
    selectedIncident?.telematics?.crashCoordinates?.latitude ?? 40.7589
  );
  const activeCrashLon = parseFloat(
    selectedIncident?.telematics?.crashCoordinates?.longitude ?? -73.9620
  );
  const activeHospLat = parseFloat(
    selectedIncident?.routing?.hospitalCoordinates?.latitude ?? 40.7645
  );
  const activeHospLon = parseFloat(
    selectedIncident?.routing?.hospitalCoordinates?.longitude ?? -73.9554
  );

  const googleNavUrl = `https://www.google.com/maps/dir/?api=1&origin=${activeHospLat},${activeHospLon}&destination=${activeCrashLat},${activeCrashLon}`;

  return (
    <div className="w-full flex-1 min-h-0 flex flex-col overflow-y-auto lg:overflow-hidden select-none">
      {/* ─── 1. TOP HOSPITAL VIEW SUBTABS BAR ─── */}
      <div
        className={`px-4 sm:px-6 py-2.5 border-b flex flex-wrap items-center justify-between gap-2.5 transition shrink-0 ${
          isDark
            ? 'bg-slate-900/90 border-slate-800'
            : 'bg-white border-blue-100 shadow-xs'
        }`}
      >
        <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs font-semibold overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
          {/* TAB 1: Ambulance Dispatch & Navigation Map */}
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-2 whitespace-nowrap ${
              viewMode === 'map'
                ? isDark
                  ? 'bg-sky-950/70 text-sky-300 border border-sky-500/40 shadow-sm'
                  : 'bg-sky-50 text-sky-700 border border-sky-200 shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Navigation className="w-4 h-4 text-sky-400" />
            <span>Ambulance Route Map & Queue</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                isDark ? 'bg-sky-500/20 text-sky-300' : 'bg-sky-200 text-sky-800'
              }`}
            >
              {incidentsList.length}
            </span>
          </button>

          {/* TAB 2: Patient EMR & Clinical Prep */}
          <button
            onClick={() => setViewMode('emr')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-2 whitespace-nowrap ${
              viewMode === 'emr'
                ? isDark
                  ? 'bg-rose-950/70 text-rose-300 border border-rose-500/40 shadow-sm'
                  : 'bg-rose-50 text-rose-700 border border-rose-200 shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4 text-rose-400" />
            <span>Patient EMR & Medical Prep</span>
          </button>

          {/* TAB 3: Split Command View (Desktop) */}
          <button
            onClick={() => setViewMode('split')}
            className={`hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
              viewMode === 'split'
                ? isDark
                  ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>Split Command (Both)</span>
          </button>
        </div>

        {/* Right Status Indicator & Navigation Shortcut */}
        <div className="flex items-center space-x-2 text-xs">
          <a
            href={googleNavUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white shadow-sm transition active:scale-95 border border-blue-400/40"
            title="Open Live GPS Route directly in Google Maps for the ambulance driver"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ambulance GPS Nav</span>
            <span className="sm:hidden">GPS Nav</span>
          </a>

          <button
            onClick={fetchActiveIncidents}
            disabled={isLoadingQueue}
            className={`p-1.5 rounded-xl border transition ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
            title="Refresh Incident Queue"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoadingQueue ? 'animate-spin text-sky-400' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* ─── 2. ACTIVE VIEWPORT CONTENT ─── */}

      {/* VIEW A: AMBULANCE DISPATCH & NAVIGATION MAP (Queue on Left, Map on Right - Exactly like Admin section) */}
      {viewMode === 'map' && (
        <div className="w-full flex-1 min-h-0 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
          {/* Left Panel: Active Incident Queue & Ambulance Deployment HUD (35%) */}
          <div
            className={`w-full lg:w-[35%] h-auto lg:h-full overflow-y-auto p-4 sm:p-5 space-y-3.5 border-b lg:border-b-0 lg:border-r transition ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-sky-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Ambulance Dispatch Queue
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30">
                {incidentsList.length} ASSIGNED
              </span>
            </div>

            {/* Quick Active Target Card */}
            {selectedIncident && (
              <div
                className={`p-3.5 rounded-2xl border space-y-2.5 transition ${
                  isDark
                    ? 'bg-slate-900/90 border-sky-500/40 shadow-lg'
                    : 'bg-white border-sky-200 shadow-md'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 flex items-center space-x-1.5">
                    <Radio className="w-3.5 h-3.5 animate-spin" />
                    <span>Target Incident Coordinates</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30">
                    LIVE TRACKING
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black text-white">
                      {selectedIncident.patient?.fullName || 'Victim Occupant'}
                    </h4>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                      Fix: {activeCrashLat.toFixed(4)}° N, {Math.abs(activeCrashLon).toFixed(4)}° W
                    </p>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-xs font-extrabold text-amber-400">
                      {selectedIncident.routing?.distanceKm || 1.8} km
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      ETA ~{selectedIncident.routing?.transitEtaMinutes || 5} min
                    </span>
                  </div>
                </div>

                {/* Direct Google Maps & EMR Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/60">
                  <a
                    href={googleNavUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-sm"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Ambulance Turn-by-Turn</span>
                  </a>
                  <button
                    onClick={() => setViewMode('emr')}
                    className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700"
                  >
                    <FileText className="w-3.5 h-3.5 text-rose-400" />
                    <span>View Patient EMR</span>
                  </button>
                </div>
              </div>
            )}

            {/* List of Incoming Collisions */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Select Incident from Stream:
              </span>

              {incidentsList.map((inc) => {
                const isSelected = selectedIncident?.id === inc.id;
                const cLat = inc.telematics?.crashCoordinates?.latitude || 40.7589;
                const cLon = inc.telematics?.crashCoordinates?.longitude || -73.9620;

                return (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition select-none ${
                      isSelected
                        ? 'bg-slate-800/95 border-sky-500/60 shadow-md ring-1 ring-sky-500/30'
                        : isDark
                        ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-100 flex items-center space-x-1.5">
                        <Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                        <span className="truncate max-w-[160px]">
                          {inc.patient?.fullName || 'Victim Occupant'}
                        </span>
                      </span>
                      <span
                        className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                          inc.status === 'PREPARED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {inc.status || 'DISPATCHED'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
                      <div>
                        Speed:{' '}
                        <strong className="text-slate-200">
                          {inc.telematics?.preCrashSpeedKmh} km/h
                        </strong>
                      </div>
                      <div>
                        Peak G:{' '}
                        <strong className="text-rose-400">
                          {inc.telematics?.peakGForce}g
                        </strong>
                      </div>
                      <div className="col-span-2 text-slate-400 flex items-center justify-between">
                        <span>
                          Blood: <strong className="text-rose-400">{inc.patient?.bloodGroup || 'O-'}</strong>
                        </span>
                        <span className="text-[10px] text-sky-400 font-semibold flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>Inspect Route</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Master Crash & Route Navigation Map (65%) */}
          <div className="w-full lg:w-[65%] min-h-[420px] sm:min-h-[500px] lg:min-h-0 lg:h-full relative flex-1 flex flex-col">
            <IncidentMap
              crashCoords={{
                lat: activeCrashLat,
                lon: activeCrashLon,
              }}
              hospitalCoords={{
                lat: activeHospLat,
                lon: activeHospLon,
              }}
              hospitalName={selectedIncident?.routing?.hospitalName || incident.routing.hospitalName}
              distanceKm={selectedIncident?.routing?.distanceKm || 1.8}
              etaMinutes={selectedIncident?.routing?.transitEtaMinutes || 5}
              isDark={isDark}
            />
          </div>
        </div>
      )}

      {/* VIEW B: PATIENT EMR & MEDICAL PREPARATION VIEW */}
      {viewMode === 'emr' && (
        <div className="w-full flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-5xl mx-auto space-y-5 animate-in fade-in">
            {/* Quick Switch Banner back to Map */}
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-blue-100 shadow-sm'
              }`}
            >
              <div className="flex items-center space-x-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-white">Active Case EMR:</span>
                <span className="font-mono text-sky-400 font-bold">
                  {selectedIncident.patient?.fullName || 'Alex Mercer'}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">
                  Crash Fix: {activeCrashLat.toFixed(4)}°, {activeCrashLon.toFixed(4)}°
                </span>
              </div>
              <button
                onClick={() => setViewMode('map')}
                className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition flex items-center space-x-1.5"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Open Navigation Map</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* 1. Patient EMR View */}
              <PatientCard
                patient={selectedIncident.patient}
                patientCoords={selectedIncident.telematics.crashCoordinates}
                isDark={isDark}
              />

              {/* 2. Actionable Medical Prep List */}
              <MedicalPrepList
                patient={selectedIncident.patient}
                telematics={selectedIncident.telematics}
                isDark={isDark}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* 3. Crash Telemetry & Kinematics */}
              <TelemetryCard
                preCrashSpeed={selectedIncident.telematics.preCrashSpeedKmh}
                terminalSpeed={selectedIncident.telematics.impactSpeedKmh}
                peakGForce={selectedIncident.telematics.peakGForce}
                isDark={isDark}
              />

              {/* 4. Police Dispatch & Law Enforcement */}
              <PoliceDispatchModule
                incidentId={selectedIncident.id}
                crashCoords={selectedIncident.telematics.crashCoordinates}
                isDark={isDark}
              />
            </div>

            {/* 5. Trauma Bay Allocation Controls */}
            <div className="max-w-xl mx-auto pt-2">
              <ActionControls
                incidentStatus={selectedIncident.status}
                onReserveBay={handleReserveBay}
                onReleaseBay={handleReleaseBay}
                isReserving={isReserving}
                isDark={isDark}
              />
            </div>
          </div>
        </div>
      )}

      {/* VIEW C: SPLIT COMMAND VIEW (Both Side-by-Side) */}
      {viewMode === 'split' && (
        <div className="w-full flex-1 min-h-0 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
          {/* LEFT PANEL: EMR Hierarchy */}
          <section
            className={`w-full lg:w-[45%] h-auto lg:h-full overflow-y-auto p-4 sm:p-5 space-y-4 border-b lg:border-b-0 lg:border-r transition ${
              isDark ? 'bg-slate-950/95 border-slate-800' : 'bg-slate-50/80 border-blue-100'
            }`}
          >
            <PatientCard
              patient={selectedIncident.patient}
              patientCoords={selectedIncident.telematics.crashCoordinates}
              isDark={isDark}
            />

            <MedicalPrepList
              patient={selectedIncident.patient}
              telematics={selectedIncident.telematics}
              isDark={isDark}
            />

            <TelemetryCard
              preCrashSpeed={selectedIncident.telematics.preCrashSpeedKmh}
              terminalSpeed={selectedIncident.telematics.impactSpeedKmh}
              peakGForce={selectedIncident.telematics.peakGForce}
              isDark={isDark}
            />

            <PoliceDispatchModule
              incidentId={selectedIncident.id}
              crashCoords={selectedIncident.telematics.crashCoordinates}
              isDark={isDark}
            />

            <ActionControls
              incidentStatus={selectedIncident.status}
              onReserveBay={handleReserveBay}
              onReleaseBay={handleReleaseBay}
              isReserving={isReserving}
              isDark={isDark}
            />
          </section>

          {/* RIGHT PANEL: Live Navigation Map */}
          <section className="w-full lg:w-[55%] min-h-[420px] sm:min-h-[500px] lg:min-h-0 lg:h-full relative flex-1 flex flex-col">
            <IncidentMap
              crashCoords={{
                lat: activeCrashLat,
                lon: activeCrashLon,
              }}
              hospitalCoords={{
                lat: activeHospLat,
                lon: activeHospLon,
              }}
              hospitalName={selectedIncident?.routing?.hospitalName || incident.routing.hospitalName}
              distanceKm={selectedIncident?.routing?.distanceKm || 1.8}
              etaMinutes={selectedIncident?.routing?.transitEtaMinutes || 5}
              isDark={isDark}
            />
          </section>
        </div>
      )}
    </div>
  );
}
