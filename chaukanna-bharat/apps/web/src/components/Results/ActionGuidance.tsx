import React from 'react';
import { ShieldAlert, PhoneCall, Download, CheckCircle, ExternalLink, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.js';
import { OFFICIAL_PORTALS } from '@chaukanna/shared';

interface ActionGuidanceProps {
  adviceList: string[];
  riskLevel: string;
  onOpenReportModal: () => void;
}

export const ActionGuidance: React.FC<ActionGuidanceProps> = ({
  adviceList,
  riskLevel,
  onOpenReportModal,
}) => {
  const { t } = useLanguage();
  const isHighRisk = riskLevel === 'HIGH_RISK';

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldAlert className={`w-5 h-5 ${isHighRisk ? 'text-red-500' : 'text-emerald-500'}`} />
          <span>{t.sections.actionTitle}</span>
        </h3>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          {t.tagline}
        </span>
      </div>

      {/* Actionable Steps List */}
      <div className="space-y-2.5">
        {adviceList.map((adv, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 p-3 rounded-lg text-xs sm:text-sm font-medium ${
              isHighRisk && idx === 0
                ? 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-900 dark:text-red-200 font-bold'
                : 'bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200'
            }`}
          >
            <span
              className={`flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold shrink-0 ${
                isHighRisk && idx === 0
                  ? 'bg-red-600 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {idx + 1}
            </span>
            <p className="leading-relaxed">{adv}</p>
          </div>
        ))}
      </div>

      {/* Immediate Emergency Reporting Actions */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          {/* 1930 Dial Helpline */}
          <a
            href="tel:1930"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Dial Cyber Helpline 1930</span>
          </a>

          {/* Cybercrime Portal Link */}
          <a
            href={OFFICIAL_PORTALS.CYBERCRIME_PORTAL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <span>cybercrime.gov.in</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Download Report Modal Trigger */}
        <button
          onClick={onOpenReportModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{t.actions.downloadReport}</span>
        </button>
      </div>
    </div>
  );
};
