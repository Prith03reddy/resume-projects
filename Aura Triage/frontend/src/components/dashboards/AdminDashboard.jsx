import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Hospital,
  MapPin,
  Activity,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Radio,
  Clock,
  RefreshCw,
  Eye,
  Sliders,
  Flame,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import IncidentMap from '../IncidentMap';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function AdminDashboard({ isDark = true }) {
  const { token } = useAuth();

  const [activeAdminTab, setActiveAdminTab] = useState('map'); // 'map' | 'patients' | 'hospitals'
  const [metrics, setMetrics] = useState(null);
  const [patients, setPatients] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [overviewRes, patientsRes, hospitalsRes, incidentsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/v1/admin/overview`, { headers }),
        fetch(`${BACKEND_URL}/api/v1/admin/patients`, { headers }),
        fetch(`${BACKEND_URL}/api/v1/admin/hospitals`, { headers }),
        fetch(`${BACKEND_URL}/api/v1/admin/incidents`, { headers }),
      ]);

      const [overviewData, patientsData, hospitalsData, incidentsData] = await Promise.all([
        overviewRes.json(),
        patientsRes.json(),
        hospitalsRes.json(),
        incidentsRes.json(),
      ]);

      setMetrics(overviewData.metrics);
      setPatients(patientsData.patients || []);
      setHospitals(hospitalsData.hospitals || []);
      setIncidents(incidentsData.incidents || []);

      if (incidentsData.incidents && incidentsData.incidents.length > 0) {
        setSelectedIncident(incidentsData.incidents[0]);
      }
    } catch (err) {
      console.error('[Admin Dashboard Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  const handleToggleHospital = async (hospitalId, currentStatus) => {
    try {
      await fetch(`${BACKEND_URL}/api/v1/admin/hospitals/${hospitalId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      setHospitals((prev) =>
        prev.map((h) => (h.hospitalId === hospitalId ? { ...h, isActive: !currentStatus } : h))
      );
    } catch (err) {
      console.error('Failed to toggle hospital status:', err);
    }
  };

  const filteredPatients = patients.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.fullName.toLowerCase().includes(q) ||
      p.bloodGroup.toLowerCase().includes(q) ||
      (p.email && p.email.toLowerCase().includes(q))
    );
  });

  return (
    <div
      className={`h-full w-full flex flex-col overflow-hidden transition select-none ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* 1. Admin KPI Header Bar */}
      <div
        className={`px-4 sm:px-6 py-4 border-b flex flex-wrap items-center justify-between gap-4 transition ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-black tracking-tight">Admin System Overseer Control Panel</h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                TOTAL VISIBILITY
              </span>
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Regional Trauma Dispatch Mesh • Master Telemetry Stream
            </p>
          </div>
        </div>

        {/* KPI Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div
            className={`px-3 py-1.5 rounded-xl border flex items-center space-x-2 ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-rose-400" />
            <span className="font-semibold text-slate-400">Patients:</span>
            <strong className="font-mono text-white">{metrics?.totalPatients ?? patients.length}</strong>
          </div>

          <div
            className={`px-3 py-1.5 rounded-xl border flex items-center space-x-2 ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <Hospital className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-slate-400">Trauma Centers:</span>
            <strong className="font-mono text-white">{metrics?.totalHospitals ?? hospitals.length}</strong>
          </div>

          <div
            className={`px-3 py-1.5 rounded-xl border flex items-center space-x-2 ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span className="font-semibold text-slate-400">Active SOS Dispatches:</span>
            <strong className="font-mono text-red-400">{metrics?.activeDispatches ?? incidents.length}</strong>
          </div>

          <button
            onClick={fetchAdminData}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Refresh Network Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Admin Navigation Subtabs */}
      <div
        className={`px-4 sm:px-6 py-2.5 border-b flex flex-wrap items-center gap-2 text-xs ${
          isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100/90 border-slate-200'
        }`}
      >
        <button
          onClick={() => setActiveAdminTab('map')}
          className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
            activeAdminTab === 'map'
              ? isDark
                ? 'bg-slate-800 text-amber-400 shadow-sm border border-amber-500/30'
                : 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Global Incident Map ({incidents.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('patients')}
          className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
            activeAdminTab === 'patients'
              ? isDark
                ? 'bg-slate-800 text-rose-400 shadow-sm border border-rose-500/30'
                : 'bg-white text-rose-600 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Patient Directory ({patients.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('hospitals')}
          className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
            activeAdminTab === 'hospitals'
              ? isDark
                ? 'bg-slate-800 text-cyan-400 shadow-sm border border-cyan-500/30'
                : 'bg-white text-cyan-600 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Hospital className="w-3.5 h-3.5" />
          <span>Hospital Fleet Directory ({hospitals.length})</span>
        </button>
      </div>

      {/* 3. Subtab Views */}
      <div className="flex-1 w-full min-h-0 overflow-y-auto lg:overflow-hidden">
        {/* TAB 1: GLOBAL INCIDENT MAP */}
        {activeAdminTab === 'map' && (
          <div className="w-full flex-1 min-h-0 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
            {/* Left Queue Stream (35%) */}
            <div
              className={`w-full lg:w-[35%] h-auto max-h-[380px] lg:max-h-none lg:h-full overflow-y-auto p-4 space-y-3 border-b lg:border-b-0 lg:border-r ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Global Network Collision Incidents
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-400 font-bold border border-red-500/30">
                  {incidents.length} TOTAL
                </span>
              </div>

              {incidents.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">No network incidents recorded.</div>
              ) : (
                incidents.map((inc) => {
                  const isSelected = selectedIncident?.incidentId === inc.incidentId;
                  return (
                    <div
                      key={inc.incidentId}
                      onClick={() => setSelectedIncident(inc)}
                      className={`p-3.5 rounded-xl border text-xs cursor-pointer transition select-none ${
                        isSelected
                          ? 'bg-slate-800/90 border-amber-500/60 shadow-md ring-1 ring-amber-500/30'
                          : isDark
                          ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-slate-100 flex items-center space-x-1.5">
                          <Flame className="w-3.5 h-3.5 text-red-400" />
                          <span>{inc.patient?.name || 'Victim Occupant'}</span>
                        </span>
                        <span
                          className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                            inc.status === 'PREPARED'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-red-500/10 text-red-400 border-red-500/30'
                          }`}
                        >
                          {inc.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
                        <div>Speed: <strong className="text-slate-200">{inc.telemetry?.preCrashSpeedKmh} km/h</strong></div>
                        <div>Peak G: <strong className="text-rose-400">{inc.telemetry?.peakGForce}g</strong></div>
                        <div className="col-span-2 truncate">Hospital: <strong className="text-cyan-400">{inc.hospital?.name}</strong></div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800/60 mt-2">
                        <span>{new Date(inc.createdAt).toLocaleTimeString()}</span>
                        <span className="text-amber-400 font-semibold flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>Inspect on Map</span>
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right Master Map View (65%) */}
            <div className="w-full lg:w-[65%] min-h-[420px] sm:min-h-[500px] lg:min-h-0 lg:h-full relative flex-1 flex flex-col">
              <IncidentMap
                crashCoords={{
                  lat: selectedIncident?.telemetry?.coordinates?.latitude ?? 40.7589,
                  lon: selectedIncident?.telemetry?.coordinates?.longitude ?? -73.9620,
                }}
                hospitalCoords={{
                  lat: selectedIncident?.hospital?.latitude ?? 40.7645,
                  lon: selectedIncident?.hospital?.longitude ?? -73.9554,
                }}
                hospitalName={selectedIncident?.hospital?.name || 'Metro General Trauma Center'}
                distanceKm={2.1}
                etaMinutes={4}
                isDark={isDark}
              />
            </div>
          </div>
        )}

        {/* TAB 2: PATIENT DIRECTORY */}
        {activeAdminTab === 'patients' && (
          <div className="h-full w-full overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold">All Registered Patients ({filteredPatients.length})</h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Centralized EMR database records across the AuraTriage network.
                </p>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search name, blood group, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs ${
                    isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300'
                  }`}
                />
              </div>
            </div>

            {/* Patients Table */}
            <div
              className={`border rounded-2xl overflow-hidden shadow-sm ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={`border-b ${isDark ? 'bg-slate-950/70 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                      <th className="p-3.5 font-bold">Patient Name</th>
                      <th className="p-3.5 font-bold">Age</th>
                      <th className="p-3.5 font-bold">Blood Group</th>
                      <th className="p-3.5 font-bold">Allergies</th>
                      <th className="p-3.5 font-bold">Primary Contact</th>
                      <th className="p-3.5 font-bold">Address</th>
                      <th className="p-3.5 font-bold">Medical Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {filteredPatients.map((p) => (
                      <tr key={p.patientId} className={`hover:bg-slate-800/30 transition`}>
                        <td className="p-3.5 font-bold text-white flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold text-[10px]">
                            {p.fullName.charAt(0)}
                          </div>
                          <span>{p.fullName}</span>
                        </td>
                        <td className="p-3.5 text-slate-300 font-mono">{p.age} Yrs</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-rose-500/20 text-rose-400 border border-rose-500/40">
                            {p.bloodGroup}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {p.allergies && p.allergies.length > 0 ? (
                              p.allergies.map((alg) => (
                                <span
                                  key={alg}
                                  className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-red-500/10 text-red-400 border border-red-500/20"
                                >
                                  {alg}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-500 text-[11px]">—</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-sky-400">{p.emergencyContact1}</td>
                        <td className="p-3.5 text-slate-400 truncate max-w-xs">{p.homeAddress || '—'}</td>
                        <td className="p-3.5 text-slate-400 truncate max-w-xs">{p.additionalMedicalDetails || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: HOSPITAL FLEET DIRECTORY */}
        {activeAdminTab === 'hospitals' && (
          <div className="h-full w-full overflow-y-auto p-4 sm:p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold">Active Hospital Network Fleet ({hospitals.length})</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Level-1, Level-2, and Level-3 regional receiving trauma facilities.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {hospitals.map((h) => (
                <div
                  key={h.hospitalId}
                  className={`border rounded-2xl p-5 space-y-3 transition ${
                    isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      <Hospital className="w-5 h-5" />
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        h.traumaLevel === '1'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      Trauma Level {h.traumaLevel}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white">{h.name}</h4>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                      GPS: {parseFloat(h.latitude || 40.7645).toFixed(4)}, {parseFloat(h.longitude || -73.9554).toFixed(4)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                    <span className="flex items-center space-x-1.5 font-semibold">
                      <span className={`w-2 h-2 rounded-full ${h.isActive ? 'bg-emerald-400' : 'bg-red-500'}`} />
                      <span>{h.isActive ? 'Network Active' : 'Offline / Standby'}</span>
                    </span>

                    <button
                      onClick={() => handleToggleHospital(h.hospitalId, h.isActive)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                        h.isActive
                          ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                          : 'bg-emerald-600 border-emerald-500 text-white'
                      }`}
                    >
                      {h.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

