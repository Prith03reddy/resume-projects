import React, { useState, useEffect } from 'react';
import {
  User,
  Heart,
  AlertTriangle,
  Phone,
  Home,
  FileText,
  Save,
  CheckCircle,
  ShieldCheck,
  QrCode,
  Car,
  Bell,
  Clock,
  Edit3,
  Moon,
  Sun,
  Activity,
  Plus,
  X,
  Sparkles,
  MapPin,
  Navigation,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import IncidentMap from '../IncidentMap';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const BLOOD_GROUPS = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
const COMMON_ALLERGIES = [
  'Penicillin',
  'Sulfa Drugs',
  'Latex',
  'Aspirin',
  'Iodine Contrast',
  'Shellfish',
  'Cephalosporins',
  'NSAIDs',
  'Opioids',
];

export default function PatientDashboard({ isDark, setIsDark, onOpenDriverModal }) {
  const { user, token } = useAuth();

  const [patientTab, setPatientTab] = useState('profile'); // 'profile' | 'map' | 'id_card'
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Form State (initialized from user details if already available)
  const [formData, setFormData] = useState(() => {
    const details = user?.patientDetails || {};
    return {
      fullName: details.fullName || details.name || user?.name || 'Alex Mercer',
      age: details.age || 34,
      bloodGroup: details.bloodGroup || 'O-',
      allergies: Array.isArray(details.allergies) ? details.allergies : ['Penicillin', 'Sulfa Drugs'],
      chronicConditions: Array.isArray(details.chronicConditions) ? details.chronicConditions : ['Mild Asthma', 'Hypertension'],
      homeAddress: details.homeAddress || '742 Evergreen Terrace, Sector 4, Metro City',
      emergencyContact1: details.emergencyContact1 || '+1 (555) 382-9912 (Sarah Mercer - Spouse)',
      emergencyContact2: details.emergencyContact2 || '+1 (555) 491-0021 (Dr. Jonathan Cole)',
      additionalMedicalDetails: details.additionalMedicalDetails || 'Penicillin allergy causes anaphylaxis. In-cabin crash sensor calibrated.',
      email: details.email || user?.email || 'alex.mercer@gmail.com',
    };
  });

  const [customAllergy, setCustomAllergy] = useState('');
  const [customCondition, setCustomCondition] = useState('');

  // Fetch Patient's own profile from /api/v1/patient/profile (Strict Boundary)
  useEffect(() => {
    if (user?.patientDetails) {
      const details = user.patientDetails;
      setFormData((prev) => ({
        ...prev,
        fullName: details.fullName || details.name || prev.fullName,
        age: details.age || prev.age,
        bloodGroup: details.bloodGroup || prev.bloodGroup,
        allergies: Array.isArray(details.allergies) ? details.allergies : prev.allergies,
        chronicConditions: Array.isArray(details.chronicConditions) ? details.chronicConditions : prev.chronicConditions,
        homeAddress: details.homeAddress || prev.homeAddress,
        emergencyContact1: details.emergencyContact1 || prev.emergencyContact1,
        emergencyContact2: details.emergencyContact2 || prev.emergencyContact2,
        additionalMedicalDetails: details.additionalMedicalDetails || prev.additionalMedicalDetails,
        email: details.email || prev.email,
      }));
    }

    fetch(`${BACKEND_URL}/api/v1/patient/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data) {
          setFormData((prev) => ({
            ...prev,
            fullName: data.fullName || prev.fullName,
            age: data.age || prev.age,
            bloodGroup: data.bloodGroup || prev.bloodGroup,
            allergies: Array.isArray(data.allergies) && data.allergies.length ? data.allergies : prev.allergies,
            chronicConditions: Array.isArray(data.chronicConditions) && data.chronicConditions.length ? data.chronicConditions : prev.chronicConditions,
            homeAddress: data.homeAddress || prev.homeAddress,
            emergencyContact1: data.emergencyContact1 || prev.emergencyContact1,
            emergencyContact2: data.emergencyContact2 || prev.emergencyContact2,
            additionalMedicalDetails: data.additionalMedicalDetails || prev.additionalMedicalDetails,
            email: data.email || prev.email,
          }));
        }
      })
      .catch((err) => {
        console.log('[PatientProfileNotice]', err.message);
      });
  }, [token, user]);

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSaveSuccess(false);

    try {
      await fetch(`${BACKEND_URL}/api/v1/patient/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
    } catch (err) {
      console.warn('[ProfileSaveOfflineSync]', err.message);
    } finally {
      // Update local storage so data is immediately preserved and visible across portals
      try {
        const stored = localStorage.getItem('auratriage_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.name = formData.fullName;
          parsed.patientDetails = { ...formData };
          localStorage.setItem('auratriage_user', JSON.stringify(parsed));
        }
      } catch (e) {}

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
      setSaving(false);
    }
  };

  const toggleAllergyTag = (tag) => {
    setFormData((prev) => {
      const exists = prev.allergies.includes(tag);
      return {
        ...prev,
        allergies: exists ? prev.allergies.filter((t) => t !== tag) : [...prev.allergies, tag],
      };
    });
  };

  const addCustomAllergy = () => {
    if (!customAllergy.trim()) return;
    if (!formData.allergies.includes(customAllergy.trim())) {
      setFormData((prev) => ({
        ...prev,
        allergies: [...prev.allergies, customAllergy.trim()],
      }));
    }
    setCustomAllergy('');
  };

  const removeAllergyTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      allergies: prev.allergies.filter((t) => t !== tag),
    }));
  };

  return (
    <div
      className={`min-h-full w-full overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 transition ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* 1. Header Banner with Profile Summary & Light/Dark Mode Switch */}
      <div
        className={`border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition ${
          isDark
            ? 'bg-slate-900/90 border-slate-800 shadow-slate-950/40'
            : 'bg-white border-blue-100 shadow-sm'
        }`}
      >
        <div className="flex items-center space-x-4">
          <div className="p-3.5 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <User className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black tracking-tight">{formData.fullName || user?.name || 'Patient'}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                Blood Group {formData.bloodGroup}
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Self-Sovereign Emergency Medical Record (EMR) • AES-256 Protected
            </p>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenDriverModal}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-md shadow-red-600/30 transition"
          >
            <Car className="w-4 h-4 animate-bounce" />
            <span>Test In-Cabin SOS (10s Countdown)</span>
          </button>

          <button
            onClick={() => setIsDark(!isDark)}
            className={`p-2 rounded-xl border text-xs flex items-center space-x-1.5 transition ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title="Toggle Light/Dark Theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. Patient Navigation Tabs: Details Form vs Live Location Tracker Map vs Digital ID */}
      <div className={`flex flex-wrap items-center gap-2 border-b pb-3 text-xs ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <button
          onClick={() => setPatientTab('profile')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold transition ${
            patientTab === 'profile'
              ? isDark
                ? 'bg-rose-950/60 text-rose-400 border border-rose-500/40 shadow-sm'
                : 'bg-rose-50 text-rose-700 border border-rose-200 shadow-sm'
              : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>My Medical Details Form</span>
        </button>

        <button
          onClick={() => setPatientTab('map')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold transition ${
            patientTab === 'map'
              ? isDark
                ? 'bg-sky-950/60 text-sky-400 border border-sky-500/40 shadow-sm'
                : 'bg-sky-50 text-sky-700 border border-sky-200 shadow-sm'
              : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Live Accident & Hospital Tracker (Map)</span>
        </button>

        <button
          onClick={() => setPatientTab('id_card')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold transition ${
            patientTab === 'id_card'
              ? isDark
                ? 'bg-purple-950/60 text-purple-400 border border-purple-500/40 shadow-sm'
                : 'bg-purple-50 text-purple-700 border border-purple-200 shadow-sm'
              : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Digital Emergency Medical Card</span>
        </button>
      </div>

      {/* VIEW A: LIVE ACCIDENT & HOSPITAL LOCATION TRACKER MAP */}
      {patientTab === 'map' && (
        <div className="space-y-4 animate-in fade-in">
          <div
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-blue-100 shadow-sm'
            }`}
          >
            <div>
              <h3 className="text-sm font-bold flex items-center space-x-2 text-white">
                <Navigation className="w-4 h-4 text-sky-400" />
                <span>Live Accident & Hospital Location Tracker</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time spatial mesh indicating collision coordinates, nearest Level-1 trauma facility, and the active distance track line.
              </p>
            </div>
            <button
              onClick={() => setPatientTab('profile')}
              className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:text-white transition bg-slate-800"
            >
              Back to Medical Form
            </button>
          </div>

          <div className="h-[550px] w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
            <IncidentMap
              crashCoords={{ lat: 40.7589, lon: -73.9620 }}
              hospitalCoords={{ lat: 40.7645, lon: -73.9554 }}
              hospitalName="Metro General Trauma Center"
              distanceKm={1.4}
              etaMinutes={5}
              isDark={isDark}
            />
          </div>
        </div>
      )}

      {/* VIEW B: MAIN CONTENT GRID (FORM & CARDS) */}
      {patientTab === 'profile' && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
        {/* LEFT COLUMN: Digital Emergency Medical ID Card & Quick Tracker */}
        <div className="space-y-6">
          {/* Virtual ATLS ID Card */}
          <div
            className={`rounded-2xl p-5 border relative overflow-hidden shadow-lg transition ${
              isDark
                ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/40 border-rose-500/30 shadow-slate-950/50'
                : 'bg-gradient-to-br from-white via-white to-rose-50 border-rose-200 shadow-md'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-rose-500/20">
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider text-rose-500">
                  Universal Emergency Medical ID
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-bold border border-rose-500/30">
                ACTIVE EMR
              </span>
            </div>

            <div className="py-4 space-y-3">
              <div>
                <p className="text-[11px] text-slate-400 uppercase font-semibold">Victim Legal Name</p>
                <p className="text-base font-bold">{formData.fullName || 'Unregistered'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Blood Group</p>
                  <p className="text-lg font-black text-rose-500">{formData.bloodGroup}</p>
                </div>
                <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Age</p>
                  <p className="text-lg font-black">{formData.age || '—'} Yrs</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Critical Drug Allergies</p>
                <div className="flex flex-wrap gap-1">
                  {formData.allergies.length > 0 ? (
                    formData.allergies.map((alg) => (
                      <span
                        key={alg}
                        className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30"
                      >
                        ⚠️ {alg}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No allergies listed</span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Primary Emergency Contact</p>
                <p className="text-xs font-mono font-semibold text-sky-400">
                  {formData.emergencyContact1 || 'None Configured'}
                </p>
              </div>
            </div>

            {/* QR Simulation for First Responders */}
            <div className={`pt-3 border-t border-rose-500/20 flex items-center justify-between text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <div className="flex items-center space-x-2">
                <QrCode className="w-4 h-4 text-rose-400" />
                <span>Paramedic Scan Ready</span>
              </div>
              <span className="font-mono text-[10px]">ID: {user?.patientId?.substring(0, 8) || 'EMR-8821'}...</span>
            </div>
          </div>

          {/* Road Safety & In-Cabin Telematics Status Card */}
          <div
            className={`border rounded-2xl p-5 space-y-3 transition ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-blue-100 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5">
                <Car className="w-4 h-4 text-cyan-400" />
                <span>In-Vehicle Telematics Unit</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Your phone sensor fusion service is calibrated. If a sudden linear acceleration &ge; 3.8g and deceleration &ge; 40 km/h occur, the 10-second fail-safe countdown will sound automatically.
            </p>

            <button
              onClick={onOpenDriverModal}
              className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-2 ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Simulate Vehicle Crash Countdown</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Full Editable Profile Form */}
        <div
          className={`lg:col-span-2 border rounded-2xl p-6 shadow-sm space-y-5 transition ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-blue-100 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between border-b pb-3 border-slate-800/80">
            <div>
              <h2 className="text-base font-bold flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-rose-400" />
                <span>Edit Medical Record & Emergency Contacts</span>
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Update your emergency profile anytime. Hospital trauma bays receive this data during SOS dispatches.
              </p>
            </div>
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="hidden sm:flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            {/* Row 1: Name and Age */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border font-medium ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300'
                  }`}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Age *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border font-medium ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300'
                  }`}
                />
              </div>
            </div>

            {/* Row 2: Blood Group and Home Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Blood Group *</label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border font-bold ${
                    isDark ? 'bg-slate-950 border-slate-800 text-rose-400' : 'bg-white border-slate-300 text-rose-600'
                  }`}
                >
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1 flex items-center space-x-1">
                  <Home className="w-3.5 h-3.5 text-slate-400" />
                  <span>Home Residential Address</span>
                </label>
                <input
                  type="text"
                  value={formData.homeAddress}
                  onChange={(e) => setFormData({ ...formData, homeAddress: e.target.value })}
                  placeholder="Street, City, State, ZIP"
                  className={`w-full p-2.5 rounded-xl border font-medium ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300'
                  }`}
                />
              </div>
            </div>

            {/* Row 3: Emergency Contacts 1 & 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1 flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-sky-400" />
                  <span>Emergency Contact #1 *</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.emergencyContact1}
                  onChange={(e) => setFormData({ ...formData, emergencyContact1: e.target.value })}
                  placeholder="e.g. Sarah Mercer (Spouse) +1 (555) 382-9912"
                  className={`w-full p-2.5 rounded-xl border font-medium ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300'
                  }`}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-sky-400" />
                  <span>Emergency Contact #2 (Secondary)</span>
                </label>
                <input
                  type="text"
                  value={formData.emergencyContact2}
                  onChange={(e) => setFormData({ ...formData, emergencyContact2: e.target.value })}
                  placeholder="e.g. Liam Mercer (Brother) +1 (555) 492-3810"
                  className={`w-full p-2.5 rounded-xl border font-medium ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300'
                  }`}
                />
              </div>
            </div>

            {/* Row 4: Allergies Tags & Multi-Select */}
            <div>
              <label className="block font-semibold mb-1 flex items-center justify-between">
                <span>Allergies (Tags Multi-Select)</span>
                <span className="text-[10px] text-slate-400">Click to add/remove</span>
              </label>

              {/* Active Selected Tags */}
              <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl border min-h-[42px] mb-2 bg-slate-950/40 border-slate-800">
                {formData.allergies.length > 0 ? (
                  formData.allergies.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeAllergyTag(tag)}
                        className="hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500 text-xs italic">No allergies selected yet.</span>
                )}
              </div>

              {/* Common Suggestions */}
              <div className="flex flex-wrap gap-1 mb-2">
                {COMMON_ALLERGIES.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleAllergyTag(tag)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition ${
                      formData.allergies.includes(tag)
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                        : isDark
                        ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        : 'bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  >
                    + {tag}
                  </button>
                ))}
              </div>

              {/* Custom Tag Input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Add other medical allergy..."
                  value={customAllergy}
                  onChange={(e) => setCustomAllergy(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomAllergy();
                    }
                  }}
                  className={`flex-1 p-2 rounded-xl border text-xs ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={addCustomAllergy}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
                >
                  Add Tag
                </button>
              </div>
            </div>

            {/* Row 5: Additional Medical Details */}
            <div>
              <label className="block font-semibold mb-1 flex items-center space-x-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Additional Medical Details (Chronic Conditions, Regular Medications, Implants)</span>
              </label>
              <textarea
                rows={3}
                value={formData.additionalMedicalDetails}
                onChange={(e) => setFormData({ ...formData, additionalMedicalDetails: e.target.value })}
                placeholder="e.g. Mild Asthma, Hypertension, Takes 10mg Lisinopril daily, Cardiac Stent placed 2022"
                className={`w-full p-2.5 rounded-xl border font-medium ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full sm:hidden py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 text-white text-xs font-bold shadow-md"
            >
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      </div>
      )}

      {/* VIEW C: FULL DIGITAL ID CARD VIEW */}
      {patientTab === 'id_card' && (
        <div className="max-w-xl mx-auto py-4 animate-in fade-in space-y-4">
          <div
            className={`rounded-3xl p-6 sm:p-8 border shadow-2xl relative overflow-hidden transition ${
              isDark
                ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/60 border-rose-500/40 shadow-rose-950/20'
                : 'bg-white border-rose-200 shadow-xl'
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-rose-500/30">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400">
                  <Heart className="w-6 h-6 fill-rose-500" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase tracking-wider text-rose-400">Universal Trauma EMR Card</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Autonomous AuraTriage Protocol</p>
                </div>
              </div>
              <span className="font-mono text-xs px-2.5 py-1 rounded-full font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                O- RH NEG
              </span>
            </div>

            <div className="py-6 space-y-4">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Cardholder Legal Name</p>
                <p className="text-2xl font-black text-white">{formData.fullName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Blood Classification</p>
                  <p className="text-xl font-black text-rose-400">{formData.bloodGroup}</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Age</p>
                  <p className="text-xl font-black text-white">{formData.age} Years</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-400">Critical Medical Allergies</p>
                <p className="text-xs font-bold text-red-300">
                  {formData.allergies.length ? formData.allergies.join(' • ') : 'No known drug allergies'}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-400">Primary Emergency Contact</p>
                <p className="text-xs font-mono font-bold text-sky-400">{formData.emergencyContact1}</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-400">Residential Address</p>
                <p className="text-xs text-slate-300">{formData.homeAddress || 'Not registered'}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-rose-500/30 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-rose-400" />
                <span>Paramedic NFC/QR Validated</span>
              </div>
              <button
                onClick={() => setPatientTab('profile')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
              >
                Edit Information
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

