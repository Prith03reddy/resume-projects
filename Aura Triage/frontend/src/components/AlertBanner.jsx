import React from 'react';
import { AlertTriangle, Siren, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function AlertBanner({
  isVisible,
  peakG = 4.6,
  etaMinutes = 7,
  isAcknowledged = false,
  onAcknowledge,
}) {
  if (!isVisible) return null;

  return (
    <div className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-xl px-4 sm:px-6 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-3 select-none transition-all z-20 border-b border-red-700">
      {/* Left side: Pulsing Warning Icon & Core Text */}
      <div className="flex items-center space-x-3.5">
        <div className="bg-black/25 p-2 rounded-xl backdrop-blur-sm flex items-center justify-center border border-white/10">
          <Siren className="w-5 h-5 text-white animate-bounce" />
        </div>
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="font-mono text-sm sm:text-base font-extrabold text-white tracking-wide uppercase">
              SEVERE IMPACT DETECTED [{peakG}g] — ETA: [{etaMinutes} MINS]
            </span>
            <span className="hidden sm:inline-flex items-center text-[10px] font-mono bg-black/30 text-red-100 px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-white/10">
              AUTONOMOUS DISPATCH
            </span>
          </div>
          <p className="text-xs text-red-100/90 hidden md:block">
            Impact kinematics & deceleration drop verified. Automated trauma corridor cleared.
          </p>
        </div>
      </div>

      {/* Right side: High-contrast Charcoal/Black Button with Emerald Accents to prevent Green-on-Red visual vibration */}
      <div>
        <button
          onClick={onAcknowledge}
          disabled={isAcknowledged}
          className={`flex items-center space-x-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm tracking-wide shadow-md transition-all uppercase ${
            isAcknowledged
              ? 'bg-slate-950 text-emerald-400 border border-emerald-500/70 shadow-lg shadow-black/40 cursor-default ring-1 ring-emerald-500/30'
              : 'bg-white hover:bg-slate-100 text-red-700 active:scale-95 border border-white shadow-lg'
          }`}
        >
          {isAcknowledged ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-mono tracking-wider font-extrabold">
                ICU PREP IN PROGRESS
              </span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4 text-red-600 fill-red-100" />
              <span>Acknowledge & Prep ICU</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
