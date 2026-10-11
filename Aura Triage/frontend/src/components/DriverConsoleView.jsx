import React, { useState } from 'react';
import { Car, Gauge, AlertTriangle, ShieldCheck, Play, RotateCcw, Send, Volume2, ShieldAlert, CheckCircle } from 'lucide-react';

export default function DriverConsoleView({ onTriggerCrashWithParams, isDark = true }) {
  const [selectedPreset, setSelectedPreset] = useState('highway');

  const presets = {
    highway: {
      title: 'Highway Barrier Collision',
      preSpeed: 94.5,
      impactSpeed: 6.2,
      peakG: 4.85,
      lat: 40.7589,
      lon: -73.9620,
      description: 'High-speed interstate impact with rapid deceleration (>85 km/h drop in 0.8s) and 4.85g linear spike.',
    },
    intersection: {
      title: 'Urban Intersection T-Bone',
      preSpeed: 62.0,
      impactSpeed: 10.5,
      peakG: 4.10,
      lat: 40.7640,
      lon: -73.9710,
      description: 'Arterial intersection lateral impact triggering deceleration & linear vector thresholds.',
    },
    minor: {
      title: 'Minor Parking Curb Bump',
      preSpeed: 18.0,
      impactSpeed: 12.0,
      peakG: 1.45,
      lat: 40.7550,
      lon: -73.9650,
      description: 'Low-speed impact below physics thresholds (Δv < 40 km/h, G < 3.8g). Demonstrates false positive rejection.',
    },
  };

  const current = presets[selectedPreset];

  const handleLaunchSimulation = () => {
    onTriggerCrashWithParams(current);
  };

  return (
    <div
      className={`h-full w-full overflow-y-auto p-4 sm:p-6 space-y-6 transition ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Title Card */}
      <div
        className={`border rounded-2xl p-6 shadow-sm transition ${
          isDark
            ? 'bg-slate-900/90 border-slate-800 shadow-slate-950/40'
            : 'bg-white border-blue-100 shadow-sm'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div
              className={`p-3 rounded-xl ${
                isDark ? 'bg-cyan-500/10 text-cyan-400' : 'bg-blue-50 text-blue-600'
              }`}
            >
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                Driver Safety & In-Vehicle Telemetry Unit
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Simulate collision sensor fusion and test the 10-second fail-safe confirmation protocol.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-full flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Edge Diagnostics Active</span>
          </span>
        </div>
      </div>

      {/* Physics Threshold Validation Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Trigger Rule 1 */}
        <div
          className={`border rounded-2xl p-5 shadow-sm space-y-2 transition ${
            isDark
              ? 'bg-slate-900/90 border-slate-800'
              : 'bg-white border-blue-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Trigger Condition 1</span>
            <span
              className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                isDark
                  ? 'bg-slate-800 text-sky-400 border-slate-700'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}
            >
              Δv ≥ 40 km/h in 1.0s
            </span>
          </div>
          <h3 className="text-sm font-bold">Severe Vehicular Deceleration</h3>
          <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Tracks high-rate GPS speed drop across a sliding 1000ms window. Prevents false triggers from standard hard braking.
          </p>
        </div>

        {/* Trigger Rule 2 */}
        <div
          className={`border rounded-2xl p-5 shadow-sm space-y-2 transition ${
            isDark
              ? 'bg-slate-900/90 border-slate-800'
              : 'bg-white border-blue-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Trigger Condition 2</span>
            <span
              className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                isDark
                  ? 'bg-red-950/40 text-red-400 border-red-800/40'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}
            >
              G ≥ 3.8g (~37.2 m/s²)
            </span>
          </div>
          <h3 className="text-sm font-bold">Chassis Linear Acceleration Spike</h3>
          <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Gravity-compensated linear accelerometer vector magnitude. Prevents false triggers from dropped devices.
          </p>
        </div>
      </div>

      {/* Preset Scenario Selector */}
      <div
        className={`border rounded-2xl p-6 shadow-sm space-y-5 transition ${
          isDark
            ? 'bg-slate-900/90 border-slate-800'
            : 'bg-white border-blue-100'
        }`}
      >
        <h3 className="text-sm font-bold uppercase tracking-wider">
          Select Collision Simulation Scenario
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.entries(presets).map(([key, data]) => (
            <button
              key={key}
              onClick={() => setSelectedPreset(key)}
              className={`p-4 rounded-xl border-2 text-left transition ${
                selectedPreset === key
                  ? isDark
                    ? 'border-cyan-500 bg-cyan-950/20 shadow-md'
                    : 'border-blue-600 bg-blue-50/50 shadow-sm'
                  : isDark
                  ? 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs">{data.title}</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                    data.peakG >= 3.8 && (data.preSpeed - data.impactSpeed) >= 40
                      ? isDark
                        ? 'bg-red-950/60 text-red-400 border-red-800/50'
                        : 'bg-red-100 text-red-800 border-red-200'
                      : isDark
                      ? 'bg-slate-800 text-slate-400 border-slate-700'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {data.peakG}g
                </span>
              </div>
              <div
                className={`text-[11px] space-y-1 font-mono ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                <div>Speed: {data.preSpeed} → {data.impactSpeed} km/h</div>
                <div>Δv: {(data.preSpeed - data.impactSpeed).toFixed(1)} km/h</div>
              </div>
            </button>
          ))}
        </div>

        {/* Selected Scenario Details & Launch Button */}
        <div
          className={`border rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 ${
            isDark
              ? 'bg-slate-950/80 border-slate-800'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div>
            <span className="text-xs font-bold block">{current.title}</span>
            <p className={`text-xs mt-0.5 max-w-xl ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {current.description}
            </p>
          </div>

          <button
            onClick={handleLaunchSimulation}
            className="w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-95 text-white font-bold text-sm rounded-xl shadow-md shadow-red-600/30 flex items-center justify-center space-x-2.5 whitespace-nowrap"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Launch Crash Test (10s Fail-Safe)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
