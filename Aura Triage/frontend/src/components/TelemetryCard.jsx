import React from 'react';
import { Gauge, Zap, TrendingDown, Cpu } from 'lucide-react';

export default function TelemetryCard({
  preCrashSpeed = 88.4,
  terminalSpeed = 8.2,
  peakGForce = 4.65,
  isDark = true,
}) {
  const deltaV = Math.max(0, preCrashSpeed - terminalSpeed);
  const exceedsDecelThreshold = deltaV >= 40.0;
  const exceedsGThreshold = peakGForce >= 3.8;

  return (
    <div
      className={`rounded-2xl p-5 shadow-sm relative overflow-hidden transition ${
        isDark
          ? 'bg-slate-900/90 border border-slate-800 text-slate-100 shadow-slate-950/40'
          : 'bg-white border border-blue-100/90 text-slate-900 shadow-blue-900/5'
      }`}
    >
      {/* Top Accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-amber-500" />

      {/* Card Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div
            className={`p-2 rounded-xl ${
              isDark ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50 text-rose-600'
            }`}
          >
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <h2
              className={`text-xs font-bold uppercase tracking-wider ${
                isDark ? 'text-slate-200' : 'text-slate-900'
              }`}
            >
              Crash Telemetry & Kinematics
            </h2>
            <span
              className={`text-[10px] font-medium ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Autonomous Vehicular Sensor Fusion
            </span>
          </div>
        </div>
        <span
          className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-bold ${
            isDark
              ? 'bg-slate-800 text-slate-300 border-slate-700'
              : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}
        >
          DUAL SENSORS ACTIVE
        </span>
      </div>

      {/* 3 Bold Metrics Horizontally */}
      <div className="grid grid-cols-3 gap-3">
        {/* Metric 1: Pre-Crash Speed */}
        <div
          className={`border rounded-xl p-3 text-center transition ${
            isDark
              ? 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              : 'bg-slate-50 border-slate-200 hover:border-slate-300'
          }`}
        >
          <span
            className={`text-[10px] font-bold uppercase tracking-tight block mb-1 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Pre-Crash Speed
          </span>
          <div className="flex items-baseline justify-center space-x-1">
            <span
              className={`text-2xl font-black font-mono tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              {Number(preCrashSpeed).toFixed(1)}
            </span>
            <span
              className={`text-[10px] font-bold font-mono ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              km/h
            </span>
          </div>
          <span
            className={`text-[10px] mt-1 block font-medium ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            T - 1.0s Window
          </span>
        </div>

        {/* Metric 2: Terminal Speed */}
        <div
          className={`border rounded-xl p-3 text-center transition ${
            isDark
              ? 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              : 'bg-slate-50 border-slate-200 hover:border-slate-300'
          }`}
        >
          <span
            className={`text-[10px] font-bold uppercase tracking-tight block mb-1 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Terminal Speed
          </span>
          <div className="flex items-baseline justify-center space-x-1">
            <span
              className={`text-2xl font-black font-mono tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              {Number(terminalSpeed).toFixed(1)}
            </span>
            <span
              className={`text-[10px] font-bold font-mono ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              km/h
            </span>
          </div>
          <span
            className={`text-[10px] mt-1 block font-medium ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            Post-Impact Rest
          </span>
        </div>

        {/* Metric 3: Peak Vector (G-force) - HIGHLIGHTED IN RED */}
        <div
          className={`border-2 rounded-xl p-3 text-center shadow-sm relative ${
            isDark
              ? 'bg-red-950/30 border-red-500/80 shadow-red-950/50'
              : 'bg-red-50 border-red-500 shadow-sm'
          }`}
        >
          <div className="absolute -top-2.5 right-1.5 bg-red-600 text-[8px] font-mono font-black text-white px-1.5 py-0.2 rounded-full uppercase tracking-tight">
            CRITICAL SPIKE
          </div>
          <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-tight block mb-1">
            Peak Vector
          </span>
          <div className="flex items-baseline justify-center space-x-1">
            <span className="text-2xl font-black font-mono text-red-600 dark:text-red-400 tracking-tight">
              {Number(peakGForce).toFixed(2)}
            </span>
            <span className="text-sm font-black text-red-600 dark:text-red-400 font-mono">
              g
            </span>
          </div>
          <span className="text-[10px] text-red-500 dark:text-red-300 font-mono mt-0.5 block font-bold">
            ~{(peakGForce * 9.807).toFixed(1)} m/s²
          </span>
        </div>
      </div>

      {/* Physics Validation Footnote */}
      <div
        className={`mt-3.5 border rounded-xl px-3.5 py-2 flex items-center justify-between text-xs ${
          isDark
            ? 'bg-slate-950/80 border-slate-800'
            : 'bg-blue-50/60 border-blue-100'
        }`}
      >
        <div className="flex items-center space-x-2">
          <TrendingDown className={`w-3.5 h-3.5 ${isDark ? 'text-amber-400' : 'text-blue-600'}`} />
          <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
            Decel Delta: <strong className="font-mono text-amber-500">{deltaV.toFixed(1)} km/h</strong> (Threshold ≥ 40)
          </span>
        </div>
        <span
          className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono border ${
            exceedsDecelThreshold && exceedsGThreshold
              ? isDark
                ? 'bg-emerald-950/50 text-emerald-400 border-emerald-500/40'
                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : 'bg-slate-200 text-slate-700 border-slate-300'
          }`}
        >
          CRITERIA MET
        </span>
      </div>
    </div>
  );
}
