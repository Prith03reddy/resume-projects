import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AlertOctagon, ShieldX, Send, BellRing, Car, Volume2, VolumeX, CheckCircle, Clock } from 'lucide-react';

export default function DriverCountdownModal({
  isOpen,
  onClose,
  onDispatchConfirmed,
  defaultTelemetry = {},
  isDark = true,
}) {
  const [mounted, setMounted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(10);
  const [isMuted, setIsMuted] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [isDispatched, setIsDispatched] = useState(false);

  // Generate dynamic, realistic crash kinematics whenever impact is simulated
  const generateRandomTelemetry = (base = {}) => {
    const preSpeed = parseFloat((base.preSpeed || (Math.random() * 46 + 74)).toFixed(1)); // 74.0 - 120.0 km/h
    const impactSpeed = parseFloat((base.impactSpeed || (Math.random() * 7 + 3.5)).toFixed(1)); // 3.5 - 10.5 km/h
    const peakG = parseFloat((base.peakG || (Math.random() * 2.85 + 3.90)).toFixed(2)); // 3.90g - 6.75g
    const latitude = parseFloat((base.lat || base.latitude || (40.7250 + Math.random() * 0.0520)).toFixed(4));
    const longitude = parseFloat((base.lon || base.longitude || (-73.9920 + Math.random() * 0.0430)).toFixed(4));
    return {
      preSpeed,
      impactSpeed,
      speedDrop: parseFloat((preSpeed - impactSpeed).toFixed(1)),
      peakG,
      latitude,
      longitude,
      lat: latitude,
      lng: longitude,
      lon: longitude,
      randomize: true,
    };
  };

  const [activeTelemetry, setActiveTelemetry] = useState(() => generateRandomTelemetry(defaultTelemetry));
  
  const audioContextRef = useRef(null);
  const intervalRef = useRef(null);
  const audioLoopRef = useRef(null);

  // Ensure DOM is ready for React Portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Synthesize emergency crash siren tone
  const playSirenBurst = useCallback(() => {
    if (isMuted || isCancelled || isDispatched) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.18);
      osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.38);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn('Audio synthesis notice:', e);
    }
  }, [isMuted, isCancelled, isDispatched]);

  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(10);
      setIsCancelled(false);
      setIsDispatched(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioLoopRef.current) clearInterval(audioLoopRef.current);
      return;
    }

    setSecondsLeft(10);
    setIsCancelled(false);
    setIsDispatched(false);
    
    // Generate fresh randomized crash signature for this emergency countdown
    const freshTelemetry = generateRandomTelemetry(defaultTelemetry);
    setActiveTelemetry(freshTelemetry);

    playSirenBurst();

    audioLoopRef.current = setInterval(() => {
      playSirenBurst();
    }, 750);

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          clearInterval(audioLoopRef.current);
          handleAutoDispatch(freshTelemetry);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioLoopRef.current) clearInterval(audioLoopRef.current);
    };
  }, [isOpen]);

  const handleCancelSos = () => {
    setIsCancelled(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (audioLoopRef.current) clearInterval(audioLoopRef.current);
    
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleAutoDispatch = (telemetryToDispatch) => {
    setIsDispatched(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (audioLoopRef.current) clearInterval(audioLoopRef.current);

    onDispatchConfirmed(telemetryToDispatch || activeTelemetry);
    setTimeout(() => {
      onClose();
    }, 1400);
  };

  const handleImmediateDispatch = () => {
    setIsDispatched(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (audioLoopRef.current) clearInterval(audioLoopRef.current);

    onDispatchConfirmed(activeTelemetry);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  if (!isOpen || !mounted) return null;

  const progressPercentage = (secondsLeft / 10) * 100;

  // RENDER DIRECTLY INTO document.body USING REACT PORTAL TO DECOUPLE FROM MAP'S DOM STACKING CONTEXT
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto pointer-events-auto">
      {/* Dimmed Blurred Backdrop behind modal (z-[9998]) */}
      <div 
        className="fixed inset-0 z-[9998] bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={() => {
          // Prevent accidental backdrop closing during critical countdown; require explicit cancel button
        }}
      />

      {/* Modal Dialog (z-[9999]) */}
      <div
        className={`relative z-[9999] rounded-2xl shadow-2xl border-2 border-red-500/60 w-full max-w-lg overflow-hidden flex flex-col transition transform animate-in zoom-in-95 duration-200 ${
          isDark ? 'bg-slate-900 text-slate-100 shadow-red-950/50' : 'bg-white text-slate-900 shadow-xl'
        }`}
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white px-6 py-4 flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl animate-pulse">
              <AlertOctagon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider font-bold text-red-100 flex items-center space-x-1.5">
                <Car className="w-3.5 h-3.5" />
                <span>Vehicle In-Cabin Safety Unit</span>
              </div>
              <h2 className="text-lg font-black tracking-tight">
                COLLISION IMPACT DETECTED
              </h2>
            </div>
          </div>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition text-xs flex items-center space-x-1"
            title={isMuted ? "Unmute Alarm" : "Mute Alarm"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-bounce" />}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {isCancelled ? (
            <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-xl p-4 text-center space-y-1">
              <div className="flex items-center justify-center space-x-2 text-emerald-400 font-bold">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>EMERGENCY ABORTED — FALSE ALARM</span>
              </div>
              <p className="text-xs text-emerald-400/80">
                Cancellation logged locally. No hospital alert dispatched.
              </p>
            </div>
          ) : isDispatched ? (
            <div className="bg-blue-500/10 border border-blue-500/40 rounded-xl p-4 text-center space-y-1">
              <div className="flex items-center justify-center space-x-2 text-sky-400 font-bold">
                <Send className="w-5 h-5 text-sky-400 animate-pulse" />
                <span>SOS DISPATCHED TO TRAUMA CENTER</span>
              </div>
              <p className="text-xs text-sky-400/80">
                Kinematics & EMR payload transmitted to nearest Level-1/2 ER dashboard.
              </p>
            </div>
          ) : (
            <>
              {/* Countdown Dial */}
              <div className="flex flex-col items-center justify-center py-2">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-red-500/20 animate-ping opacity-30" />
                  <div className="absolute inset-0 rounded-full border-4 border-red-500/10" />
                  
                  <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      className={isDark ? "stroke-slate-800 fill-none" : "stroke-slate-100 fill-none"}
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      className="stroke-red-500 fill-none transition-all duration-1000 ease-linear"
                      strokeWidth="8"
                      strokeDasharray="264"
                      strokeDashoffset={264 - (264 * progressPercentage) / 100}
                      strokeLinecap="round"
                    />
                  </svg>

                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-4xl font-black font-mono text-red-500 leading-none">
                      {secondsLeft}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                      SECONDS
                    </span>
                  </div>
                </div>

                <div className="text-center mt-3">
                  <p className="text-sm font-semibold">
                    Fail-Safe Safety Window Active
                  </p>
                  <p className="text-xs text-slate-400 max-w-xs mt-0.5">
                    An 85dB alarm has sounded. If conscious and uninjured, press cancel below.
                  </p>
                </div>
              </div>

              {/* Kinematics Briefing Card */}
              <div
                className={`border rounded-xl p-3.5 text-xs ${
                  isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 font-semibold">
                  <span className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    <span>Impact Telemetry Signature</span>
                  </span>
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded font-mono font-bold text-[10px]">
                    {activeTelemetry.peakG}g FORCE
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className={`p-2 rounded border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    Pre-Crash: <strong className="text-slate-100">{activeTelemetry.preSpeed} km/h</strong>
                  </div>
                  <div className={`p-2 rounded border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    Terminal: <strong className="text-slate-100">{activeTelemetry.impactSpeed} km/h</strong>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="space-y-2.5 pt-1">
                <button
                  onClick={handleCancelSos}
                  className={`w-full py-4 px-5 rounded-xl font-bold text-base transition flex items-center justify-center space-x-2.5 shadow-sm border ${
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  }`}
                >
                  <ShieldX className="w-5 h-5 text-slate-400" />
                  <span>I'M OK — CANCEL SOS (FALSE ALARM)</span>
                </button>

                <button
                  onClick={handleImmediateDispatch}
                  className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white transition flex items-center justify-center space-x-2 shadow-md shadow-red-600/30"
                >
                  <Send className="w-4 h-4 text-white" />
                  <span>BYPASS TIMER & DISPATCH NOW</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div
          className={`border-t px-6 py-2.5 text-[11px] text-center flex items-center justify-center space-x-1.5 ${
            isDark ? 'bg-slate-950/80 border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}
        >
          <BellRing className="w-3.5 h-3.5 text-sky-400" />
          <span>AuraTriage Emergency Protocol • Direct Level-1/2 Dispatch</span>
        </div>
      </div>
    </div>,
    document.body
  );
}
