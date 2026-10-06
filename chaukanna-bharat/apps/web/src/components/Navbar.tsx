import React from 'react';
import { ShieldCheck, PhoneCall, Database, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';
import { SupportedLanguage } from '@chaukanna/shared';

interface NavbarProps {
  onOpenRegistry: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenRegistry }) => {
  const { currentLanguage, setLanguage, availableLanguages, t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-md shadow-emerald-900/20">
            <ShieldCheck className="w-6 h-6" />
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-emerald-800 to-teal-700 dark:from-white dark:via-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
                CHAUKANNA BHARAT
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                PROTOTYPE
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden md:block">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cyber helpline quick button */}
          <a
            href="tel:1930"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50 text-xs font-semibold hover:bg-red-100 transition-colors shadow-xs"
            title="National Cyber Crime Helpline"
          >
            <PhoneCall className="w-3.5 h-3.5 text-red-600 animate-pulse" />
            <span className="hidden sm:inline">Helpline:</span>
            <span>1930</span>
          </a>

          {/* Registry Explorer Modal trigger */}
          <button
            onClick={onOpenRegistry}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden md:inline">Verify</span> Registries
          </button>

          {/* Multilingual Selector */}
          <div className="relative flex items-center">
            <Globe className="w-4 h-4 absolute left-2.5 text-slate-400 pointer-events-none" />
            <select
              value={currentLanguage}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              className="pl-8 pr-7 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
            >
              {Object.values(availableLanguages).map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeName} ({lang.label})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
              ▼
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
