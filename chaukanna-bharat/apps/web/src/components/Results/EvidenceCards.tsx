import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, ExternalLink, Scale, ShieldAlert } from 'lucide-react';
import { EvidenceCard, EvidenceSeverity } from '@chaukanna/shared';
import { useLanguage } from '../../context/LanguageContext.js';

interface EvidenceCardsProps {
  evidenceCards: EvidenceCard[];
}

export const EvidenceCards: React.FC<EvidenceCardsProps> = ({ evidenceCards }) => {
  const { t } = useLanguage();

  const getSeverityBadge = (severity: EvidenceSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300 border border-red-300 dark:border-red-800">
            <AlertCircle className="w-3 h-3" />
            CRITICAL VIOLATION
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <AlertTriangle className="w-3 h-3" />
            SUSPICIOUS SIGNAL
          </span>
        );
      case 'POSITIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            AUTHENTIC SIGNAL
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
            INFO
          </span>
        );
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Scale className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>{t.sections.evidenceTitle}</span>
        </h3>
        <span className="text-xs font-semibold text-slate-400">
          {evidenceCards.length} verifiable evidence points
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {evidenceCards.map((card) => {
          const isCritical = card.severity === 'CRITICAL';
          const isPositive = card.severity === 'POSITIVE';

          return (
            <div
              key={card.id}
              className={`rounded-xl border p-4 transition-all shadow-xs ${
                isCritical
                  ? 'border-red-200 dark:border-red-900/60 bg-red-50/20 dark:bg-red-950/15'
                  : isPositive
                  ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/15'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{card.title}</span>
                </h4>
                {getSeverityBadge(card.severity)}
              </div>

              {/* Finding Description */}
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mb-2 leading-relaxed">
                {card.finding}
              </p>

              {/* Quoted extract if present */}
              {card.quote && (
                <div className="mb-2.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border-l-4 border-slate-400 dark:border-slate-600 text-xs font-mono text-slate-800 dark:text-slate-200">
                  Evidence quote: &ldquo;{card.quote}&rdquo;
                </div>
              )}

              {/* Statutory regulation and verification link */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
                {card.regulationClause && (
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="font-semibold text-[11px]">Law / Regulation:</span>
                    <span className="text-[11px] italic">{card.regulationClause}</span>
                  </div>
                )}

                {card.recommendedVerificationUrl && (
                  <a
                    href={card.recommendedVerificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <span>Check Official Registry</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
