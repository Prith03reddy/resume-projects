import React from 'react';
import { Sparkles, ShieldAlert, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';
import { useAnalysis } from '../context/AnalysisContext.js';
import { DEMO_SAMPLES } from '@chaukanna/shared';

export const HeroBanner: React.FC = () => {
  const { t } = useLanguage();
  const { loadDemoById, loading, activeDemo } = useAnalysis();

  return (
    <div className="relative overflow-hidden pt-8 pb-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-emerald-50/60 via-slate-50 to-white dark:from-slate-900/60 dark:via-slate-950 dark:to-slate-950 border-b border-slate-200/70 dark:border-slate-800/80">
      <div className="max-w-5xl mx-auto text-center">
        {/* Core Tagline Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/90 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60 text-xs sm:text-sm font-bold tracking-wide uppercase shadow-xs mb-4">
          <ShieldAlert className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{t.tagline}</span>
        </div>

        {/* Main Title & Statement */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
          Pre-Transaction Financial Safety
        </h1>

        <p className="text-lg sm:text-xl font-semibold text-emerald-700 dark:text-emerald-400 max-w-2xl mx-auto mb-2">
          &ldquo;AI does the reading. Evidence does the verdict.&rdquo;
        </p>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-6">
          {t.subtagline} Check investment schemes, stock tips, loan promises, and payment handles against official SEBI &amp; RBI regulatory registries before moving a single rupee.
        </p>

        {/* Quick Demo CTA Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-2xl mx-auto">
          <button
            onClick={() => loadDemoById('demo-scam-classic')}
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-sm shadow-lg shadow-red-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{t.demoBtn} (40% Returns VIP Scam)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Scenario Presets Pills */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-slate-400 dark:text-slate-500 font-medium">Or test scenarios:</span>
          {DEMO_SAMPLES.map((demo) => (
            <button
              key={demo.id}
              onClick={() => loadDemoById(demo.id)}
              disabled={loading}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                activeDemo?.id === demo.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400'
              }`}
            >
              {demo.badge}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
