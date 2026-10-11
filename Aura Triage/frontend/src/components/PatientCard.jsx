import React from 'react';
import { User, Droplet, AlertCircle, Phone, HeartPulse, MapPin, Navigation, Radio, ExternalLink } from 'lucide-react';

export default function PatientCard({
  patient = {
    fullName: "Alex Mercer",
    age: 34,
    bloodGroup: "O-",
    allergies: ["Penicillin", "Sulfa Drugs"],
    chronicConditions: ["Mild Asthma", "Hypertension"],
    emergencyContactName: "Sarah Mercer (Spouse)",
    emergencyContactPhone: "+1 (555) 382-9912",
  },
  patientCoords = { latitude: 40.7589, longitude: -73.9620 },
  isDark = true,
}) {
  const safePatLat = parseFloat(patientCoords?.latitude ?? patientCoords?.lat ?? 40.7589);
  const safePatLon = parseFloat(patientCoords?.longitude ?? patientCoords?.lon ?? -73.9620);
  return (
    <div
      className={`rounded-2xl p-5 shadow-sm relative overflow-hidden transition ${
        isDark
          ? 'bg-slate-900/90 border border-slate-800 text-slate-100 shadow-slate-950/40'
          : 'bg-white border border-blue-100/90 text-slate-900 shadow-blue-900/5'
      }`}
    >
      {/* Top Clinical Cyan Accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600" />

      {/* Card Header & Blood Group Badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div
            className={`p-2 rounded-xl ${
              isDark ? 'bg-cyan-500/10 text-cyan-400' : 'bg-blue-50 text-blue-600'
            }`}
          >
            <HeartPulse className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2
                className={`text-xs font-bold uppercase tracking-wider ${
                  isDark ? 'text-slate-200' : 'text-slate-900'
                }`}
              >
                Patient EMR & Medical Profile
              </h2>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 font-mono font-bold">
                PRIMARY
              </span>
            </div>
            <span
              className={`text-[10px] font-medium ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Verified Electronic Health Record (EHR)
            </span>
          </div>
        </div>

        {/* BLOOD GROUP: Neutral Charcoal Background with Distinct Crimson Accent */}
        <div
          className={`rounded-xl px-3.5 py-1.5 flex items-center space-x-2 border transition ${
            isDark
              ? 'bg-slate-950/90 border-slate-700/80 shadow-inner'
              : 'bg-slate-100 border-slate-300'
          }`}
        >
          <div className="p-1 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <Droplet className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
          </div>
          <div>
            <span
              className={`text-[9px] uppercase font-bold block leading-none tracking-wider ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              BLOOD GROUP
            </span>
            <span className="text-xl font-black font-mono text-rose-500 dark:text-rose-400 leading-none">
              {patient.bloodGroup || "O-"}
            </span>
          </div>
        </div>
      </div>

      {/* Patient Clean List Details */}
      <div
        className={`space-y-3 divide-y text-xs ${
          isDark ? 'divide-slate-800' : 'divide-slate-100'
        }`}
      >
        {/* Name and Age */}
        <div className="pt-1 flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <User className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Full Name:
            </span>
            <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {patient.fullName || "Unregistered Occupant"}
            </span>
          </div>
          <div
            className={`font-mono text-xs px-2.5 py-0.5 rounded-md border font-bold ${
              isDark
                ? 'bg-slate-800/80 text-slate-200 border-slate-700'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            AGE: {patient.age || "--"}
          </div>
        </div>

        {/* PROMINENT REAL-TIME PATIENT GPS LOCATION TELEMETRY ROW */}
        <div className="pt-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5 text-rose-400 font-semibold">
            <MapPin className="w-3.5 h-3.5 text-rose-500 animate-bounce" />
            <span>Patient GPS Fix:</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${safePatLat.toFixed(5)},${safePatLon.toFixed(5)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-md border flex items-center space-x-1 hover:border-sky-400 transition cursor-pointer ${
                isDark
                  ? 'bg-rose-950/40 text-rose-300 border-rose-500/40'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
              title="Open Live Patient GPS Fix in Google Maps"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping inline-block mr-1" />
              <span>{safePatLat.toFixed(4)}° N, {Math.abs(safePatLon).toFixed(4)}° W</span>
              <ExternalLink className="w-2.5 h-2.5 ml-1 text-sky-400" />
            </a>
          </div>
        </div>

        {/* Allergies */}
        <div className="pt-2.5 flex items-start justify-between text-xs">
          <div className="flex items-center space-x-1.5 text-amber-500 font-semibold min-w-[70px]">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Allergies:</span>
          </div>
          <div className="flex flex-wrap gap-1.5 justify-end max-w-[75%]">
            {patient.allergies && patient.allergies.length > 0 ? (
              patient.allergies.map((allergy, idx) => (
                <span
                  key={idx}
                  className={`px-2 py-0.5 rounded-md font-bold text-[11px] border ${
                    isDark
                      ? 'bg-amber-950/40 text-amber-300 border-amber-600/40'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {allergy}
                </span>
              ))
            ) : (
              <span className="text-slate-400 italic">No Known Drug Allergies (NKDA)</span>
            )}
          </div>
        </div>

        {/* Chronic Conditions */}
        <div className="pt-2.5 flex items-start justify-between text-xs">
          <span className={`font-semibold min-w-[90px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Pre-existing:
          </span>
          <div className="flex flex-wrap gap-1.5 justify-end max-w-[75%]">
            {patient.chronicConditions && patient.chronicConditions.length > 0 ? (
              patient.chronicConditions.map((cond, idx) => (
                <span
                  key={idx}
                  className={`px-2 py-0.5 rounded-md font-medium text-[11px] border ${
                    isDark
                      ? 'bg-slate-800 text-slate-300 border-slate-700'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {cond}
                </span>
              ))
            ) : (
              <span className="text-slate-400 italic">None reported</span>
            )}
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="pt-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5 text-emerald-500 font-semibold">
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>ICE Contact:</span>
          </div>
          <div className="text-right">
            <span className={`font-bold block text-xs ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              {patient.emergencyContactName || "Not Provided"}
            </span>
            <a
              href={`tel:${patient.emergencyContactPhone}`}
              className="font-mono text-cyan-400 dark:text-cyan-400 hover:underline font-bold text-[11px]"
            >
              {patient.emergencyContactPhone || "--"}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
