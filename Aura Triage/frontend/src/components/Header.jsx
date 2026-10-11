import React from 'react';
import { Activity, Radio, Car, Hospital, Sun, Moon } from 'lucide-react';
import ServerClock from './ServerClock';

export default function Header({
  hospitalName = "Metro General Trauma Center",
  traumaLevel = "Level-1",
  activeCount = 0,
  isConnected = true,
  onOpenDriverModal,
  activeTab = 'triage',
  setActiveTab,
  isDark = true,
  setIsDark,
}) {
  const isCritical = activeCount > 0;

  return (
    <header
      className={`h-16 w-full px-4 sm:px-6 flex items-center justify-between select-none z-30 shadow-sm border-b transition ${
        isDark
          ? 'bg-slate-900/95 border-slate-800 text-slate-100 backdrop-blur-md'
          : 'bg-white border-blue-100 text-slate-900'
      }`}
    >
      {/* Left Section: Logo, Hospital, Trauma Level & Navigation Tabs */}
      <div className="flex items-center space-x-4 sm:space-x-6">
        {/* App Logo */}
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              isCritical
                ? 'bg-red-500/20 text-red-400 ring-2 ring-red-500/50 animate-pulse'
                : isDark
                ? 'bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20'
                : 'bg-blue-50 text-blue-600 ring-1 ring-blue-500/20'
            }`}
          >
            <Activity className="w-5 h-5 stroke-[2.5]" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-black tracking-tight">
                Aura<span className={isDark ? "text-cyan-400" : "text-blue-600"}>Triage</span>
              </h1>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border ${
                  isDark
                    ? 'bg-slate-800 text-cyan-400 border-slate-700'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                ER-OPERATIONS
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {hospitalName}
              </span>
              <span>•</span>
              <span className="px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 font-bold text-[10px]">
                {traumaLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Section Tabs */}
        <div
          className={`hidden lg:flex items-center space-x-1 p-1 rounded-xl border ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}
        >
          <button
            onClick={() => setActiveTab('triage')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'triage'
                ? isDark
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-white text-blue-600 shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Hospital className="w-3.5 h-3.5" />
            <span>ER Triage Bay</span>
          </button>

          <button
            onClick={() => setActiveTab('driver')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'driver'
                ? isDark
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-white text-blue-600 shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Driver Safety Unit</span>
          </button>
        </div>
      </div>

      {/* Right Section: 10s Crash Button, Telemetry Indicator, Isolated Clock, Theme Toggle, Emergency Badge */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Trigger Driver Crash (10s Countdown) */}
        <button
          onClick={onOpenDriverModal}
          className="flex items-center space-x-2 px-3 sm:px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-95 text-white text-xs font-bold shadow-md shadow-red-600/30 transition border border-red-500"
          title="Trigger a vehicle collision test with a 10-second fail-safe countdown"
        >
          <Car className="w-4 h-4 animate-bounce" />
          <span className="hidden sm:inline">Simulate Impact (10s SOS)</span>
          <span className="sm:hidden">10s SOS</span>
        </button>

        {/* Telemetrics Connection Status */}
        <div
          className={`hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full border ${
            isDark
              ? 'bg-slate-950/80 border-slate-800 text-slate-300'
              : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full ${
                isConnected ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            {isConnected && (
              <span className="animate-ping absolute inline-flex h-3.5 w-3.5 rounded-full bg-emerald-400 opacity-40" />
            )}
          </div>
          <span className="text-xs font-medium">
            {isConnected ? 'Broker Live' : 'Connecting...'}
          </span>
        </div>

        {/* ISOLATED MICRO-COMPONENT CLOCK (Prevents parent & map re-renders) */}
        <ServerClock isDark={isDark} />

        {/* Operations Dark / Light Theme Toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          className={`p-2 rounded-xl border transition ${
            isDark
              ? 'bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-700'
              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
          }`}
          title={isDark ? "Switch to Light Mode" : "Switch to Operations Dark Mode"}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Active Emergency Count Badge */}
        <div
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border font-mono font-bold text-xs tracking-wider transition-all ${
            isCritical
              ? 'bg-red-500/20 text-red-400 border-red-500/50 shadow-sm animate-pulse'
              : isDark
              ? 'bg-slate-800 text-slate-400 border-slate-700'
              : 'bg-slate-50 text-slate-600 border-slate-200'
          }`}
        >
          <Radio className={`w-3.5 h-3.5 ${isCritical ? 'text-red-400 animate-spin' : 'text-slate-400'}`} />
          <span className="hidden md:inline">
            {activeCount > 0 ? `${activeCount} ACTIVE CRASH` : '0 QUEUED'}
          </span>
          <span className="md:hidden">{activeCount}</span>
        </div>
      </div>
    </header>
  );
}
