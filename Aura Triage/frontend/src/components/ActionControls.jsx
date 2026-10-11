import React, { useState } from 'react';
import { BedDouble, CheckCircle2, BellRing, Syringe, RotateCcw, ShieldCheck } from 'lucide-react';

export default function ActionControls({
  incidentStatus = 'TRIGGERED',
  onReserveBay,
  onReleaseBay,
  isReserving = false,
  isDark = true,
}) {
  const [toastMessage, setToastMessage] = useState(null);
  const isPrepared = incidentStatus === 'PREPARED';

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div
      className={`rounded-2xl p-5 shadow-sm space-y-3.5 relative transition ${
        isDark
          ? 'bg-slate-900/90 border border-slate-800 text-slate-100 shadow-slate-950/40'
          : 'bg-white border border-blue-100/90 text-slate-900 shadow-blue-900/5'
      }`}
    >
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg z-30 animate-in fade-in duration-200 border border-slate-700">
          {toastMessage}
        </div>
      )}

      {/* Header and Status Indicator */}
      <div className="flex items-center justify-between">
        <h2
          className={`text-xs font-bold uppercase tracking-wider flex items-center space-x-2 ${
            isDark ? 'text-slate-200' : 'text-slate-900'
          }`}
        >
          <span>ER Response & Bay Allocation</span>
        </h2>
        <span
          className={`font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${
            isPrepared
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/40 animate-pulse'
          }`}
        >
          STATUS: {incidentStatus}
        </span>
      </div>

      {/* AFFORDANCE VS STATUS SEPARATION:
          When Prepared, render a solid Status Confirmation Card (NOT a misleading button)
          When Unprepared, render an active Action Button to reserve */}
      {isPrepared ? (
        <div
          className={`rounded-xl p-4 border transition flex flex-col space-y-2 ${
            isDark
              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
              : 'bg-emerald-50 border-emerald-300 text-emerald-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 bg-emerald-500 text-slate-950 rounded-lg">
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wide block">
                  TRAUMA BAY 4 ALLOCATED & PREPARED
                </span>
                <span
                  className={`text-[10px] block ${
                    isDark ? 'text-emerald-400/80' : 'text-emerald-700'
                  }`}
                >
                  Ventilator & surgical suction primed • Arrival in transit
                </span>
              </div>
            </div>

            {/* Explicit Undo/Modify Action */}
            <button
              onClick={onReleaseBay}
              className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition flex items-center space-x-1 ${
                isDark
                  ? 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
              title="Release bay or adjust emergency bed allocation"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Modify</span>
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={onReserveBay}
          disabled={isReserving}
          className="w-full py-4 px-4 rounded-xl font-bold text-sm tracking-wide shadow-md transition-all flex items-center justify-center space-x-2.5 uppercase bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white shadow-blue-600/30 border border-blue-500"
        >
          <BedDouble className="w-5 h-5 text-white" />
          <span>{isReserving ? 'Allocating Bay & Priming Ventilator...' : 'Reserve Trauma Bay 4'}</span>
        </button>
      )}

      {/* SECONDARY ACTIONS: Consistent brand/slate styling (No confusing red) */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          onClick={() => triggerToast('📢 Emergency Alert broadcast to On-Call Trauma & Neuro Surgeons.')}
          className={`flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl text-xs font-bold border transition ${
            isDark
              ? 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border-slate-700'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
          }`}
        >
          <BellRing className={`w-3.5 h-3.5 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} />
          <span>Page Trauma Team</span>
        </button>

        <button
          onClick={() => triggerToast('🩸 Blood Bank order placed: 2x O- Units reserved for Trauma Bay 4.')}
          className={`flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl text-xs font-bold border transition ${
            isDark
              ? 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border-slate-700'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
          }`}
        >
          <Syringe className={`w-3.5 h-3.5 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} />
          <span>Order O- Blood</span>
        </button>
      </div>
    </div>
  );
}
