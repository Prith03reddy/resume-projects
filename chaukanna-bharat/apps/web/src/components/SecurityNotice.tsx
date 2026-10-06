import React from 'react';
import { ShieldCheck, Lock, EyeOff, AlertTriangle, Scale } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';
import { DISCLAIMER_ZERO_SPECULATION } from '@chaukanna/shared';

export const SecurityNotice: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
          Chaukanna Bharat Guardrails &amp; Privacy Architecture
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Guardrail 1: Zero Storage */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
            <EyeOff className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Zero Data Storage</span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            {t.guardrails.privacyNotice} Messages, images, and numbers are processed in ephemeral volatile memory and immediately purged.
          </p>
        </div>

        {/* Guardrail 2: Zero Trading & Speculation */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
            <Scale className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Zero Speculation Mandate</span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            {DISCLAIMER_ZERO_SPECULATION} We evaluate transactional fraud signals and official licenses, not asset prices.
          </p>
        </div>

        {/* Guardrail 3: Never asks for Credentials / OTP */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
            <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Credential Defense</span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Chaukanna Bharat will never ask for your passwords, OTPs, PINs, or CVV. If any message asks for these, it is a guaranteed fraud signal.
          </p>
        </div>
      </div>
    </div>
  );
};
