import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, HelpCircle, Clock, Lock } from 'lucide-react';
import { AnalysisResult, RISK_LEVEL_META } from '@chaukanna/shared';
import { useLanguage } from '../../context/LanguageContext.js';

interface VerdictBadgeProps {
  result: AnalysisResult;
}

export const VerdictBadge: React.FC<VerdictBadgeProps> = ({ result }) => {
  const { t } = useLanguage();
  const meta = RISK_LEVEL_META[result.riskLevel] || RISK_LEVEL_META.HIGH_RISK;
  const translatedHeadline = t.verdictHeadlines[result.riskLevel] || result.verdictHeadline;
  const translatedBadgeLabel = t.riskLevelLabels[result.riskLevel] || meta.label;

  // Determine badge styling
  const isHighRisk = result.riskLevel === 'HIGH_RISK';
  const isSuspicious = result.riskLevel === 'SUSPICIOUS';
  const isUnverified = result.riskLevel === 'UNVERIFIED';
  const isVerified = result.riskLevel === 'VERIFIED';

  const badgeBgGradient = isHighRisk
    ? 'from-red-600 via-rose-600 to-red-700 text-white'
    : isSuspicious
    ? 'from-amber-500 via-orange-600 to-amber-700 text-white'
    : isUnverified
    ? 'from-yellow-400 via-amber-500 to-yellow-600 text-slate-950'
    : 'from-emerald-600 via-teal-600 to-emerald-700 text-white';

  const containerBorder = isHighRisk
    ? 'border-red-500/40 bg-red-50/40 dark:bg-red-950/20'
    : isSuspicious
    ? 'border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20'
    : isUnverified
    ? 'border-yellow-500/40 bg-yellow-50/40 dark:bg-yellow-950/20'
    : 'border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20';

  return (
    <div className={`rounded-2xl border-2 p-6 transition-all ${containerBorder} shadow-lg`}>
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left side: Score Gauge + Big Badge */}
        <div className="flex items-center gap-5">
          {/* Risk Score Circle Gauge */}
          <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-white dark:bg-slate-900 shadow-md border-4 border-slate-100 dark:border-slate-800 shrink-0">
            <svg className="w-20 h-20 -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="currentColor"
                strokeWidth="7"
                className="text-slate-200 dark:text-slate-800"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke={meta.accentColor}
                strokeWidth="7"
                strokeDasharray={200}
                strokeDashoffset={200 - (200 * result.riskScore) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-xl font-black text-slate-900 dark:text-white leading-none">
                {result.riskScore}
              </span>
              <span className="text-[10px] font-bold text-slate-400">/ 100</span>
            </div>
          </div>

          {/* Big Risk Label */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-extrabold text-sm sm:text-base tracking-wider uppercase shadow-md bg-gradient-to-r ${badgeBgGradient}`}
              >
                <span>{meta.emoji}</span>
                <span>{translatedBadgeLabel}</span>
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-snug">
              {translatedHeadline}
            </h2>
          </div>
        </div>

        {/* Right side: Ephemeral audit stamp */}
        <div className="flex flex-wrap lg:flex-col items-start lg:items-end gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Zero Data Stored • Ephemeral</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span>Audit Latency: {result.processingTimeMs} ms</span>
          </div>
        </div>
      </div>

      {/* Summary Narrative */}
      <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-800/80 text-sm font-medium text-slate-700 dark:text-slate-300">
        <p>{result.summaryExplanation}</p>
      </div>
    </div>
  );
};
