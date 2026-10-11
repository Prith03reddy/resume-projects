import React from 'react';
import {
  Activity,
  Radio,
  Car,
  Hospital,
  Sun,
  Moon,
  Shield,
  User,
  LogOut,
  Users,
  Repeat,
} from 'lucide-react';
import ServerClock from './ServerClock';
import { useAuth } from '../context/AuthContext';

export default function Header({
  hospitalName = 'Metro General Trauma Center',
  traumaLevel = 'Level-1',
  activeCount = 0,
  isConnected = true,
  onOpenDriverModal,
  onOpenLoginModal,
  activeTab = 'triage',
  setActiveTab,
  isDark = true,
  setIsDark,
}) {
  const { user, logout, loginDemo } = useAuth();
  const isCritical = activeCount > 0;
  const currentRole = user?.role || 'HOSPITAL';

  return (
    <header
      className={`min-h-16 w-full px-3 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2.5 select-none z-30 shadow-sm border-b transition ${
        isDark
          ? 'bg-slate-900/95 border-slate-800 text-slate-100 backdrop-blur-md'
          : 'bg-white border-blue-100 text-slate-900'
      }`}
    >
      {/* Left Section: Logo, Hospital, Trauma Level & Navigation Tabs */}
      <div className="flex items-center space-x-3 sm:space-x-5">
        {/* App Logo */}
        <div className="flex items-center space-x-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
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
              <h1 className="text-sm sm:text-base font-black tracking-tight">
                Aura<span className={isDark ? 'text-cyan-400' : 'text-blue-600'}>Triage</span>
              </h1>
              {/* Active Role Indicator */}
              <span
                className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold border uppercase ${
                  currentRole === 'ADMIN'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : currentRole === 'PATIENT'
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                }`}
              >
                {currentRole}
              </span>
            </div>
            <div className="flex items-center space-x-1.5 text-xs">
              <span className={`font-semibold text-[11px] truncate max-w-[140px] sm:max-w-none ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {currentRole === 'HOSPITAL' ? hospitalName : user?.name || 'Authorized Session'}
              </span>
              {currentRole === 'HOSPITAL' && (
                <>
                  <span>•</span>
                  <span className="px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 font-bold text-[9px]">
                    {traumaLevel}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Section Tabs (When in Hospital View) */}
        {currentRole === 'HOSPITAL' && (
          <div
            className={`hidden xl:flex items-center space-x-1 p-1 rounded-xl border ${
              isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              onClick={() => setActiveTab('triage')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
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
              <span>ER Command</span>
            </button>

            <button
              onClick={() => setActiveTab('driver')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
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
              <span>Driver Unit</span>
            </button>
          </div>
        )}
      </div>

      {/* Right Section: Impact Simulator Button, Role Switcher, Clock, Theme Toggle, Emergency Badge */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Trigger Driver Crash (10s Countdown) */}
        <button
          onClick={onOpenDriverModal}
          className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-95 text-white text-xs font-bold shadow-md shadow-red-600/30 transition border border-red-500"
          title="Trigger a vehicle collision test with a 10-second fail-safe countdown"
        >
          <Car className="w-3.5 h-3.5 animate-bounce" />
          <span className="hidden sm:inline">Simulate Impact (10s SOS)</span>
          <span className="sm:hidden">10s SOS</span>
        </button>

        {/* Quick Role Switcher (1-Click Switch Dropdown/Buttons) */}
        <div className="flex items-center space-x-1 border-l border-r px-1.5 sm:px-2 border-slate-800/80">
          <button
            onClick={() => loginDemo('HOSPITAL')}
            className={`px-2 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition flex items-center space-x-1 ${
              currentRole === 'HOSPITAL'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Switch to Hospital Command"
          >
            <span>🚑</span>
            <span className="hidden sm:inline">Hospital</span>
          </button>
          <button
            onClick={() => loginDemo('PATIENT')}
            className={`px-2 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition flex items-center space-x-1 ${
              currentRole === 'PATIENT'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Switch to Patient Portal"
          >
            <span>👤</span>
            <span className="hidden sm:inline">Patient</span>
          </button>
          <button
            onClick={() => loginDemo('ADMIN')}
            className={`px-2 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition flex items-center space-x-1 ${
              currentRole === 'ADMIN'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Switch to System Admin"
          >
            <span>🛡️</span>
            <span className="hidden sm:inline">Admin</span>
          </button>
        </div>

        {/* Switch / Sign In Modal Button */}
        <button
          onClick={onOpenLoginModal}
          className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition ${
            isDark
              ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
          }`}
          title="Open Role Selection & Login Gateway"
        >
          <Repeat className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden md:inline">Switch Role</span>
        </button>

        {/* ISOLATED MICRO-COMPONENT CLOCK */}
        <ServerClock isDark={isDark} />

        {/* Operations Dark / Light Theme Toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          className={`p-2 rounded-xl border transition ${
            isDark
              ? 'bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-700'
              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
          }`}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Operations Dark Mode'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Active Emergency Count Badge */}
        <div
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border font-mono font-bold text-xs tracking-wider transition-all ${
            isCritical
              ? 'bg-red-500/20 text-red-400 border-red-500/50 shadow-sm animate-pulse'
              : isDark
              ? 'bg-slate-800 text-slate-400 border-slate-700'
              : 'bg-slate-50 text-slate-600 border-slate-200'
          }`}
        >
          <Radio className={`w-3.5 h-3.5 ${isCritical ? 'text-red-400 animate-spin' : 'text-slate-400'}`} />
          <span className="hidden md:inline">
            {activeCount > 0 ? `${activeCount} ACTIVE` : '0 QUEUED'}
          </span>
          <span className="md:hidden">{activeCount}</span>
        </div>
      </div>
    </header>
  );
}
