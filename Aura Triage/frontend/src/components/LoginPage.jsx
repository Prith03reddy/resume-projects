import React, { useState } from 'react';
import {
  Shield,
  Hospital,
  User,
  Lock,
  Mail,
  AlertCircle,
  CheckCircle2,
  HeartPulse,
  Activity,
  ArrowRight,
  UserPlus,
  LogIn,
  KeyRound,
  Sparkles,
  Phone,
  MapPin,
  FileText,
  Tag,
  X,
  Plus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
  'No Known Drug Allergies',
];

const BLOOD_GROUPS = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export default function LoginPage({ isDark = true, onCancel }) {
  const { login, registerPatient, loginDemo, isLoading, authError, setAuthError } = useAuth();

  const [selectedRole, setSelectedRole] = useState('HOSPITAL'); // 'HOSPITAL' | 'PATIENT' | 'ADMIN'
  const [isRegistering, setIsRegistering] = useState(false);

  // Standard Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Patient Registration fields
  const [regForm, setRegForm] = useState({
    name: '',
    age: '',
    bloodGroup: 'O-',
    allergies: ['Penicillin'],
    chronicConditions: ['None Reported'],
    homeAddress: '',
    emergencyContact1: '',
    emergencyContact2: '',
    additionalMedicalDetails: '',
    email: '',
    password: '',
  });

  const [customAllergy, setCustomAllergy] = useState('');
  const [customCondition, setCustomCondition] = useState('');

  // Populate pre-filled demo email when switching role tab
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setIsRegistering(false);
    setAuthError(null);
    if (role === 'HOSPITAL') {
      setEmail('staff@metrogeneral.org');
      setPassword('hospital123');
    } else if (role === 'ADMIN') {
      setEmail('admin@auratriage.org');
      setPassword('admin123');
    } else {
      setEmail('alex.mercer@gmail.com');
      setPassword('patient123');
    }
  };

  const handleDemoLogin = async (roleName) => {
    try {
      await loginDemo(roleName);
      if (onCancel) onCancel();
    } catch (e) {
      console.warn('Demo login notice:', e);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password, selectedRole);
      if (onCancel) onCancel();
    } catch {
      // Error handled in AuthContext
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerPatient(regForm);
      if (onCancel) onCancel();
    } catch {
      // Error handled in AuthContext
    }
  };

  const toggleAllergyTag = (tag) => {
    setRegForm((prev) => {
      const exists = prev.allergies.includes(tag);
      return {
        ...prev,
        allergies: exists ? prev.allergies.filter((t) => t !== tag) : [...prev.allergies, tag],
      };
    });
  };

  const addCustomAllergy = () => {
    if (!customAllergy.trim()) return;
    if (!regForm.allergies.includes(customAllergy.trim())) {
      setRegForm((prev) => ({ ...prev, allergies: [...prev.allergies, customAllergy.trim()] }));
    }
    setCustomAllergy('');
  };

  const addCustomCondition = () => {
    if (!customCondition.trim()) return;
    if (!regForm.chronicConditions.includes(customCondition.trim())) {
      setRegForm((prev) => ({ ...prev, chronicConditions: [...prev.chronicConditions, customCondition.trim()] }));
    }
    setCustomCondition('');
  };

  return (
    <div
      className={`w-full flex items-center justify-center p-3 sm:p-6 transition-colors duration-200 select-none ${
        onCancel ? 'max-h-[92vh] overflow-y-auto' : 'min-h-screen'
      } ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}
    >
      <div className="w-full max-w-xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Header */}
        <div className="relative text-center space-y-1.5">
          <div className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-blue-500/20 to-rose-500/20 border border-cyan-500/30 shadow-lg">
            <Activity className="w-7 h-7 text-cyan-400 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Aura<span className="text-cyan-400">Triage</span> Secure Gateway
          </h1>
          <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Role-Based Access Control • Autonomous Golden-Hour Emergency Protocol
          </p>
        </div>

        {/* Card Container */}
        <div
          className={`border rounded-2xl shadow-xl overflow-hidden backdrop-blur-md transition relative ${
            isDark ? 'bg-slate-900/90 border-slate-800 shadow-slate-950/50' : 'bg-white border-blue-100 shadow-xl'
          }`}
        >
          {/* Modal Title & Dedicated Close Header Bar */}
          <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold uppercase text-cyan-400">
                Authentication Portal
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Select Role to Proceed</span>
            </div>
            <button
              type="button"
              onClick={() => {
                if (onCancel) onCancel();
                else handleDemoLogin('HOSPITAL');
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-900/80 border border-slate-700 hover:border-rose-500/50 text-slate-200 hover:text-white transition flex items-center space-x-1.5 shadow-sm text-xs font-bold cursor-pointer"
              title="Close this portal and return to dashboard"
            >
              <X className="w-3.5 h-3.5 text-rose-400" />
              <span>Close</span>
            </button>
          </div>

          {/* Role Selection Tabs */}
          <div className={`grid grid-cols-3 p-2 border-b gap-1.5 ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100/90 border-slate-200'}`}>
            <button
              type="button"
              onClick={() => handleRoleSelect('HOSPITAL')}
              className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl text-xs font-bold transition duration-150 ${
                selectedRole === 'HOSPITAL'
                  ? isDark
                    ? 'bg-cyan-950/50 text-cyan-400 shadow-md border border-cyan-500/50 ring-1 ring-cyan-500/20'
                    : 'bg-white text-cyan-700 shadow-sm border border-cyan-200 ring-1 ring-cyan-200'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <div className={`p-1.5 rounded-lg mb-1 ${selectedRole === 'HOSPITAL' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800/40 text-slate-400'}`}>
                <Hospital className="w-4 h-4" />
              </div>
              <span className="font-extrabold tracking-tight">Hospital Staff</span>
              <span className="text-[10px] opacity-75 font-normal hidden sm:inline">ER Trauma Hub</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('PATIENT')}
              className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl text-xs font-bold transition duration-150 ${
                selectedRole === 'PATIENT'
                  ? isDark
                    ? 'bg-rose-950/50 text-rose-400 shadow-md border border-rose-500/50 ring-1 ring-rose-500/20'
                    : 'bg-white text-rose-700 shadow-sm border border-rose-200 ring-1 ring-rose-200'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <div className={`p-1.5 rounded-lg mb-1 ${selectedRole === 'PATIENT' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800/40 text-slate-400'}`}>
                <User className="w-4 h-4" />
              </div>
              <span className="font-extrabold tracking-tight">Patient Portal</span>
              <span className="text-[10px] opacity-75 font-normal hidden sm:inline">Personal EMR & ID</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('ADMIN')}
              className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl text-xs font-bold transition duration-150 ${
                selectedRole === 'ADMIN'
                  ? isDark
                    ? 'bg-amber-950/50 text-amber-400 shadow-md border border-amber-500/50 ring-1 ring-amber-500/20'
                    : 'bg-white text-amber-700 shadow-sm border border-amber-200 ring-1 ring-amber-200'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <div className={`p-1.5 rounded-lg mb-1 ${selectedRole === 'ADMIN' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800/40 text-slate-400'}`}>
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-extrabold tracking-tight">System Admin</span>
              <span className="text-[10px] opacity-75 font-normal hidden sm:inline">Network Overseer</span>
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-4">
            {/* Quick 1-Click Evaluation Access Button */}
            <div className="p-3.5 rounded-xl border border-dashed flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-blue-950/20 via-purple-950/20 to-rose-950/20 border-slate-700">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
                <div>
                  <p className="text-xs font-bold">1-Click Evaluation Mode</p>
                  <p className="text-[11px] text-slate-400">Click to instantly log in as {selectedRole.toLowerCase()} and enter the dashboard.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDemoLogin(selectedRole)}
                disabled={isLoading}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-md transition active:scale-95 flex items-center justify-center space-x-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-900/30"
              >
                <span>Instant {selectedRole} Access</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Role Purpose Badge */}
            <div
              className={`px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-between border ${
                selectedRole === 'HOSPITAL'
                  ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                  : selectedRole === 'PATIENT'
                  ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              }`}
            >
              <span className="font-semibold">
                {selectedRole === 'HOSPITAL' && '🚑 Hospital Staff: Live GPS Collision Radar & Actionable Prep'}
                {selectedRole === 'PATIENT' && '👤 Patient: Update Medical Details, Allergies, Contacts & Safety'}
                {selectedRole === 'ADMIN' && '🛡️ System Admin: Master Fleet Management & Real-Time Incident Mesh'}
              </span>
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider opacity-80">
                ACTIVE PORTAL
              </span>
            </div>

            {/* Error Notification */}
            {authError && (
              <div className="bg-red-500/15 border border-red-500/40 text-red-300 text-xs p-3 rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{authError}</span>
              </div>
            )}

            {/* Form Switching for Patient Role */}
            {selectedRole === 'PATIENT' && (
              <div className="flex items-center justify-center space-x-2 pb-1">
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    !isRegistering
                      ? isDark ? 'bg-slate-800 text-white border border-slate-700' : 'bg-slate-200 text-slate-900'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => setIsRegistering(true)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                    isRegistering
                      ? isDark ? 'bg-slate-800 text-white border border-slate-700' : 'bg-slate-200 text-slate-900'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register as New Patient</span>
                </button>
              </div>
            )}

            {/* A. PATIENT REGISTRATION FORM */}
            {selectedRole === 'PATIENT' && isRegistering ? (
              <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Full Legal Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Mercer"
                      value={regForm.name}
                      onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
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
                      placeholder="e.g. 34"
                      value={regForm.age}
                      onChange={(e) => setRegForm({ ...regForm, age: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border font-medium ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Blood Group *</label>
                    <select
                      value={regForm.bloodGroup}
                      onChange={(e) => setRegForm({ ...regForm, bloodGroup: e.target.value })}
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
                    <label className="block font-semibold mb-1">Home Address *</label>
                    <input
                      type="text"
                      placeholder="e.g. 124 East 79th St, New York, NY"
                      value={regForm.homeAddress}
                      onChange={(e) => setRegForm({ ...regForm, homeAddress: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border font-medium ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300'
                      }`}
                    />
                  </div>
                </div>

                {/* Emergency Contacts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Emergency Contact #1 *</label>
                    <input
                      type="text"
                      required
                      placeholder="Sarah Mercer (Spouse) +1 555-382-9912"
                      value={regForm.emergencyContact1}
                      onChange={(e) => setRegForm({ ...regForm, emergencyContact1: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border font-medium ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Emergency Contact #2 (Optional)</label>
                    <input
                      type="text"
                      placeholder="David Mercer (Brother) +1 555-492-3810"
                      value={regForm.emergencyContact2}
                      onChange={(e) => setRegForm({ ...regForm, emergencyContact2: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border font-medium ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300'
                      }`}
                    />
                  </div>
                </div>

                {/* Allergies Multi-Select / Tags */}
                <div>
                  <label className="block font-semibold mb-1.5 flex items-center justify-between">
                    <span>Medical Allergies (Click to toggle tags)</span>
                    <span className="text-[10px] text-slate-400">Critical for ATLS prep</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {COMMON_ALLERGIES.map((tag) => {
                      const selected = regForm.allergies.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleAllergyTag(tag)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition border ${
                            selected
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm'
                              : isDark
                              ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                              : 'bg-slate-100 border-slate-200 text-slate-600'
                          }`}
                        >
                          {selected ? '✓ ' : '+ '}
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Add custom allergy tag..."
                      value={customAllergy}
                      onChange={(e) => setCustomAllergy(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomAllergy(); }}}
                      className={`flex-1 p-2 rounded-xl border text-xs ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={addCustomAllergy}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Additional Medical Details */}
                <div>
                  <label className="block font-semibold mb-1">Additional Medical Details / Conditions</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Mild Asthma, Hypertension, Pacemaker, Daily Metoprolol"
                    value={regForm.additionalMedicalDetails}
                    onChange={(e) => setRegForm({ ...regForm, additionalMedicalDetails: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border font-medium ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300'
                    }`}
                  />
                </div>

                {/* Account Credentials */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-800/60">
                  <div>
                    <label className="block font-semibold mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="name@email.com"
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border font-medium ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Portal Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={regForm.password}
                      onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border font-medium ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300'
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-lg shadow-rose-600/30 transition flex items-center justify-center space-x-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isLoading ? 'Creating Medical Profile...' : 'Complete Registration & Enter Portal'}</span>
                </button>
              </form>
            ) : (
              /* B. UNIFIED LOGIN FORM */
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>User Email</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="user@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full p-3 rounded-xl border text-sm font-medium transition ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-cyan-500' : 'bg-white border-slate-300 focus:border-blue-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 flex items-center space-x-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Password</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full p-3 rounded-xl border text-sm font-medium transition ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-cyan-500' : 'bg-white border-slate-300 focus:border-blue-500'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-white shadow-lg transition flex items-center justify-center space-x-2 ${
                    selectedRole === 'HOSPITAL'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-600/25'
                      : selectedRole === 'PATIENT'
                      ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-rose-600/25'
                      : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-600/25'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isLoading ? 'Authenticating...' : `Log In as ${selectedRole}`}</span>
                </button>
              </form>
            )}

            {/* Quick 1-Click Demo Accounts for Judges / Hackathon Evaluation */}
            <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center space-x-1 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Instant 1-Click Evaluation Accounts</span>
                </span>
                <span>Click to switch</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('HOSPITAL')}
                  className={`p-2.5 rounded-xl border text-left transition flex flex-col space-y-1 ${
                    isDark
                      ? 'bg-slate-950/80 hover:bg-cyan-950/30 border-slate-800 hover:border-cyan-500/50'
                      : 'bg-slate-50 hover:bg-blue-50 border-slate-200'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-cyan-400 flex items-center space-x-1">
                    <Hospital className="w-3 h-3" />
                    <span>Hospital Staff</span>
                  </span>
                  <span className="text-xs font-semibold truncate">Metro General ER</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('PATIENT')}
                  className={`p-2.5 rounded-xl border text-left transition flex flex-col space-y-1 ${
                    isDark
                      ? 'bg-slate-950/80 hover:bg-rose-950/30 border-slate-800 hover:border-rose-500/50'
                      : 'bg-slate-50 hover:bg-rose-50 border-slate-200'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-rose-400 flex items-center space-x-1">
                    <User className="w-3 h-3" />
                    <span>Patient Portal</span>
                  </span>
                  <span className="text-xs font-semibold truncate">Alex Mercer (O-)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('ADMIN')}
                  className={`p-2.5 rounded-xl border text-left transition flex flex-col space-y-1 ${
                    isDark
                      ? 'bg-slate-950/80 hover:bg-amber-950/30 border-slate-800 hover:border-amber-500/50'
                      : 'bg-slate-50 hover:bg-amber-50 border-slate-200'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center space-x-1">
                    <Shield className="w-3 h-3" />
                    <span>System Admin</span>
                  </span>
                  <span className="text-xs font-semibold truncate">Master Overseer</span>
                </button>
              </div>

              {/* Bottom Dismiss / Return Link */}
              <div className="pt-3 text-center border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => {
                    if (onCancel) onCancel();
                    else handleDemoLogin('HOSPITAL');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/80 transition inline-flex items-center space-x-1.5 border border-slate-700/60"
                >
                  <X className="w-3.5 h-3.5 text-rose-400" />
                  <span>Dismiss Window & Return to Live ER Dashboard</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

